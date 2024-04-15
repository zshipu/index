import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.7.3/+esm';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
import { Howl } from 'https://cdn.jsdelivr.net/npm/howler@2.2.3/+esm';
import { getGPUTier } from 'https://cdn.jsdelivr.net/npm/detect-gpu@5.0.17/+esm';

const container = document.querySelector('.container');
const canvas = document.querySelector('.canvas');

let
  gpuTier,
  sizes,
  scene,
  camera,
  camY,
  camZ,
  renderer,
  clock,
  raycaster,
  distance,
  flyingIn,
  clouds,
  movingCharDueToDistance,
  movingCharTimeout,
  currentPos,
  currentLookAt,
  lookAtPosZ,
  thirdPerson,
  doubleSpeed,
  character,
  charPosYIncrement,
  charRotateYIncrement,
  charRotateYMax,
  mixer,
  charAnimation,
  gliding,
  charAnimationTimeout,
  charNeck,
  charBody,
  gltfLoader,
  grassMeshes,
  treeMeshes,
  centerTile,
  tileWidth,
  amountOfHexInTile,
  simplex,
  maxHeight,
  snowHeight,
  lightSnowHeight,
  rockHeight,
  forestHeight,
  lightForestHeight,
  grassHeight,
  sandHeight,
  shallowWaterHeight,
  waterHeight,
  deepWaterHeight,
  textures,
  terrainTiles,
  activeTile,
  activeKeysPressed,
  bgMusic,
  muteBgMusic,
  infoModalDisplayed,
  loadingDismissed;

// 异步设置场景的函数
const setScene = async () => {

  // 获取GPU等级
  gpuTier = await getGPUTier();
  console.log(gpuTier.tier);

  // 获取容器的尺寸
  sizes = {
    width: container.offsetWidth,
    height: container.offsetHeight
  };

  // 创建一个新场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5e6d3); // 设置场景背景颜色

  // 初始化一些变量
  flyingIn = true;
  camY = 160,
    camZ = -190;
  camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 300); // 创建透视相机
  camera.position.set(0, camY, camZ);// 设置相机的初始位置

  // 创建WebGL渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));// 设置像素比例
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // 设置色调映射
  renderer.outputEncoding = THREE.sRGBEncoding;// 设置输出编码
  clock = new THREE.Clock();// 创建时钟对象，用于计算时间

  // 添加半球光到场景中
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5));

  // 创建GLTF加载器
  gltfLoader = new GLTFLoader();

  // 初始化一些控制和状态变量
  activeKeysPressed = [];
  muteBgMusic = true;
  infoModalDisplayed = false;

  // 初始化游戏手柄
  joystick();
  setFog();// 设置雾效
  setRaycast();// 设置射线检测
  setTerrainValues(); // 设置地形值
  await setClouds(); // 设置云朵
  await setCharacter(); // 设置角色
  await setGrass(); // 设置草地
  await setTrees();// 设置树木
  setCam();// 设置相机
  createTile(); // 创建瓦片
  createSurroundingTiles(`{"x":${centerTile.xFrom},"y":${centerTile.yFrom}}`);// 创建周围瓦片
  calcCharPos(); // 计算角色位置
  resize(); // 调整大小
  listenTo(); // 监听事件
  render();// 渲染场景

  // 暂停图标动画
  pauseIconAnimation();
  checkLoadingPage();// 检查加载页面

}

// joystick函数用于设置并初始化游戏手柄
const joystick = () => {
  // 定义计算游戏手柄方向的函数
  const calcJoystickDir = (deg) => {
    // activeKeysPressed数组用于存储当前按下的键
    activeKeysPressed = [];

    // 根据游戏手柄的角度设置相应的方向键
    if (deg < 22.5 || deg >= 337.5) activeKeysPressed.push(39); // 右方向键
    if (deg >= 22.5 && deg < 67.5) {
      activeKeysPressed.push(38); // 上方向键
      activeKeysPressed.push(39); // 右方向键
    }
    if (deg >= 67.5 && deg < 112.5) activeKeysPressed.push(38); // 上方向键
    if (deg >= 112.5 && deg < 157.5) {
      activeKeysPressed.push(38); // 上方向键
      activeKeysPressed.push(37); // 左方向键
    }
    if (deg >= 157.5 && deg < 202.5) activeKeysPressed.push(37); // 左方向键
    if (deg >= 202.5 && deg < 247.5) {
      activeKeysPressed.push(40); // 下方向键
      activeKeysPressed.push(37); // 左方向键
    }
    if (deg >= 247.5 && deg < 292.5) activeKeysPressed.push(40); // 下方向键
    if (deg >= 292.5 && deg < 337.5) {
      activeKeysPressed.push(40); // 下方向键
      activeKeysPressed.push(39); // 右方向键
    }
  }

  // joystickOptions对象包含游戏手柄的配置参数
  const joystickOptions = {
    zone: document.getElementById('zone-joystick'), // 游戏手柄的区域
    shape: 'circle', // 游戏手柄的形状
    color: '#ffffff6b', // 游戏手柄的颜色
    mode: 'dynamic' // 游戏手柄的模式
  };

  // 使用Nipple.js库创建游戏手柄实例
  const manager = nipplejs.create(joystickOptions);

  // 当游戏手柄移动时，调用calcJoystickDir函数处理方向
  manager.on('move', (e, data) => calcJoystickDir(data.angle.degree));
  // 当游戏手柄停止时，清空activeKeysPressed数组
  manager.on('end', () => (activeKeysPressed = []));
};

