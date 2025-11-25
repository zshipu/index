
export enum RiskLevel {
  LOW = '低风险',
  MEDIUM = '中风险',
  HIGH = '高风险',
  CRITICAL = '紧急',
}

export enum CareLevel {
  SELF_CARE = '自理',
  PARTIAL_CARE = '半自理',
  FULL_CARE = '失能',
}

export interface HealthMetric {
  date: string;
  value: number;
}

export interface HealthGoal {
  id: string;
  type: 'Weight' | 'Steps' | 'Sleep' | 'Other';
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'In Progress' | 'Achieved' | 'At Risk';
}

export interface Elder {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  room: string;
  careLevel: CareLevel;
  riskLevel: RiskLevel;
  admissionDate: string;
  imgUrl: string;
  sleepStatus: 'Awake' | 'Asleep'; // Added sleep status
  stats: {
    weight: number; // kg
    steps: number; // today
    heartRate: number; // bpm
    spo2: number; // %
    sleep: number; // hours
    healthScore: number; // 0-100
  };
  history: {
    weight: HealthMetric[];
    steps: HealthMetric[];
    heartRate: HealthMetric[];
    sleep: HealthMetric[];
  };
  goals?: HealthGoal[]; // Added goals
}

export interface Alert {
  id: string;
  elderId: string;
  elderName: string;
  type: 'Steps' | 'Sleep' | 'HeartRate' | 'SpO2' | 'Weight';
  level: RiskLevel;
  message: string;
  timestamp: string;
  status: '待处理' | '已查看' | '已解决';
}

export interface Task {
  id: string;
  title: string;
  elderName: string;
  time: string;
  priority: 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'Completed';
  type: 'Check' | 'Activity' | 'Medication' | 'Diet';
}
