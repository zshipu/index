
import { CareLevel, Elder, RiskLevel, Alert, Task } from '../types';

const generateHistory = (base: number, variance: number, days = 7): { date: string; value: number }[] => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      value: Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10,
    });
  }
  return data;
};

export const mockElders: Elder[] = [
  {
    id: '1',
    name: '张伟',
    age: 78,
    gender: '男',
    room: '101-A',
    careLevel: CareLevel.PARTIAL_CARE,
    riskLevel: RiskLevel.MEDIUM,
    admissionDate: '2024-01-15',
    imgUrl: 'https://picsum.photos/id/1005/200/200',
    sleepStatus: 'Asleep',
    stats: {
      weight: 68.5,
      steps: 2300,
      heartRate: 72,
      spo2: 96,
      sleep: 6.5,
      healthScore: 78,
    },
    history: {
      weight: generateHistory(68, 1.5, 30),
      steps: generateHistory(2500, 1000),
      heartRate: generateHistory(72, 10),
      sleep: generateHistory(6.5, 2),
    },
    goals: [
      {
        id: 'g1',
        type: 'Weight',
        title: '体重控制目标',
        targetValue: 65,
        currentValue: 68.5,
        unit: 'kg',
        status: 'In Progress'
      },
      {
        id: 'g2',
        type: 'Steps',
        title: '每日步数目标',
        targetValue: 4000,
        currentValue: 2300,
        unit: '步',
        status: 'At Risk'
      },
      {
        id: 'g3',
        type: 'Sleep',
        title: '每日睡眠时长',
        targetValue: 7.5,
        currentValue: 6.5,
        unit: '小时',
        status: 'In Progress'
      }
    ]
  },
  {
    id: '2',
    name: '李秀',
    age: 82,
    gender: '女',
    room: '102-B',
    careLevel: CareLevel.FULL_CARE,
    riskLevel: RiskLevel.HIGH,
    admissionDate: '2023-11-20',
    imgUrl: 'https://picsum.photos/id/1011/200/200',
    sleepStatus: 'Awake',
    stats: {
      weight: 45.2,
      steps: 500,
      heartRate: 88,
      spo2: 92,
      sleep: 5.0,
      healthScore: 62,
    },
    history: {
      weight: generateHistory(45, 0.5, 30),
      steps: generateHistory(600, 200),
      heartRate: generateHistory(85, 15),
      sleep: generateHistory(5.5, 1.5),
    },
    goals: [
      {
        id: 'g1',
        type: 'Weight',
        title: '增重目标',
        targetValue: 48,
        currentValue: 45.2,
        unit: 'kg',
        status: 'At Risk'
      }
    ]
  },
  {
    id: '3',
    name: '王芳',
    age: 75,
    gender: '女',
    room: '201-A',
    careLevel: CareLevel.SELF_CARE,
    riskLevel: RiskLevel.LOW,
    admissionDate: '2024-05-10',
    imgUrl: 'https://picsum.photos/id/1027/200/200',
    sleepStatus: 'Awake',
    stats: {
      weight: 58.0,
      steps: 6500,
      heartRate: 68,
      spo2: 98,
      sleep: 7.5,
      healthScore: 92,
    },
    history: {
      weight: generateHistory(58, 1, 30),
      steps: generateHistory(6000, 1500),
      heartRate: generateHistory(68, 5),
      sleep: generateHistory(7.5, 1),
    },
    goals: [
      {
        id: 'g1',
        type: 'Steps',
        title: '保持活跃',
        targetValue: 6000,
        currentValue: 6500,
        unit: '步',
        status: 'Achieved'
      }
    ]
  },
  {
    id: '4',
    name: '陈波',
    age: 85,
    gender: '男',
    room: '202-C',
    careLevel: CareLevel.PARTIAL_CARE,
    riskLevel: RiskLevel.MEDIUM,
    admissionDate: '2024-03-01',
    imgUrl: 'https://picsum.photos/id/1006/200/200',
    sleepStatus: 'Awake',
    stats: {
      weight: 72.1,
      steps: 1800,
      heartRate: 75,
      spo2: 95,
      sleep: 6.0,
      healthScore: 75,
    },
    history: {
      weight: generateHistory(72, 0.8, 30),
      steps: generateHistory(2000, 500),
      heartRate: generateHistory(74, 8),
      sleep: generateHistory(6.0, 1.5),
    },
    goals: []
  },
];