// setFog函数用于设置场景中的雾效
const setFog = () => {

  // 修改THREE.js的着色器代码，以便在顶点着色器中添加世界位置变量
  THREE.ShaderChunk.fog_pars_vertex += `
    #ifdef USE_FOG
      varying vec3 vWorldPosition;
    #endif
  `;

  // 修改THREE.js的着色器代码，以便在顶点着色器中计算世界坐标系中的位置
  THREE.ShaderChunk.fog_vertex += `
    #ifdef USE_FOG
      vec4 worldPosition = projectionMatrix * modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
    #endif
  `;

  // 修改THREE.js的着色器代码，以便在片段着色器中添加高度和远近的平滑过渡效果
  THREE.ShaderChunk.fog_pars_fragment += `
    #ifdef USE_FOG
      varying vec3 vWorldPosition;
      float fogHeight = 10.0;
    #endif
  `;

  // 替换原有的雾效应用代码，加入高度和远近的平滑过渡效果
  const FOG_APPLIED_LINE = 'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );';
  THREE.ShaderChunk.fog_fragment = THREE.ShaderChunk.fog_fragment.replace(FOG_APPLIED_LINE, `
    float heightStep = smoothstep(fogHeight, 0.0, vWorldPosition.y);
    float fogFactorHeight = smoothstep( fogNear * 0.7, fogFar, vFogDepth );
    float fogFactorMergeHeight = fogFactorHeight * heightStep;
    
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactorMergeHeight );
    ${FOG_APPLIED_LINE}
  `);

  // 根据GPU等级设置雾效的近远平面距离
  const near =
    gpuTier.tier === 1
      ? 20
      : gpuTier.tier === 2
        ? 60
        : gpuTier.tier === 3
          ? 70
          : 20
  const far =
    gpuTier.tier === 1
      ? 72
      : gpuTier.tier === 2
        ? 100
        : gpuTier.tier === 3
          ? 115
          : 72

  // 创建雾效对象，并将其添加到场景中
  scene.fog = new THREE.Fog(0xf5e6d3, near, far);

}

// setRaycast函数用于设置射线检测，用于拾取场景中的物体
const setRaycast = () => {
  // 扩展Three.js的BufferGeometry类，添加计算边界树的方法，用于加速射线检测
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  // 扩展Three.Mesh类，添加raycast方法，用于射线检测
  THREE.Mesh.prototype.raycast = acceleratedRaycast;

  // 创建一个射线检测器对象
  raycaster = new THREE.Raycaster();
  // 设置射线检测的距离
  distance = 14;
  // 标记是否因为距离而移动角色
  movingCharDueToDistance = false;
  // 设置射线检测器只检测到第一个碰撞点
  raycaster.firstHitOnly = true;
};

// setTerrainValues函数用于设置地形的初始值和相关参数
const setTerrainValues = () => {

  // 根据GPU等级确定中心瓦片的范围
  const centerTileFromTo =
    gpuTier.tier === 1
      ? 15
      : gpuTier.tier === 2
        ? 25
        : gpuTier.tier === 3
          ? 30
          : 15

  // 设置中心瓦片的坐标范围
  centerTile = {
    xFrom: -centerTileFromTo,
    xTo: centerTileFromTo,
    yFrom: -centerTileFromTo,
    yTo: centerTileFromTo
  };

  // 计算瓦片的宽度
  tileWidth = centerTileFromTo * 2;  // 瓦片宽度为范围的两倍
  // 计算一个瓦片中六边形的数量
  amountOfHexInTile = Math.pow((centerTile.xTo + 1) - centerTile.xFrom, 2);  // 六边形数量计算公式
  // 创建Simplex噪声对象，用于生成地形的高度变化
  simplex = new SimplexNoise();
  // 设置地形的最大高度
  maxHeight = 30;
  // 设置不同地形类型的高度阈值
  snowHeight = maxHeight * 0.9;
  lightSnowHeight = maxHeight * 0.8;
  rockHeight = maxHeight * 0.7;
  forestHeight = maxHeight * 0.45;
  lightForestHeight = maxHeight * 0.32;
  grassHeight = maxHeight * 0.22;
  sandHeight = maxHeight * 0.15;
  shallowWaterHeight = maxHeight * 0.1;
  waterHeight = maxHeight * 0.05;
  deepWaterHeight = maxHeight * 0;
  // 设置不同地形类型的纹理颜色
  textures = {
    snow: new THREE.Color(0xE5E5E5),
    lightSnow: new THREE.Color(0x73918F),
    rock: new THREE.Color(0x2A2D10),
    forest: new THREE.Color(0x224005),
    lightForest: new THREE.Color(0x367308),
    grass: new THREE.Color(0x98BF06),
    sand: new THREE.Color(0xE3F272),
    shallowWater: new THREE.Color(0x3EA9BF),
    water: new THREE.Color(0x00738B),
    deepWater: new THREE.Color(0x015373)
  };
  // 初始化地形瓦片数组
  terrainTiles = [];

}

// setClouds函数用于创建和管理场景中的云朵
const setClouds = async () => {

  // 初始化云朵数组，用于存储场景中的所有云朵对象
  clouds = []
  // 定义场景中云朵的数量
  const amountOfClouds = 10;

  // createClouds函数用于异步加载云朵模型，并返回云朵对象数组
  const createClouds = async () => {

    // 创建一个数组用于存储加载的云朵模型
    const cloudModels = [];
    // 定义云朵模型的路径
    const cloudModelPaths = [
      'assets/clouds/cloud-one/scene.gltf',
      'assets/clouds/cloud-two/scene.gltf'
    ];

    // 异步加载云朵模型，并存储到数组中
    for (let i = 0; i < cloudModelPaths.length; i++)
      cloudModels[i] = await gltfLoader.loadAsync(cloudModelPaths[i]);

    // 返回加载完成的云朵模型数组
    return cloudModels;

  }

  // 定义一个函数用于生成随机数，用于设置云朵的初始位置
  const getRandom = (max, min) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // 调用createClouds函数，获取云朵模型
  const cloudModels = await createClouds();

  // 循环创建场景中的云朵
  for (let i = 0; i < Math.floor(amountOfClouds / 2) * 2; i++) {

    let cloud;

    // 根据加载的云朵模型创建新的云朵对象
    if (i < Math.floor(amountOfClouds / 2)) { // 创建第一种类型的云朵
      cloud = cloudModels[0].scene.clone();
      cloud.scale.set(5.5, 5.5, 5.5);// 设置云朵的缩放
      cloud.rotation.y = cloud.rotation.z = -(Math.PI / 2);// 设置云朵的旋转
    }
    else { // 创建第二种类型的云朵
      cloud = cloudModels[1].scene.clone();
      cloud.scale.set(0.02, 0.02, 0.02); // 设置云朵的缩放
      cloud.rotation.y = cloud.rotation.z = 0; // 设置云朵的旋转
    }

    // 设置云朵的名称
    cloud.name = `cloud-${i}`
    // 随机设置云朵的初始位置    
    cloud.position.set(
      getRandom(-20, 20),
      getRandom(camY - 90, camY - 110),
      getRandom(camZ + 200, camZ + 320)
    );

    // 将创建的云朵添加到场景中  
    scene.add(cloud);
    // 将云朵对象添加到云朵数组中   
    clouds.push(cloud);

  }

  return;

}

