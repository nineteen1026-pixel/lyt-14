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

export interface LeafRecord {
  id: string;
  plantId: string;
  date: string;
  colorStatus: LeafColor;
  spots: SpotInfo[];
  curlStatus: LeafCurl;
  images: string[];
  notes: string;
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
