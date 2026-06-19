export interface Plant {
  id: string;
  name: string;
  species: string;
  category: string;
  plantedDate: string;
  location: string;
  avatar: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CareLogType = "watering" | "fertilizing" | "lighting";
export type LightIntensity = "low" | "medium" | "high";

export interface CareLog {
  id: string;
  plantId: string;
  type: CareLogType;
  date: string;
  amount?: number;
  fertilizerType?: string;
  lightDuration?: number;
  lightIntensity?: LightIntensity;
  notes: string;
  createdAt: string;
}

export type LeafColor =
  | "normal"
  | "yellowing"
  | "browning"
  | "spotting"
  | "wilting";
export type LeafCurl = "none" | "slight" | "moderate" | "severe";

export interface SpotInfo {
  type: string;
  color: string;
  size: string;
  description: string;
}

export interface NewLeafInfo {
  count: number;
  size?: string;
  description?: string;
}

export interface LeafSizeChange {
  previousLength?: number;
  currentLength?: number;
  previousWidth?: number;
  currentWidth?: number;
  unit?: string;
  growthRate?: string;
  description?: string;
}

export interface LeafRecord {
  id: string;
  plantId: string;
  date: string;
  colorStatus: LeafColor;
  spots: SpotInfo[];
  curlStatus: LeafCurl;
  images: string[];
  notes: string;
  newLeaves?: NewLeafInfo;
  leafSize?: LeafSizeChange;
  createdAt: string;
}

export type PestType = "disease" | "pest";
export type Severity = "low" | "medium" | "high";
export type PestStatus = "ongoing" | "resolved";

export interface PestRecord {
  id: string;
  plantId: string;
  type: PestType;
  name: string;
  discoveredDate: string;
  severity: Severity;
  symptoms: string;
  images: string[];
  treatmentMethod: string;
  treatmentDate: string;
  treatmentEffect: string;
  followUpNotes: string;
  status: PestStatus;
  resolvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlantCategory =
  | "观叶植物"
  | "多肉植物"
  | "开花植物"
  | "香草植物"
  | "蔬果植物"
  | "其他";

export const PLANT_CATEGORIES: PlantCategory[] = [
  "观叶植物",
  "多肉植物",
  "开花植物",
  "香草植物",
  "蔬果植物",
  "其他",
];

export const PLANT_EMOJIS = [
  "🌿",
  "🌱",
  "🍀",
  "🌵",
  "🪴",
  "🌴",
  "🌳",
  "🌲",
  "🌸",
  "🌺",
  "🌻",
  "🌷",
  "🌹",
  "🍃",
  "🌾",
  "🥬",
  "🍅",
  "🌶️",
  "🍓",
  "🫐",
];

export const CARE_TYPE_LABELS: Record<CareLogType, string> = {
  watering: "浇水",
  fertilizing: "施肥",
  lighting: "光照",
};

export const CARE_TYPE_ICONS: Record<CareLogType, string> = {
  watering: "💧",
  fertilizing: "🌾",
  lighting: "☀️",
};

export const LIGHT_INTENSITY_LABELS: Record<LightIntensity, string> = {
  low: "弱光",
  medium: "中等",
  high: "强光",
};

export const LEAF_COLOR_LABELS: Record<LeafColor, string> = {
  normal: "正常",
  yellowing: "发黄",
  browning: "发褐",
  spotting: "斑点",
  wilting: "萎蔫",
};

export const LEAF_CURL_LABELS: Record<LeafCurl, string> = {
  none: "无卷曲",
  slight: "轻微卷曲",
  moderate: "中度卷曲",
  severe: "严重卷曲",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "轻微",
  medium: "中等",
  high: "严重",
};

export const PEST_TYPE_LABELS: Record<PestType, string> = {
  disease: "病害",
  pest: "虫害",
};

export const PEST_STATUS_LABELS: Record<PestStatus, string> = {
  ongoing: "处理中",
  resolved: "已解决",
};

export type CareTaskType = "watering" | "fertilizing";

export interface CarePlan {
  id: string;
  category: PlantCategory | "all";
  taskType: CareTaskType;
  intervalDays: number;
  defaultAmount?: number;
  defaultFertilizerType?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareTodo {
  id: string;
  plantId: string;
  plantName: string;
  plantAvatar: string;
  taskType: CareTaskType;
  planId?: string;
  dueDate: string;
  lastDoneDate?: string;
  overdueDays: number;
  status: "pending" | "done" | "overdue";
  defaultAmount?: number;
  defaultFertilizerType?: string;
}

export const CARE_TASK_TYPE_LABELS: Record<CareTaskType, string> = {
  watering: "浇水",
  fertilizing: "施肥",
};

export const CARE_TASK_TYPE_ICONS: Record<CareTaskType, string> = {
  watering: "💧",
  fertilizing: "🌾",
};

export const DEFAULT_CARE_PLANS: Omit<CarePlan, "id" | "createdAt" | "updatedAt">[] = [
  { category: "观叶植物", taskType: "watering", intervalDays: 5, defaultAmount: 200, enabled: true },
  { category: "观叶植物", taskType: "fertilizing", intervalDays: 30, defaultAmount: 5, defaultFertilizerType: "复合肥", enabled: true },
  { category: "多肉植物", taskType: "watering", intervalDays: 14, defaultAmount: 100, enabled: true },
  { category: "多肉植物", taskType: "fertilizing", intervalDays: 60, defaultAmount: 3, defaultFertilizerType: "缓释肥", enabled: true },
  { category: "开花植物", taskType: "watering", intervalDays: 3, defaultAmount: 250, enabled: true },
  { category: "开花植物", taskType: "fertilizing", intervalDays: 14, defaultAmount: 5, defaultFertilizerType: "磷钾肥", enabled: true },
  { category: "香草植物", taskType: "watering", intervalDays: 2, defaultAmount: 150, enabled: true },
  { category: "香草植物", taskType: "fertilizing", intervalDays: 21, defaultAmount: 3, defaultFertilizerType: "液肥", enabled: true },
  { category: "蔬果植物", taskType: "watering", intervalDays: 2, defaultAmount: 300, enabled: true },
  { category: "蔬果植物", taskType: "fertilizing", intervalDays: 10, defaultAmount: 8, defaultFertilizerType: "有机肥", enabled: true },
];

export type TimelineRecordKind = "care" | "leaf" | "pest";

export type TimelineFilterType = "all" | TimelineRecordKind;

export type TimelineTimeRange = "all" | "week" | "month" | "year";

export interface TimelineCareRecord {
  kind: "care";
  data: CareLog;
}

export interface TimelineLeafRecord {
  kind: "leaf";
  data: LeafRecord;
}

export interface TimelinePestRecord {
  kind: "pest";
  data: PestRecord;
}

export type TimelineRecord = TimelineCareRecord | TimelineLeafRecord | TimelinePestRecord;

export interface TimelineGroupedRecord {
  id: string;
  kind: TimelineRecordKind;
  timestamp: number;
  sortKey: string;
  record: TimelineRecord;
}

export const TIMELINE_KIND_LABELS: Record<TimelineRecordKind, string> = {
  care: "养护",
  leaf: "叶片",
  pest: "病虫害",
};

export const TIMELINE_KIND_COLORS: Record<
  TimelineRecordKind,
  { bg: string; border: string; text: string; dot: string; gradient: string }
> = {
  care: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
    gradient: "from-sky-400 to-sky-600",
  },
  leaf: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
  },
  pest: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
  },
};