// animateClouds函数用于给场景中的云朵添加动画效果，使云朵产生移动
const animateClouds = () => {

  // 遍历clouds数组中的每个云朵对象
  for (let i = 0; i < clouds.length; i++) {
    // 获取当前云朵对象
    const cloud = clouds[i];
    // 计算云朵的新位置，根据云朵移动的速度和已经过去的时间
    cloud.position.x =
      cloud.position.x < 0
        ? cloud.position.x - (clock.getElapsedTime() * 0.04) // 如果云朵位置小于0，则向左移动
        : cloud.position.x + (clock.getElapsedTime() * 0.04); // 否则向右移动

    // 使用Three.js的Clock类来获取从动画开始到当前经过的时间
  }

}

// cleanUpClouds函数用于在云朵动画完成后进行清理工作，并开始播放背景音乐
const cleanUpClouds = () => {
  // 设置flyingIn为false，表示云朵动画已完成
  flyingIn = false;
  // 调用playMusic函数来播放背景音乐
  playMusic();

  // 遍历clouds数组中的每个云朵对象
  for (let i = 0; i < clouds.length; i++) {
    // 使用cleanUp函数来清理云朵对象，释放相关资源
    const cloud = scene.getObjectByProperty('name', `cloud-${i}`); // 通过名称获取云朵对象    
    cleanUp(cloud);// 清理云朵对象 
  }

  // 清理clouds数组，释放内存  
  clouds = undefined;

}
// setCharAnimation 函数用于设置角色的动画效果，包括播放、停止和动画之间的切换。
const setCharAnimation = () => {
  // 定义动画的最小和最大等待时间，用于控制动画播放的随机性。
  const min = 3;
  const max = 14;

  // 如果之前已经设置了一个动画播放的定时器，则先清除它，以避免多个定时器同时工作。
  if (charAnimationTimeout) clearTimeout(charAnimationTimeout);

  // 定义一个内部函数 interval，用于处理动画的播放逻辑。
  const interval = () => {
    // 如果角色当前不在滑翔状态，则开始播放动画。
    if (!gliding) {
      // 重置动画到初始状态，设置播放速度（根据 doubleSpeed 决定是否加倍速度），
      // 设置动画权重为 1，表示动画将完全影响角色，设置循环模式为重复播放，
      // 淡入动画，然后播放动画。
      charAnimation
        .reset()
        .setEffectiveTimeScale(doubleSpeed ? 2 : 1)
        .setEffectiveWeight(1)
        .setLoop(THREE.LoopRepeat)
        .fadeIn(1)
        .play();
      // 切换滑翔状态标志。
      gliding = !gliding;
    } else {
      // 如果角色正在滑翔，则让动画淡出。
      charAnimation.fadeOut(2);
    }
    // 根据随机时间间隔设置下一次动画播放的时间。
    const randomTime = Math.floor(Math.random() * (max - min + 1) + min);
    // 重新设置定时器，以便在随机时间后再次执行 interval 函数。
    charAnimationTimeout = setTimeout(interval, randomTime * 1000);
  }

  // 启动动画播放逻辑的第一次执行。
  interval();
};

// setCharacter 函数用于加载并设置3D场景中的角色模型
const setCharacter = async () => {
  // 异步加载角色的GLTF模型
  const model = await gltfLoader.loadAsync('assets/bird/scene.gltf');
  // 获取加载模型中的特定对象（这里假设角色在模型的'Cube001_0'对象中）
  const geo = model.scene.getObjectByName('Cube001_0').geometry.clone();
  // 创建角色的3D模型对象
  character = model.scene;

  // 设置角色的初始位置
  character.position.set(0, 25, 0);
  // 设置角色模型的缩放比例
  character.scale.set(1.3, 1.3, 1.3);

  // 初始化角色的垂直位置增量和Y轴旋转增量
  charPosYIncrement = 0;
  charRotateYIncrement = 0;
  charRotateYMax = 0.01; // 设置角色Y轴旋转的最大增量

  // 创建一个动画混合器，用于控制角色的动画
  mixer = new THREE.AnimationMixer(character);
  // 获取模型中的第一个动画剪辑，并创建一个动作来播放它
  charAnimation = mixer.clipAction(model.animations[0]);

  // 获取角色模型中的颈部和身体对象，用于后续的动画控制
  charNeck = character.getObjectByName('Neck_Armature');
  charBody = character.getObjectByName('Armature_rootJoint');

  // 计算几何体的边界树，用于后续的射线检测等操作
  geo.computeBoundsTree();
  // 将角色模型添加到场景中
  scene.add(character);

  // 函数执行完毕，返回无需返回值
};