export let mockAlerts: Alert[] = [
  {
    id: 'a1',
    elderId: '2',
    elderName: '李秀',
    type: 'SpO2',
    level: RiskLevel.CRITICAL,
    message: '血氧饱和度持续15分钟低于93%。',
    timestamp: '2025-11-18 14:23',
    status: '待处理',
  },
  {
    id: 'a2',
    elderId: '4',
    elderName: '陈波',
    type: 'Steps',
    level: RiskLevel.MEDIUM,
    message: '连续3天每日步数低于500步。',
    timestamp: '2025-11-18 08:00',
    status: '已查看',
  },
  {
    id: 'a3',
    elderId: '1',
    elderName: '张伟',
    type: 'Weight',
    level: RiskLevel.MEDIUM,
    message: '3天内体重突然增加1.5公斤。',
    timestamp: '2025-11-17 09:30',
    status: '已解决',
  },
];

// We make this mutable to simulate backend changes
export let mockTasks: Task[] = [
  {
    id: 't1',
    title: '测量血压',
    elderName: '李秀',
    time: '08:00',
    priority: 'High',
    status: 'Pending',
    type: 'Check',
  },
  {
    id: 't2',
    title: '晨练协助',
    elderName: '陈波',
    time: '09:00',
    priority: 'Normal',
    status: 'Completed',
    type: 'Activity',
  },
  {
    id: 't3',
    title: '体重测量',
    elderName: '张伟',
    time: '10:00',
    priority: 'Normal',
    status: 'Pending',
    type: 'Check',
  },
  {
    id: 't4',
    title: '午餐服药',
    elderName: '王芳',
    time: '12:30',
    priority: 'High',
    status: 'Pending',
    type: 'Medication',
  },
];

export const mockTimelineEvents = [
  {
    id: 1,
    time: '10:30',
    title: '参加书法课',
    description: '张伟参加了集体书法课，看起来很专注。',
    image: 'https://picsum.photos/id/1005/400/200',
    type: 'Activity'
  },
  {
    id: 2,
    time: '08:15',
    title: '早餐已完成',
    description: '今天胃口不错，吃了燕麦和鸡蛋。',
    image: null,
    type: 'Diet'
  },
  {
    id: 3,
    time: '昨天',
    title: '每周体重检查',
    description: '体重稳定在68.5公斤，在目标范围内。',
    image: null,
    type: 'Check'
  }
];

export const mockFamilyMessages = [
  { id: 1, from: '女儿', content: '爸，看到你今天走了2000步！真棒！👍', time: '10:00' },
  { id: 2, from: '孙子', content: '爷爷我想你了！❤️', time: '昨天' },
];

// --- Logic to simulate Smart Watch Events ---

// Custom events for UI updates
export const TASKS_UPDATED_EVENT = 'TASKS_UPDATED_EVENT';
export const ALERTS_UPDATED_EVENT = 'ALERTS_UPDATED_EVENT';
export const DATA_UPDATED_EVENT = 'DATA_UPDATED_EVENT';