export const TIMELINE_TIME_RANGE_LABELS: Record<TimelineTimeRange, string> = {
  all: "全部",
  week: "近一周",
  month: "近一月",
  year: "近一年",
};

export interface PlantHealthScore {
  total: number;
  careScore: number;
  leafScore: number;
  pestScore: number;
  stars: number;
  level: "excellent" | "good" | "fair" | "poor" | "critical";
}

export const HEALTH_LEVEL_LABELS: Record<PlantHealthScore["level"], string> = {
  excellent: "极佳",
  good: "良好",
  fair: "一般",
  poor: "较差",
  critical: "危险",
};

export const HEALTH_LEVEL_COLORS: Record<PlantHealthScore["level"], string> = {
  excellent: "text-emerald-500",
  good: "text-forest-500",
  fair: "text-amber-500",
  poor: "text-orange-500",
  critical: "text-red-500",
};

export interface EnvironmentRecord {
  id: string;
  location: string;
  date: string;
  temperature: number;
  humidity: number;
  light: number;
  notes: string;
  createdAt: string;
}

export const ENVIRONMENT_FIELD_LABELS = {
  temperature: "温度",
  humidity: "湿度",
  light: "光照",
  location: "位置",
  date: "日期",
};

export const ENVIRONMENT_FIELD_UNITS = {
  temperature: "°C",
  humidity: "%",
  light: "lux",
};

export type RecurrenceRiskLevel = "high" | "medium" | "low";

export interface PestRecurrenceAlert {
  id: string;
  plantId: string;
  plantName: string;
  plantAvatar: string;
  pestName: string;
  pestType: PestType;
  riskLevel: RecurrenceRiskLevel;
  currentRecord?: PestRecord;
  historyRecords: PestRecord[];
  recurrenceCount: number;
  recommendedTreatment: string;
  lastOccurrenceDate: string;
  averageResolutionDays: number;
}

export const RECURRENCE_RISK_LABELS: Record<RecurrenceRiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
};

export const RECURRENCE_RISK_COLORS: Record<RecurrenceRiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  medium: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  low: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};