// setGrass 函数用于初始化场景中的草地覆盖物
const setGrass = async () => {
  // 定义一个对象，用于存储不同类型的草地网格
  grassMeshes = {};
  // 异步加载草地模型
  const model = await gltfLoader.loadAsync('assets/grass/scene.gltf');


  const grassMeshNames = [
    {
      varName: 'grassMeshOne',
      meshName: 'Circle015_Grass_0'
    },
    {
      varName: 'grassMeshTwo',
      meshName: 'Circle018_Grass_0'
    }
  ];

  for (let i = 0; i < grassMeshNames.length; i++) {
    // 获取草地模型中的特定网格对象
    const mesh = model.scene.getObjectByName(grassMeshNames[i].meshName);

    // 克隆草地网格的几何体和材质，用于后续的实例化
    const geo = mesh.geometry.clone();
    const mat = mesh.material.clone();
    // 根据场景中的六边形数量估算实例化草地的数量，创建一个实例化草地网格对象，并存储到grassMeshes中
    grassMeshes[grassMeshNames[i].varName] = new THREE.InstancedMesh(geo, mat, Math.floor(amountOfHexInTile / 40));
  }

  return;

}

// setTrees 函数用于初始化场景中的树木模型
const setTrees = async () => {

  // 定义一个对象，用于存储不同类型的树木网格
  treeMeshes = {};

  // 定义树木模型的名称和路径
  const treeMeshNames = [
    {
      varName: 'treeMeshOne',// 树木网格的变量名
      modelPath: 'assets/trees/pine/scene.gltf', // 树木模型的路径
      meshName: 'Object_4'// 树木网格在GLTF模型中的名称
    },
    {
      varName: 'treeMeshTwo',
      modelPath: 'assets/trees/twisted-branches/scene.gltf',
      meshName: 'Tree_winding_01_Material_0'
    }
  ];

  // 遍历树木模型的名称和路径数组
  for (let i = 0; i < treeMeshNames.length; i++) {
    // 异步加载树木模型
    const model = await gltfLoader.loadAsync(treeMeshNames[i].modelPath);
    // 获取树木模型中的特定网格对象
    const mesh = model.scene.getObjectByName(treeMeshNames[i].meshName);
    // 克隆树木网格的几何体和材质，用于后续的实例化
    const geo = mesh.geometry.clone();
    const mat = mesh.material.clone();
    // 根据场景中的六边形数量估算实例化树木的数量
    const instancesCount = Math.floor(amountOfHexInTile / 45);
    // 创建一个实例化树木网格对象，并存储到treeMeshes中
    treeMeshes[treeMeshNames[i].varName] = new THREE.InstancedMesh(geo, mat, instancesCount);
  }

  return;

}

// setCam 函数用于配置和初始化场景中的相机设置
const setCam = () => {
  // 初始化当前相机位置和目标向量的变量
  currentPos = new THREE.Vector3();
  currentLookAt = new THREE.Vector3();
  // 设置相机的观察目标在Z轴上的距离
  lookAtPosZ = 15;
  // 设置一个标志变量，用于控制是否使用第三人称视角
  thirdPerson = true;
  // 设置一个标志变量，用于控制角色飞行速度的加倍
  doubleSpeed = false;

  // 该函数不需要返回值，它直接设置全局变量并配置相机的行为
};

// createSurroundingTiles 函数用于创建周围的地形瓦片
const createSurroundingTiles = (newActiveTile) => {

  // 解析传入的活动瓦片坐标字符串，获取瓦片的x和y坐标
  // 设置中心瓦片的坐标范围
  const setCenterTile = (parsedCoords) => {
    centerTile = {
      xFrom: parsedCoords.x,
      xTo: parsedCoords.x + tileWidth,
      yFrom: parsedCoords.y,
      yTo: parsedCoords.y + tileWidth
    }
  }

  const parsedCoords = JSON.parse(newActiveTile);

  setCenterTile(parsedCoords);
  // 创建并添加下方的瓦片
  tileYNegative();

  tileXPositive();

  tileYPositive();
  tileYPositive();

  tileXNegative();
  tileXNegative();

  tileYNegative();
  tileYNegative();

  setCenterTile(parsedCoords);

  // 清理不再需要的瓦片
  cleanUpTiles();

  // 更新活动瓦片的坐标
  activeTile = newActiveTile;

}

// 创建并添加下方的瓦片
const tileYNegative = () => {

  centerTile.yFrom -= tileWidth;
  centerTile.yTo -= tileWidth;
  createTile();

}

// 创建并添加上方的瓦片
const tileYPositive = () => {

  centerTile.yFrom += tileWidth;
  centerTile.yTo += tileWidth;
  createTile();

}

// 创建并添加左侧的瓦片
const tileXNegative = () => {

  centerTile.xFrom -= tileWidth;
  centerTile.xTo -= tileWidth;
  createTile();

}