export const triggerWakeUpRoutine = (elderId: string) => {
  const elder = mockElders.find(e => e.id === elderId);
  if (!elder) return;

  // 1. Update Elder Status
  elder.sleepStatus = 'Awake';

  // 2. Generate Morning Tasks
  const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  const newTasks: Task[] = [
    {
      id: `auto_bp_${Date.now()}`,
      title: '晨间血压监测 (自动生成)',
      elderName: elder.name,
      time: currentTime,
      priority: 'High',
      status: 'Pending',
      type: 'Check',
    },
    {
      id: `auto_bg_${Date.now()}`,
      title: '空腹血糖测量 (自动生成)',
      elderName: elder.name,
      time: currentTime,
      priority: 'High',
      status: 'Pending',
      type: 'Check',
    },
    {
      id: `auto_spo2_${Date.now()}`,
      title: '晨间血氧检查 (自动生成)',
      elderName: elder.name,
      time: currentTime,
      priority: 'Normal',
      status: 'Pending',
      type: 'Check',
    }
  ];

  // 3. Push to "Database"
  mockTasks = [...newTasks, ...mockTasks];

  // 4. Simulate Push Notification for Tasks
  const event = new CustomEvent(TASKS_UPDATED_EVENT, { detail: { count: newTasks.length } });
  window.dispatchEvent(event);
  
  return newTasks;
};

// Simulate syncing data from device and checking thresholds
export const syncDeviceData = (elderId: string, simulateAbnormal: boolean = false) => {
    const elder = mockElders.find(e => e.id === elderId);
    if (!elder) return;

    // 1. Simulate Sensor Data Updates
    const newSteps = elder.stats.steps + Math.floor(Math.random() * 50);
    // Normal range HR 60-90, SpO2 95-99
    let newHR = elder.stats.heartRate + Math.floor(Math.random() * 10) - 5;
    let newSpO2 = 96 + Math.floor(Math.random() * 3) - 1;

    if (simulateAbnormal) {
        newHR = 115; // Tachycardia
        newSpO2 = 92; // Hypoxia
    }

    // Ensure realistic bounds
    if (newSpO2 > 100) newSpO2 = 100;
    if (newHR < 40) newHR = 40;

    // Update Elder Stats
    elder.stats.steps = newSteps;
    elder.stats.heartRate = newHR;
    elder.stats.spo2 = newSpO2;

    // Update Goals progress if applicable (e.g. Steps)
    if (elder.goals) {
      const stepsGoal = elder.goals.find(g => g.type === 'Steps');
      if (stepsGoal) {
          stepsGoal.currentValue = newSteps;
          if (stepsGoal.currentValue >= stepsGoal.targetValue) {
              stepsGoal.status = 'Achieved';
          }
      }
    }

    // 2. Logic to Trigger Alerts based on abnormalities
    const newAlerts: Alert[] = [];
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    if (newSpO2 < 94) {
        const alert: Alert = {
            id: `alert_spo2_${Date.now()}`,
            elderId: elder.id,
            elderName: elder.name,
            type: 'SpO2',
            level: RiskLevel.CRITICAL,
            message: `检测到血氧过低 (${newSpO2}%)，请立即确认老人状态。`,
            timestamp: timestamp,
            status: '待处理'
        };
        mockAlerts.unshift(alert); // Add to beginning
        newAlerts.push(alert);
    }

    if (newHR > 110) {
        const alert: Alert = {
            id: `alert_hr_${Date.now()}`,
            elderId: elder.id,
            elderName: elder.name,
            type: 'HeartRate',
            level: RiskLevel.HIGH,
            message: `监测到心率过速 (${newHR} bpm)，请持续关注。`,
            timestamp: timestamp,
            status: '待处理'
        };
        mockAlerts.unshift(alert);
        newAlerts.push(alert);
    }

    // 3. Dispatch Events
    // Notify general data update (for dashboards)
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
    
    // Notify alerts if generated (for caregivers)
    if (newAlerts.length > 0) {
         window.dispatchEvent(new CustomEvent(ALERTS_UPDATED_EVENT, { detail: { alerts: newAlerts } }));
    }

    return {
        stats: elder.stats,
        alerts: newAlerts
    };
};