// 创建并添加右侧的瓦片
const tileXPositive = () => {

  centerTile.xFrom += tileWidth;
  centerTile.xTo += tileWidth;
  createTile();

}
// createTile 函数用于创建一个地形瓦片并添加到场景中
const createTile = () => {

  // 定义瓦片的名称，基于当前中心瓦片的坐标生成
  const tileName = JSON.stringify({
    x: centerTile.xFrom,
    y: centerTile.yFrom
  });

  // 检查场景中是否已存在同名的瓦片，如果存在则直接返回
  if (terrainTiles.some(el => el.name === tileName)) return;  // 如果瓦片已存在，则不重复创建

  // 定义一个函数，用于计算六边形瓦片中每个点的位置
  const tileToPosition = (tileX, height, tileY) => {
    return new THREE.Vector3((tileX + (tileY % 2) * 0.5) * 1.68, height / 2, tileY * 1.535);
  }

  const setHexMesh = (geo) => {

    const mat = new THREE.MeshStandardMaterial();
    const mesh = new THREE.InstancedMesh(geo, mat, amountOfHexInTile);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;

  }

  const hexManipulator = new THREE.Object3D();
  const grassManipulator = new THREE.Object3D();
  const treeOneManipulator = new THREE.Object3D();
  const treeTwoManipulator = new THREE.Object3D();

  // 创建一个六边形几何体，用于生成瓦片的网格
  const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
  // 使用setHexMesh函数设置材质和阴影，返回一个InstancedMesh对象
  const hex = setHexMesh(geo);
  // 给网格命名，便于后续的管理和移除
  hex.name = tileName;
  geo.computeBoundsTree();

  // 创建草地和树木的InstancedMesh对象
  const grassOne = grassMeshes.grassMeshOne.clone();
  grassOne.name = tileName;
  const grassTwo = grassMeshes.grassMeshTwo.clone();
  grassTwo.name = tileName;

  const treeOne = treeMeshes.treeMeshOne.clone();
  treeOne.name = tileName;
  const treeTwo = treeMeshes.treeMeshTwo.clone();
  treeTwo.name = tileName;

  // 初始化地形瓦片的数据对象
  terrainTiles.push({
    name: tileName,
    hex: hex,
    grass: [
      grassOne.clone(),
      grassTwo.clone(),
    ],
    trees: [
      treeOne.clone(),
      treeTwo.clone(),
    ]
  });

  let hexCounter = 0;
  let grassOneCounter = 0;
  let grassTwoCounter = 0;
  let treeOneCounter = 0;
  let treeTwoCounter = 0;

  for (let i = centerTile.xFrom; i <= centerTile.xTo; i++) {
    for (let j = centerTile.yFrom; j <= centerTile.yTo; j++) {

      let noise1 = (simplex.noise2D(i * 0.015, j * 0.015) + 1.3) * 0.3;
      noise1 = Math.pow(noise1, 1.2);
      let noise2 = (simplex.noise2D(i * 0.015, j * 0.015) + 1) * 0.75;
      noise2 = Math.pow(noise2, 1.2);
      const height = noise1 * noise2 * maxHeight;

      hexManipulator.scale.y = height >= sandHeight ? height : sandHeight;

      const pos = tileToPosition(i, height >= sandHeight ? height : sandHeight, j);
      hexManipulator.position.set(pos.x, pos.y, pos.z);

      hexManipulator.updateMatrix();
      hex.setMatrixAt(hexCounter, hexManipulator.matrix);

      if (height > snowHeight) hex.setColorAt(hexCounter, textures.snow);
      else if (height > lightSnowHeight) hex.setColorAt(hexCounter, textures.lightSnow);
      else if (height > rockHeight) hex.setColorAt(hexCounter, textures.rock);
      else if (height > forestHeight) {

        hex.setColorAt(hexCounter, textures.forest);
        treeTwoManipulator.scale.set(1.1, 1.2, 1.1);
        treeTwoManipulator.rotation.y = Math.floor(Math.random() * 3);
        treeTwoManipulator.position.set(pos.x, (pos.y * 2) + 5, pos.z);
        treeTwoManipulator.updateMatrix();

        if ((Math.floor(Math.random() * 15)) === 0) {
          treeTwo.setMatrixAt(treeTwoCounter, treeTwoManipulator.matrix);
          treeTwoCounter++;
        }

      }
      else if (height > lightForestHeight) {

        hex.setColorAt(hexCounter, textures.lightForest);

        treeOneManipulator.scale.set(0.4, 0.4, 0.4);
        treeOneManipulator.position.set(pos.x, (pos.y * 2), pos.z);
        treeOneManipulator.updateMatrix();

        if ((Math.floor(Math.random() * 10)) === 0) {
          treeOne.setMatrixAt(treeOneCounter, treeOneManipulator.matrix);
          treeOneCounter++;
        }

      }
      else if (height > grassHeight) {

        hex.setColorAt(hexCounter, textures.grass);
        // 使用Simplex噪声生成器计算高度
        grassManipulator.scale.set(0.15, 0.15, 0.15);
        grassManipulator.rotation.x = -(Math.PI / 2);
        grassManipulator.position.set(pos.x, pos.y * 2, pos.z);
        grassManipulator.updateMatrix();

        if ((Math.floor(Math.random() * 6)) === 0)
          switch (Math.floor(Math.random() * 2) + 1) {// 计算六边形点的位置
            case 1:
              grassOne.setMatrixAt(grassOneCounter, grassManipulator.matrix);
              grassOneCounter++;
              break;
            case 2: // 更新InstancedMesh中对应点的矩阵
              grassTwo.setMatrixAt(grassTwoCounter, grassManipulator.matrix);
              grassTwoCounter++;
              break;
          }

      }// 根据高度设置六边形的颜色
      else if (height > sandHeight) hex.setColorAt(hexCounter, textures.sand);
      else if (height > shallowWaterHeight) hex.setColorAt(hexCounter, textures.shallowWater);
      else if (height > waterHeight) hex.setColorAt(hexCounter, textures.water);
      else if (height > deepWaterHeight) hex.setColorAt(hexCounter, textures.deepWater);

      hexCounter++;

    }
  }

  // 将创建的六边形网格、草地和树木添加到场景中
  scene.add(hex, grassOne, grassTwo, treeOne, treeTwo);

}

// cleanUpTiles 函数用于清理场景中不再处于视图范围内的地形瓦片
const cleanUpTiles = () => {

  // 遍历terrainTiles数组中的所有地形瓦片
  for (let i = terrainTiles.length - 1; i >= 0; i--) {

    // 获取当前地形瓦片的坐标范围
    let tileCoords = JSON.parse(terrainTiles[i].hex.name);
    // 计算瓦片的x和y坐标范围
    tileCoords = {
      xFrom: tileCoords.x,
      xTo: tileCoords.x + tileWidth,
      yFrom: tileCoords.y,
      yTo: tileCoords.y + tileWidth
    }


    // 检查瓦片是否在当前活动瓦片的范围之外
    if (
      tileCoords.xFrom < centerTile.xFrom - tileWidth ||
      tileCoords.xTo > centerTile.xTo + tileWidth ||
      tileCoords.yFrom < centerTile.yFrom - tileWidth ||
      tileCoords.yTo > centerTile.yTo + tileWidth
    ) {

      // 如果瓦片超出范围，则移除场景中的相关对象
      const tile = scene.getObjectsByProperty('name', terrainTiles[i].hex.name);
      for (let o = 0; o < tile.length; o++) cleanUp(tile[o]);// 调用cleanUp函数来清理对象

      // 从terrainTiles数组中移除当前瓦片的数据
      terrainTiles.splice(i, 1);

    }

  }

}

// resize 函数用于在浏览器窗口大小变化时调整场景和相机的尺寸
const resize = () => {
  // 更新容器的宽度和高度
  sizes = {
    width: container.offsetWidth,
    height: container.offsetHeight
  };

  // 更新相机的宽高比，并更新投影矩阵
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // 调整渲染器的尺寸以匹配新窗口大小
  renderer.setSize(sizes.width, sizes.height);

}

// toggleDoubleSpeed 函数用于切换角色的移动速度
const toggleDoubleSpeed = () => {
  // 如果角色正在飞行（flyingIn 为 true），则不切换速度
  if (flyingIn) return;

  // 切换 doubleSpeed 标志，改变角色的移动速度
  doubleSpeed = doubleSpeed ? false : true;
  // 更新角色旋转速度的最大值
  charRotateYMax = doubleSpeed ? 0.02 : 0.01;
  // 重新设置角色动画
  setCharAnimation();

}

// toggleBirdsEyeView 函数用于切换相机视角为鸟瞰视图
const toggleBirdsEyeView = () => {
  // 如果角色正在飞行（flyingIn 为 true），则不切换视角
  if (flyingIn) return;
  // 切换 thirdPerson 标志，控制是否使用第三人称视角
  thirdPerson = thirdPerson ? false : true;

}

// keyDown 函数用于处理键盘按下事件
const keyDown = (event) => {

  // 如果信息模态框（infoModalDisplayed）正在显示，不处理按键事件
  if (infoModalDisplayed) return;

  // 检查当前按键是否已经在 activeKeysPressed 数组中，如果不在，则添加进去
  if (!activeKeysPressed.includes(event.keyCode))
    activeKeysPressed.push(event.keyCode);

}

// keyUp 函数用于处理键盘释放事件
const keyUp = (event) => {

  // 检查是否按下了空格键，如果是，则切换角色移动速度
  if (event.keyCode === 32) toggleDoubleSpeed();
  // 检查是否按下了Z键，如果是，则切换鸟瞰视图
  if (event.keyCode === 90) toggleBirdsEyeView();

  // 从 activeKeysPressed 数组中移除当前释放的按键
  const index = activeKeysPressed.indexOf(event.keyCode);
  activeKeysPressed.splice(index, 1);

}

// determineMovement 函数用于确定并应用角色的移动
const determineMovement = () => {
  // 根据角色的移动速度（doubleSpeed）使角色沿着Z轴移动
  character.translateZ(doubleSpeed ? 1 : 0.4);

  // 如果角色正在飞行（flyingIn 为 true），则不执行以下移动逻辑
  if (flyingIn) return;

  // 根据当前按下的按键（activeKeysPressed）来决定角色的移动方向
  if (activeKeysPressed.includes(38)) { // 如果按下上箭头键
    // 应用向上移动的逻辑，包括增加角色的垂直位置和调整角色的仰角
    if (character.position.y < 90) {
      character.position.y += charPosYIncrement;
      if (charPosYIncrement < 0.3) charPosYIncrement += 0.02;
      if (charNeck.rotation.x > -0.6) charNeck.rotation.x -= 0.06;
      if (charBody.rotation.x > -0.4) charBody.rotation.x -= 0.04;
    }
    else {
      if (charNeck.rotation.x < 0 || charBody.rotation.x < 0) {
        character.position.y += charPosYIncrement;
        charNeck.rotation.x += 0.06;
        charBody.rotation.x += 0.04;
      }
    }
  }
  if (activeKeysPressed.includes(40) && !movingCharDueToDistance) {  // 如果按下下箭头键
    // 应用向下移动的逻辑，包括减少角色的垂直位置和调整角色的俯角
    if (character.position.y > 27) {
      character.position.y -= charPosYIncrement;
      if (charPosYIncrement < 0.3) charPosYIncrement += 0.02;
      if (charNeck.rotation.x < 0.6) charNeck.rotation.x += 0.06;
      if (charBody.rotation.x < 0.4) charBody.rotation.x += 0.04;
    }
    else {
      if (charNeck.rotation.x > 0 || charBody.rotation.x > 0) {
        character.position.y -= charPosYIncrement;
        charNeck.rotation.x -= 0.06;
        charBody.rotation.x -= 0.04;
      }
    }
  }

  // 根据当前按下的按键（activeKeysPressed）来决定角色的水平旋转
  if (activeKeysPressed.includes(37)) { // 如果按下左箭头键
    // 应用向左旋转的逻辑，包括旋转角色和调整角色的头部和身体角度
    character.rotateY(charRotateYIncrement);
    if (charRotateYIncrement < charRotateYMax) charRotateYIncrement += 0.0005;
    if (charNeck.rotation.y > -0.7) charNeck.rotation.y -= 0.07;
    if (charBody.rotation.y < 0.4) charBody.rotation.y += 0.04;
  }
  if (activeKeysPressed.includes(39)) { // 如果按下右箭头键
    // 应用向右旋转的逻辑，与向左旋转逻辑相反
    character.rotateY(-charRotateYIncrement);
    if (charRotateYIncrement < charRotateYMax) charRotateYIncrement += 0.0005;
    if (charNeck.rotation.y < 0.7) charNeck.rotation.y += 0.07;
    if (charBody.rotation.y > -0.4) charBody.rotation.y -= 0.04;
  }

  // Revert

  if (!activeKeysPressed.includes(38) && !activeKeysPressed.includes(40) ||
    activeKeysPressed.includes(38) && activeKeysPressed.includes(40)) {
    if (charPosYIncrement > 0) charPosYIncrement -= 0.02;
    if (charNeck.rotation.x < 0 || charBody.rotation.x < 0) { // reverting from going up
      character.position.y += charPosYIncrement;
      charNeck.rotation.x += 0.06;
      charBody.rotation.x += 0.04;
    }
    if (charNeck.rotation.x > 0 || charBody.rotation.x > 0) { // reverting from going down
      character.position.y -= charPosYIncrement;
      charNeck.rotation.x -= 0.06;
      charBody.rotation.x -= 0.04;
    }
  }

  if (!activeKeysPressed.includes(37) && !activeKeysPressed.includes(39) ||
    activeKeysPressed.includes(37) && activeKeysPressed.includes(39)) {
    if (charRotateYIncrement > 0) charRotateYIncrement -= 0.0005;
    if (charNeck.rotation.y < 0 || charBody.rotation.y > 0) { // reverting from going left
      character.rotateY(charRotateYIncrement);
      charNeck.rotation.y += 0.07;
      charBody.rotation.y -= 0.04;
    }
    if (charNeck.rotation.y > 0 || charBody.rotation.y < 0) { // reverting from going right
      character.rotateY(-charRotateYIncrement);
      charNeck.rotation.y -= 0.07;
      charBody.rotation.y += 0.04;
    }
  }

}

// camUpdate 函数用于更新相机的位置和朝向，确保相机平滑跟随角色
const camUpdate = () => {

  // 计算理想的相机偏移量，考虑第三人称视角的影响
  const calcIdealOffset = () => {
    const idealOffset = thirdPerson ? new THREE.Vector3(0, camY, camZ) : new THREE.Vector3(0, 3, 7);
    idealOffset.applyQuaternion(character.quaternion);// 应用角色的四元数旋转
    idealOffset.add(character.position);// 将偏移量添加到角色的位置
    return idealOffset;
  }

  // 计算理想的相机观察目标，考虑第三人称视角的影响
  const calcIdealLookat = () => {
    const idealLookat = thirdPerson ? new THREE.Vector3(0, -1.2, lookAtPosZ) : new THREE.Vector3(0, 0.5, lookAtPosZ + 5);
    idealLookat.applyQuaternion(character.quaternion);// 应用角色的四元数旋转
    idealLookat.add(character.position);// 将观察目标添加到角色的位置
    return idealLookat;
  }

  // 根据角色的高度调整观察目标的Z轴位置，以保持视角的平滑和稳定
  if (!activeKeysPressed.length) {
    if (character.position.y > 60 && lookAtPosZ > 5) lookAtPosZ -= 0.2;
    if (character.position.y <= 60 && lookAtPosZ < 15) lookAtPosZ += 0.2;
  }

  // 获取理想的相机偏移量和观察目标
  const idealOffset = calcIdealOffset();
  const idealLookat = calcIdealLookat();

  currentPos.copy(idealOffset);
  currentLookAt.copy(idealLookat);

  // 更新相机的位置，平滑地跟随角色
  camera.position.lerp(currentPos, 0.14);// 使用lerp函数平滑插值
  // 更新相机的观察目标
  camera.lookAt(currentLookAt);

  // 根据角色的移动调整相机的Y和Z轴位置，保持适当的距离和角度
  if (camY > 7) camY -= 0.5; // 如果相机太高，向下移动
  if (camZ < -10) camZ += 0.5; // 如果相机太靠近，向后移动
  else {
    // 如果角色正在飞行且动画已完成，执行相关的动作
    if (flyingIn) {
      setCharAnimation(); // 调用角色动画函数
      cleanUpClouds();  // 清理云朵动画
    }
  }

}

// calcCharPos 函数用于计算并调整角色在场景中的位置
const calcCharPos = () => {

  // 使用射线检测器从角色位置向下发射射线，检测与地形的交点
  raycaster.set(character.position, new THREE.Vector3(0, -1, -0.1));

  // 检测射线与场景中地形瓦片的交点
  const intersects = raycaster.intersectObjects(terrainTiles.map(el => el.hex));

  // 如果存在交点，并且交点的瓦片名称与当前活动瓦片不同，则创建新的周围瓦片
  if (activeTile !== intersects[0].object.name) createSurroundingTiles(intersects[0].object.name);

  // 如果射线检测到的交点距离小于预设的距离阈值，则认为角色需要向下移动
  if (intersects[0].distance < distance) {
    movingCharDueToDistance = true;
    // 根据角色的移动速度（doubleSpeed）调整角色的垂直位置
    character.position.y += doubleSpeed ? 0.3 : 0.1;
  }
  else {
    // 如果角色之前因为距离而移动，但现在不再需要，则开始计时，准备停止移动
    if (movingCharDueToDistance && !movingCharTimeout) {
      movingCharTimeout = setTimeout(() => {
        movingCharDueToDistance = false;
        movingCharTimeout = undefined;
      }, 600);
    }
  }

  // 更新角色位置后，调用 camUpdate 函数来更新相机的位置和朝向
  camUpdate();

}

// listenTo 函数用于设置事件监听器，响应用户的输入和窗口变化事件
const listenTo = () => {
  // 监听窗口大小变化事件，当窗口大小变化时调用 resize 函数调整场景和渲染器尺寸
  window.addEventListener('resize', resize.bind(this));
  // 监听键盘按下事件，当按键被按下时调用 keyDown 函数处理按键逻辑
  window.addEventListener('keydown', keyDown.bind(this));
  // 监听键盘释放事件，当按键被释放时调用 keyUp 函数处理按键逻辑
  window.addEventListener('keyup', keyUp.bind(this));
  // 监听音乐图标的点击事件，当点击时调用 updateMusicVolume 函数切换背景音乐的音量
  document.querySelector('.hex-music').addEventListener('click', () => updateMusicVolume());
  // 监听信息图标的点击事件，当点击时调用 toggleInfoModal 函数切换信息模态框的显示
  document.querySelector('.hex-info').addEventListener('click', () => toggleInfoModal());
  // 监听速度图标的点击事件，当点击时调用 toggleDoubleSpeed 函数切换角色移动速度
  document.querySelector('.hex-speed').addEventListener('click', () => toggleDoubleSpeed());
  // 监听鸟瞰图标的点击事件，当点击时调用 toggleBirdsEyeView 函数切换相机视角
  document.querySelector('.hex-birds-eye').addEventListener('click', () => toggleBirdsEyeView());
};

// cleanUp 函数用于清理和释放场景中对象的资源
const cleanUp = (obj) => {

  // 如果对象拥有几何体和材质，则释放它们占用的资源
  if (obj.geometry && obj.material) {
    obj.geometry.dispose();
    obj.material.dispose();
  }
  else {// 遍历对象的所有子元素，如果是网格也进行清理
    obj.traverse(el => {
      if (el.isMesh) {
        el.geometry.dispose();
        el.material.dispose();
      }
    });
  }
  // 从场景中移除对象
  scene.remove(obj);
  // 清理渲染器的渲染列表
  renderer.renderLists.dispose();

}

// render 函数是渲染循环的核心，用于更新场景并将其渲染到屏幕上
const render = () => {
  // 如果加载页面已被关闭，则更新场景中的动画和相机位置
  if (loadingDismissed) {
    determineMovement();// 确定并应用角色的移动
    calcCharPos(); // 计算并更新角色的位置
    if (flyingIn) animateClouds();// 如果角色正在飞行，更新云朵动画
    if (mixer) mixer.update(clock.getDelta());// 更新动画混合器
  }
  // 渲染场景到屏幕上
  renderer.render(scene, camera);

  // 循环调用 requestAnimationFrame 以持续渲染
  requestAnimationFrame(render.bind(this))

}

// playMusic 函数用于播放背景音乐
const playMusic = () => {
  // 创建 Howl 对象，用于播放背景音乐
  bgMusic = new Howl({
    src: ['assets/sound/bg-music.mp3'],// 指定背景音乐文件路径
    autoplay: true,// 自动播放
    loop: true, // 循环播放
    volume: 0, // 初始音量设置为 0
  });
  // 播放背景音乐
  bgMusic.play();

}
// updateMusicVolume 函数用于更新背景音乐的音量
const updateMusicVolume = () => {
  // 切换 muteBgMusic 标志，根据静音状态设置音量
  muteBgMusic = !muteBgMusic;
  // 根据静音状态更新背景音乐的音量
  bgMusic.volume(muteBgMusic ? 0 : 0.01);

  // 更新音量图标的显示
  document.getElementById('sound').src =
    muteBgMusic ?
      'assets/icons/sound-off.svg' :
      'assets/icons/sound-on.svg'

};

// pauseIconAnimation 函数用于暂停或恢复图标的动画效果
const pauseIconAnimation = (pause = true) => {
  // 如果需要暂停动画，则给相关图标添加 'js-loading' 类
  if (pause) {
    document.querySelector('.hex-music').classList.add('js-loading');
    document.querySelector('.hex-info').classList.add('js-loading');
    document.querySelector('.hex-speed').classList.add('js-loading');
    document.querySelector('.hex-birds-eye').classList.add('js-loading');
    return;
  }
  // 如果需要恢复动画，则移除 'js-loading' 类
  document.querySelector('.hex-music').classList.remove('js-loading');
  document.querySelector('.hex-info').classList.remove('js-loading');
  document.querySelector('.hex-speed').classList.remove('js-loading');
  document.querySelector('.hex-birds-eye').classList.remove('js-loading');

}

// toggleInfoModal 函数用于切换信息模态框的显示状态
const toggleInfoModal = (display = true) => {

  infoModalDisplayed = display;

  // 如果display参数为true，则显示信息模态框，否则隐藏
  if (display) return gsap.timeline() // 使用gsap动画库来平滑显示信息模态框和信息框
    .to('.info-modal-page', {
      zIndex: 100 // 设置层级以确保模态框显示在最上层
    })
    .to('.info-modal-page', {
      opacity: 1,
      duration: 1
    })
    .to('.info-box', {
      opacity: 1,
      duration: 1
    })


  // 使用gsap动画库来平滑隐藏信息模态框和信息框
  gsap.timeline()
    .to('.info-box', {
      opacity: 0,
      duration: 0.5
    })
    .to('.info-modal-page', {
      opacity: 0,
      duration: 0.5
    })
    .to('.info-modal-page', {
      zIndex: -1  // 设置层级以确保模态框隐藏在背后
    })

}

// checkLoadingPage 函数用于检查并更新加载页面的状态
const checkLoadingPage = () => {
  // 定义一个计数器来跟踪加载的进度
  let loadingCounter = 0;
  // 定义一个标志来表示加载页面是否已被关闭
  loadingDismissed = false;

  // 定义一个函数来检查所有资源是否已加载完成
  const checkAssets = () => {
    // 如果场景、云朵、角色等资源还未加载完成，则继续等待
    // 如果资源都已加载完成或者加载次数过多，则关闭加载页面
    // 调用dismissLoading函数来执行关闭操作

    let allAssetsLoaded = true;

    if (!scene) allAssetsLoaded = false;
    if (!clouds.length === 2) allAssetsLoaded = false;
    if (!character) allAssetsLoaded = false;
    if (!Object.keys(grassMeshes).length === 2) allAssetsLoaded = false;
    if (!Object.keys(treeMeshes).length === 2) allAssetsLoaded = false;
    if (!activeTile) allAssetsLoaded = false;
    if (loadingCounter < 6) allAssetsLoaded = false;
    if (loadingCounter > 50) allAssetsLoaded = true;
    if (allAssetsLoaded) return dismissLoading();

    loadingCounter++;
    setTimeout(checkAssets, 500);

  }

  // dismissLoading 函数用于关闭加载页面，并显示主场景内容
  const dismissLoading = () => {

    // 使用gsap动画库来平滑地关闭加载页面
    gsap.timeline()
      .to('.loader-container', {
        opacity: 0,
        duration: 0.6
      })
      .to('.page-loader', {
        opacity: 0,
        duration: 0.6
      })
      .to('.page-loader', {
        display: 'none'  // 将加载页面隐藏
      })
      .then(() => {
        // 当加载页面关闭动画完成后，设置加载完成标志
        // 如果需要，可以在这里执行其他加载完成后的操作
        loadingDismissed = true;
        pauseIconAnimation(false);
      });

  }

  checkAssets();

}

setScene();
