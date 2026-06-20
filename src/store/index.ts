import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Plant,
  CareLog,
  LeafRecord,
  PestRecord,
  CarePlan,
  CareTodo,
  EnvironmentRecord,
  CareTemplate,
  PlantCategory,
  SearchResults,
  SearchResultItem,
  SearchCategory,
  ExpenseRecord,
  ExpenseCategory,
  PlantYearlyExpense,
  CategoryExpenseSummary,
} from "@/types";
import {
  DEFAULT_CARE_PLANS,
  PRESET_CARE_TEMPLATES,
  CARE_TYPE_LABELS,
  LEAF_COLOR_LABELS,
  LEAF_CURL_LABELS,
  PEST_TYPE_LABELS,
  SEARCH_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/types";
import { generateId, now, today, getDaysAgo } from "@/utils/format";
import { generateCareTodos } from "@/utils/helpers";

const MOCK_PLANTS: Plant[] = [
  {
    id: "plant-1",
    name: "绿萝",
    species: "Epipremnum aureum",
    category: "观叶植物",
    plantedDate: "2025-03-15",
    location: "客厅窗边",
    avatar: "🌿",
    notes: "喜欢散射光，耐旱性好，每周浇水一次即可。",
    createdAt: "2025-03-15T10:00:00Z",
    updatedAt: "2025-03-15T10:00:00Z",
  },
  {
    id: "plant-2",
    name: "多肉组合",
    species: "Echeveria",
    category: "多肉植物",
    plantedDate: "2025-04-20",
    location: "阳台南",
    avatar: "🌵",
    notes: "多晒太阳，少浇水，避免积水。",
    createdAt: "2025-04-20T14:30:00Z",
    updatedAt: "2025-04-20T14:30:00Z",
  },
  {
    id: "plant-3",
    name: "薄荷",
    species: "Mentha",
    category: "香草植物",
    plantedDate: "2025-05-10",
    location: "厨房窗台",
    avatar: "🍃",
    notes: "生长旺盛，可采摘泡水。需要充足水分。",
    createdAt: "2025-05-10T09:15:00Z",
    updatedAt: "2025-05-10T09:15:00Z",
  },
  {
    id: "plant-4",
    name: "月季",
    species: "Rosa chinensis",
    category: "开花植物",
    plantedDate: "2025-02-28",
    location: "阳台东",
    avatar: "🌹",
    notes: "需要充足阳光，注意防治黑斑病和蚜虫。",
    createdAt: "2025-02-28T11:00:00Z",
    updatedAt: "2025-02-28T11:00:00Z",
  },
];

const createMockCareLogs = (): CareLog[] => {
  const logs: CareLog[] = [];
  for (let i = 0; i < 25; i++) {
    const date = getDaysAgo(i);
    const plantIndex = i % 4;
    const types: CareLog["type"][] = ["watering", "watering", "watering", "fertilizing", "lighting"];
    const type = types[i % 5];
    logs.push({
      id: `care-${i}`,
      plantId: `plant-${plantIndex + 1}`,
      type,
      date,
      amount: type === "watering" ? 100 + (i % 5) * 50 : type === "fertilizing" ? 5 + (i % 3) * 2 : undefined,
      fertilizerType: type === "fertilizing" ? ["复合肥", "有机肥", "液肥"][i % 3] : undefined,
      lightDuration: type === "lighting" ? 2 + (i % 6) : undefined,
      lightIntensity: type === "lighting" ? (["low", "medium", "high"] as const)[i % 3] : undefined,
      notes: "",
      createdAt: `${date}T08:00:00Z`,
    });
  }
  return logs;
};

const MOCK_CARE_LOGS = createMockCareLogs();

const MOCK_LEAF_RECORDS: LeafRecord[] = [
  {
    id: "leaf-1",
    plantId: "plant-1",
    date: getDaysAgo(3),
    colorStatus: "normal",
    spots: [],
    curlStatus: "none",
    images: [],
    notes: "叶片翠绿，生长状态良好。",
    newLeaves: {
      count: 2,
      size: "小",
      description: "新长出2片嫩叶，颜色嫩黄绿色",
    },
    leafSize: {
      previousLength: 8,
      currentLength: 10,
      previousWidth: 4,
      currentWidth: 5,
      unit: "cm",
      growthRate: "+25%",
      description: "最大叶片明显增大，叶形饱满",
    },
    createdAt: `${getDaysAgo(3)}T10:00:00Z`,
  },
  {
    id: "leaf-2",
    plantId: "plant-4",
    date: getDaysAgo(5),
    colorStatus: "spotting",
    spots: [
      { type: "病斑", color: "褐色", size: "小", description: "叶片边缘出现小褐色斑点" },
    ],
    curlStatus: "none",
    images: [],
    notes: "疑似黑斑病初期，已摘除病叶。",
    newLeaves: {
      count: 1,
      size: "小",
      description: "顶芽抽出1片新叶，暂时未发现病斑",
    },
    leafSize: {
      previousLength: 6,
      currentLength: 6.5,
      previousWidth: 3,
      currentWidth: 3.2,
      unit: "cm",
      growthRate: "+8%",
      description: "生长速度偏慢，可能受病害影响",
    },
    createdAt: `${getDaysAgo(5)}T09:30:00Z`,
  },
  {
    id: "leaf-3",
    plantId: "plant-2",
    date: getDaysAgo(10),
    colorStatus: "normal",
    spots: [],
    curlStatus: "none",
    images: [],
    notes: "多肉状态不错，叶片饱满有光泽。",
    newLeaves: {
      count: 3,
      size: "小",
      description: "中心长出3片新叶，呈莲座状排列",
    },
    createdAt: `${getDaysAgo(10)}T14:00:00Z`,
  },
];

const MOCK_PEST_RECORDS: PestRecord[] = [
  {
    id: "pest-1",
    plantId: "plant-4",
    type: "disease",
    name: "黑斑病",
    discoveredDate: getDaysAgo(7),
    severity: "medium",
    symptoms: "叶片出现褐色圆形斑点，逐渐扩大，边缘有黄色晕圈。",
    images: [],
    treatmentMethod: "摘除所有病叶，喷施多菌灵可湿性粉剂800倍液，每周一次，连续3次。",
    treatmentDate: getDaysAgo(6),
    treatmentEffect: "有效果，新长出的叶片未出现病斑。",
    followUpNotes: "继续观察，保持通风，避免叶片积水。",
    status: "ongoing",
    createdAt: `${getDaysAgo(7)}T14:00:00Z`,
    updatedAt: `${getDaysAgo(2)}T10:00:00Z`,
  },
  {
    id: "pest-2",
    plantId: "plant-3",
    type: "pest",
    name: "蚜虫",
    discoveredDate: getDaysAgo(14),
    severity: "low",
    symptoms: "嫩梢和叶背发现少量绿色小虫，有轻微粘腻分泌物。",
    images: [],
    treatmentMethod: "用清水冲洗，喷施稀释的肥皂水。",
    treatmentDate: getDaysAgo(13),
    treatmentEffect: "完全清除，未再发现蚜虫。",
    followUpNotes: "薄荷生长旺盛，定期检查。",
    status: "resolved",
    resolvedDate: getDaysAgo(10),
    createdAt: `${getDaysAgo(14)}T16:00:00Z`,
    updatedAt: `${getDaysAgo(10)}T11:00:00Z`,
  },
  {
    id: "pest-3",
    plantId: "plant-4",
    type: "disease",
    name: "黑斑病",
    discoveredDate: getDaysAgo(45),
    severity: "high",
    symptoms: "叶片大量出现黑色斑点，严重叶片发黄脱落。",
    images: [],
    treatmentMethod: "剪除全部病叶并销毁，喷施百菌清可湿性粉剂600倍液，每周一次，连续4次。",
    treatmentDate: getDaysAgo(44),
    treatmentEffect: "完全治愈，一个月内未再复发。",
    followUpNotes: "保持良好通风，避免浇水时淋湿叶片。",
    status: "resolved",
    resolvedDate: getDaysAgo(30),
    createdAt: `${getDaysAgo(45)}T10:00:00Z`,
    updatedAt: `${getDaysAgo(30)}T15:00:00Z`,
  },
  {
    id: "pest-4",
    plantId: "plant-4",
    type: "disease",
    name: "黑斑病",
    discoveredDate: getDaysAgo(90),
    severity: "medium",
    symptoms: "下部叶片出现少量褐色斑点。",
    images: [],
    treatmentMethod: "摘除病叶，喷施代森锰锌可湿性粉剂800倍液。",
    treatmentDate: getDaysAgo(89),
    treatmentEffect: "明显好转，病斑不再扩大。",
    followUpNotes: "注意观察，定期喷洒保护性杀菌剂。",
    status: "resolved",
    resolvedDate: getDaysAgo(75),
    createdAt: `${getDaysAgo(90)}T09:00:00Z`,
    updatedAt: `${getDaysAgo(75)}T14:00:00Z`,
  },
  {
    id: "pest-5",
    plantId: "plant-3",
    type: "pest",
    name: "蚜虫",
    discoveredDate: getDaysAgo(3),
    severity: "medium",
    symptoms: "嫩茎和叶背聚集大量绿色蚜虫，叶片轻微卷曲。",
    images: [],
    treatmentMethod: "",
    treatmentDate: "",
    treatmentEffect: "",
    followUpNotes: "",
    status: "ongoing",
    createdAt: `${getDaysAgo(3)}T11:00:00Z`,
    updatedAt: `${getDaysAgo(3)}T11:00:00Z`,
  },
  {
    id: "pest-6",
    plantId: "plant-1",
    type: "disease",
    name: "叶斑病",
    discoveredDate: getDaysAgo(60),
    severity: "low",
    symptoms: "老叶出现少量褐色小斑点。",
    images: [],
    treatmentMethod: "摘除病叶，保持通风。",
    treatmentDate: getDaysAgo(59),
    treatmentEffect: "完全清除，未再复发。",
    followUpNotes: "定期检查老叶。",
    status: "resolved",
    resolvedDate: getDaysAgo(50),
    createdAt: `${getDaysAgo(60)}T13:00:00Z`,
    updatedAt: `${getDaysAgo(50)}T10:00:00Z`,
  },
];

const createInitialCarePlans = (): CarePlan[] => {
  return DEFAULT_CARE_PLANS.map((plan) => ({
    ...plan,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  }));
};

const MOCK_CARE_PLANS = createInitialCarePlans();

const createInitialCareTemplates = (): CareTemplate[] => {
  return PRESET_CARE_TEMPLATES.map((template) => ({
    ...template,
    id: generateId(),
    isPreset: true,
    createdAt: now(),
    updatedAt: now(),
  }));
};

const MOCK_CARE_TEMPLATES = createInitialCareTemplates();

const createMockEnvironmentRecords = (): EnvironmentRecord[] => {
  const locations = ["客厅窗边", "阳台南", "厨房窗台", "阳台东"];
  const records: EnvironmentRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const date = getDaysAgo(i);
    locations.forEach((location, locIdx) => {
      const baseTemp = 20 + locIdx * 2;
      const baseHumidity = 55 + locIdx * 5;
      const baseLight = 3000 + locIdx * 2000;
      records.push({
        id: `env-${i}-${locIdx}`,
        location,
        date,
        temperature: Math.round((baseTemp + (Math.random() - 0.5) * 8) * 10) / 10,
        humidity: Math.round(baseHumidity + (Math.random() - 0.5) * 20),
        light: Math.round(baseLight + (Math.random() - 0.5) * 3000),
        notes: "",
        createdAt: `${date}T08:00:00Z`,
      });
    });
  }
  return records;
};

const MOCK_ENVIRONMENT_RECORDS = createMockEnvironmentRecords();

const createMockExpenseRecords = (): ExpenseRecord[] => {
  const records: ExpenseRecord[] = [];
  const categories: ExpenseCategory[] = [
    "repotting",
    "fertilizer",
    "pest_control",
    "tools",
    "soil",
    "pot",
    "other",
  ];
  const descriptions: Record<ExpenseCategory, string[]> = {
    repotting: ["春季换盆", "换大盆", "根系修剪换盆"],
    fertilizer: ["复合肥", "有机肥", "液肥", "缓释肥"],
    pest_control: ["多菌灵", "百菌清", "杀虫剂", "蚜虫药"],
    tools: ["园艺剪刀", "喷壶", "铲子", "手套"],
    soil: ["营养土", "泥炭土", "珍珠岩", "蛭石"],
    pot: ["陶瓷盆", "塑料盆", "红陶盆", "多肉盆"],
    other: ["标签", "底托", "肥料盒", "其他用品"],
  };

  for (let i = 0; i < 20; i++) {
    const date = getDaysAgo(i * 8 + Math.floor(Math.random() * 5));
    const plantIndex = i % 4;
    const category = categories[i % 7];
    const descList = descriptions[category];
    const description = descList[i % descList.length];

    records.push({
      id: `expense-${i}`,
      plantId: `plant-${plantIndex + 1}`,
      category,
      amount: Math.round((20 + Math.random() * 180) * 100) / 100,
      date,
      description,
      notes: i % 3 === 0 ? "网购" : i % 3 === 1 ? "花店购买" : "",
      createdAt: `${date}T10:00:00Z`,
    });
  }
  return records;
};

const MOCK_EXPENSE_RECORDS = createMockExpenseRecords();

interface AppState {
  plants: Plant[];
  careLogs: CareLog[];
  leafRecords: LeafRecord[];
  pestRecords: PestRecord[];
  carePlans: CarePlan[];
  careTemplates: CareTemplate[];
  environmentRecords: EnvironmentRecord[];
  expenseRecords: ExpenseRecord[];

  addPlant: (
    plant: Omit<Plant, "id" | "createdAt" | "updatedAt">
  ) => void;
  addPlantWithTemplate: (
    plant: Omit<Plant, "id" | "createdAt" | "updatedAt">,
    templateId: string
  ) => string;
  updatePlant: (id: string, data: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  getPlantById: (id: string) => Plant | undefined;

  addCareLog: (log: Omit<CareLog, "id" | "createdAt">) => void;
  updateCareLog: (id: string, data: Partial<CareLog>) => void;
  deleteCareLog: (id: string) => void;
  getCareLogsByPlant: (plantId: string) => CareLog[];

  addLeafRecord: (
    record: Omit<LeafRecord, "id" | "createdAt">
  ) => void;
  updateLeafRecord: (id: string, data: Partial<LeafRecord>) => void;
  deleteLeafRecord: (id: string) => void;
  getLeafRecordsByPlant: (plantId: string) => LeafRecord[];

  addPestRecord: (
    record: Omit<PestRecord, "id" | "createdAt" | "updatedAt">
  ) => void;
  updatePestRecord: (id: string, data: Partial<PestRecord>) => void;
  deletePestRecord: (id: string) => void;
  getPestRecordsByPlant: (plantId: string) => PestRecord[];

  addCarePlan: (plan: Omit<CarePlan, "id" | "createdAt" | "updatedAt">) => void;
  updateCarePlan: (id: string, data: Partial<CarePlan>) => void;
  deleteCarePlan: (id: string) => void;
  toggleCarePlan: (id: string) => void;

  addCareTemplate: (template: Omit<CareTemplate, "id" | "createdAt" | "updatedAt" | "isPreset">) => void;
  updateCareTemplate: (id: string, data: Partial<CareTemplate>) => void;
  deleteCareTemplate: (id: string) => void;
  getCareTemplatesByCategory: (category: string) => CareTemplate[];
  getTemplateById: (id: string) => CareTemplate | undefined;
  applyTemplateToPlant: (plantId: string, templateId: string) => boolean;

  addEnvironmentRecord: (
    record: Omit<EnvironmentRecord, "id" | "createdAt">
  ) => void;
  updateEnvironmentRecord: (id: string, data: Partial<EnvironmentRecord>) => void;
  deleteEnvironmentRecord: (id: string) => void;
  getEnvironmentRecordsByLocation: (location: string) => EnvironmentRecord[];
  getEnvironmentLocations: () => string[];

  addExpenseRecord: (record: Omit<ExpenseRecord, "id" | "createdAt">) => void;
  updateExpenseRecord: (id: string, data: Partial<ExpenseRecord>) => void;
  deleteExpenseRecord: (id: string) => void;
  getExpenseRecordsByPlant: (plantId: string) => ExpenseRecord[];
  getPlantYearlyExpenses: (year: number) => PlantYearlyExpense[];
  getCategoryExpenseSummary: (year?: number) => CategoryExpenseSummary[];
  getExpenseYears: () => number[];

  getCareTodos: () => CareTodo[];
  getPendingTodoCount: () => number;
  completeTodoWithLog: (
    todoId: string,
    overrideData?: Partial<Omit<CareLog, "id" | "createdAt" | "plantId" | "type" | "date">>
  ) => boolean;

  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
  resetWithMockData: () => void;

  searchGlobal: (keyword: string) => SearchResults;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plants: MOCK_PLANTS,
      careLogs: MOCK_CARE_LOGS,
      leafRecords: MOCK_LEAF_RECORDS,
      pestRecords: MOCK_PEST_RECORDS,
      carePlans: MOCK_CARE_PLANS,
      careTemplates: MOCK_CARE_TEMPLATES,
      environmentRecords: MOCK_ENVIRONMENT_RECORDS,
      expenseRecords: MOCK_EXPENSE_RECORDS,

      addPlant: (plant) =>
        set((state) => ({
          plants: [
            ...state.plants,
            {
              ...plant,
              id: generateId(),
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      addPlantWithTemplate: (plant, templateId) => {
        const template = get().careTemplates.find((t) => t.id === templateId);
        const newPlantId = generateId();
        
        set((state) => {
          const newPlant: Plant = {
            ...plant,
            id: newPlantId,
            createdAt: now(),
            updatedAt: now(),
          };

          let newPlans: CarePlan[] = [];
          if (template) {
            newPlans = [
              {
                id: generateId(),
                category: plant.category as any,
                taskType: "watering",
                intervalDays: template.watering.intervalDays,
                defaultAmount: template.watering.defaultAmount,
                enabled: true,
                createdAt: now(),
                updatedAt: now(),
              },
              {
                id: generateId(),
                category: plant.category as any,
                taskType: "fertilizing",
                intervalDays: template.fertilizing.intervalDays,
                defaultAmount: template.fertilizing.defaultAmount,
                defaultFertilizerType: template.fertilizing.defaultFertilizerType,
                enabled: true,
                createdAt: now(),
                updatedAt: now(),
              },
            ];
          }

          return {
            plants: [...state.plants, newPlant],
            carePlans: [...state.carePlans, ...newPlans],
          };
        });

        return newPlantId;
      },

      updatePlant: (id, data) =>
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p
          ),
        })),

      deletePlant: (id) =>
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
          careLogs: state.careLogs.filter((l) => l.plantId !== id),
          leafRecords: state.leafRecords.filter((l) => l.plantId !== id),
          pestRecords: state.pestRecords.filter((p) => p.plantId !== id),
        })),

      getPlantById: (id) => get().plants.find((p) => p.id === id),

      addCareLog: (log) =>
        set((state) => ({
          careLogs: [
            { ...log, id: generateId(), createdAt: now() },
            ...state.careLogs,
          ],
        })),

      updateCareLog: (id, data) =>
        set((state) => ({
          careLogs: state.careLogs.map((l) =>
            l.id === id ? { ...l, ...data } : l
          ),
        })),

      deleteCareLog: (id) =>
        set((state) => ({
          careLogs: state.careLogs.filter((l) => l.id !== id),
        })),

      getCareLogsByPlant: (plantId) =>
        get()
          .careLogs.filter((l) => l.plantId === plantId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      addLeafRecord: (record) =>
        set((state) => ({
          leafRecords: [
            { ...record, id: generateId(), createdAt: now() },
            ...state.leafRecords,
          ],
        })),

      updateLeafRecord: (id, data) =>
        set((state) => ({
          leafRecords: state.leafRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteLeafRecord: (id) =>
        set((state) => ({
          leafRecords: state.leafRecords.filter((r) => r.id !== id),
        })),

      getLeafRecordsByPlant: (plantId) =>
        get()
          .leafRecords.filter((r) => r.plantId === plantId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      addPestRecord: (record) =>
        set((state) => ({
          pestRecords: [
            {
              ...record,
              id: generateId(),
              createdAt: now(),
              updatedAt: now(),
            },
            ...state.pestRecords,
          ],
        })),

      updatePestRecord: (id, data) =>
        set((state) => ({
          pestRecords: state.pestRecords.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p
          ),
        })),

      deletePestRecord: (id) =>
        set((state) => ({
          pestRecords: state.pestRecords.filter((p) => p.id !== id),
        })),

      getPestRecordsByPlant: (plantId) =>
        get()
          .pestRecords.filter((p) => p.plantId === plantId)
          .sort((a, b) => b.discoveredDate.localeCompare(a.discoveredDate)),

      addCarePlan: (plan) =>
        set((state) => ({
          carePlans: [
            ...state.carePlans,
            {
              ...plan,
              id: generateId(),
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      updateCarePlan: (id, data) =>
        set((state) => ({
          carePlans: state.carePlans.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p
          ),
        })),

      deleteCarePlan: (id) =>
        set((state) => ({
          carePlans: state.carePlans.filter((p) => p.id !== id),
        })),

      toggleCarePlan: (id) =>
        set((state) => ({
          carePlans: state.carePlans.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled, updatedAt: now() } : p
          ),
        })),

      addCareTemplate: (template) =>
        set((state) => ({
          careTemplates: [
            ...state.careTemplates,
            {
              ...template,
              id: generateId(),
              isPreset: false,
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        })),

      updateCareTemplate: (id, data) =>
        set((state) => ({
          careTemplates: state.careTemplates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: now() } : t
          ),
        })),

      deleteCareTemplate: (id) =>
        set((state) => ({
          careTemplates: state.careTemplates.filter((t) => t.id !== id),
        })),

      getCareTemplatesByCategory: (category) =>
        get().careTemplates.filter((t) => t.category === category),

      getTemplateById: (id) => get().careTemplates.find((t) => t.id === id),

      applyTemplateToPlant: (plantId, templateId) => {
        const template = get().careTemplates.find((t) => t.id === templateId);
        const plant = get().getPlantById(plantId);
        
        if (!template || !plant) return false;

        set((state) => {
          const categoryPlans = state.carePlans.filter(
            (p) => p.category === plant.category
          );
          const otherPlans = state.carePlans.filter(
            (p) => p.category !== plant.category
          );

          const newPlans: CarePlan[] = [
            {
              id: generateId(),
              category: plant.category as PlantCategory,
              taskType: "watering",
              intervalDays: template.watering.intervalDays,
              defaultAmount: template.watering.defaultAmount,
              enabled: true,
              createdAt: now(),
              updatedAt: now(),
            },
            {
              id: generateId(),
              category: plant.category as PlantCategory,
              taskType: "fertilizing",
              intervalDays: template.fertilizing.intervalDays,
              defaultAmount: template.fertilizing.defaultAmount,
              defaultFertilizerType: template.fertilizing.defaultFertilizerType,
              enabled: true,
              createdAt: now(),
              updatedAt: now(),
            },
          ];

          return {
            carePlans: [...otherPlans, ...newPlans],
          };
        });

        return true;
      },

      addEnvironmentRecord: (record) =>
        set((state) => ({
          environmentRecords: [
            { ...record, id: generateId(), createdAt: now() },
            ...state.environmentRecords,
          ],
        })),

      updateEnvironmentRecord: (id, data) =>
        set((state) => ({
          environmentRecords: state.environmentRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteEnvironmentRecord: (id) =>
        set((state) => ({
          environmentRecords: state.environmentRecords.filter((r) => r.id !== id),
        })),

      getEnvironmentRecordsByLocation: (location) =>
        get()
          .environmentRecords.filter((r) => r.location === location)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getEnvironmentLocations: () => {
        const locations = new Set(get().environmentRecords.map((r) => r.location));
        get().plants.forEach((p) => p.location && locations.add(p.location));
        return Array.from(locations);
      },

      addExpenseRecord: (record) =>
        set((state) => ({
          expenseRecords: [
            { ...record, id: generateId(), createdAt: now() },
            ...state.expenseRecords,
          ],
        })),

      updateExpenseRecord: (id, data) =>
        set((state) => ({
          expenseRecords: state.expenseRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteExpenseRecord: (id) =>
        set((state) => ({
          expenseRecords: state.expenseRecords.filter((r) => r.id !== id),
        })),

      getExpenseRecordsByPlant: (plantId) =>
        get()
          .expenseRecords.filter((r) => r.plantId === plantId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getPlantYearlyExpenses: (year) => {
        const { plants, expenseRecords } = get();
        const yearStr = String(year);

        return plants.map((plant) => {
          const plantExpenses = expenseRecords.filter(
            (r) => r.plantId === plant.id && r.date.startsWith(yearStr)
          );

          const categoryBreakdown = {} as Record<ExpenseCategory, number>;
          (["repotting", "fertilizer", "pest_control", "tools", "soil", "pot", "other"] as ExpenseCategory[]).forEach(
            (cat) => {
              categoryBreakdown[cat] = 0;
            }
          );

          let totalAmount = 0;
          plantExpenses.forEach((r) => {
            totalAmount += r.amount;
            categoryBreakdown[r.category] += r.amount;
          });

          return {
            plantId: plant.id,
            plantName: plant.name,
            plantAvatar: plant.avatar,
            year,
            totalAmount: Math.round(totalAmount * 100) / 100,
            categoryBreakdown,
            recordCount: plantExpenses.length,
          };
        });
      },

      getCategoryExpenseSummary: (year) => {
        const { expenseRecords } = get();
        const categories: ExpenseCategory[] = [
          "repotting",
          "fertilizer",
          "pest_control",
          "tools",
          "soil",
          "pot",
          "other",
        ];

        const filtered = year
          ? expenseRecords.filter((r) => r.date.startsWith(String(year)))
          : expenseRecords;

        const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);

        return categories.map((category) => {
          const categoryRecords = filtered.filter((r) => r.category === category);
          const catTotal = categoryRecords.reduce((sum, r) => sum + r.amount, 0);

          return {
            category,
            totalAmount: Math.round(catTotal * 100) / 100,
            recordCount: categoryRecords.length,
            percentage: totalAmount > 0 ? Math.round((catTotal / totalAmount) * 10000) / 100 : 0,
          };
        });
      },

      getExpenseYears: () => {
        const years = new Set(get().expenseRecords.map((r) => Number(r.date.slice(0, 4))));
        return Array.from(years).sort((a, b) => b - a);
      },

      getCareTodos: () => {
        const { plants, carePlans, careLogs } = get();
        return generateCareTodos(plants, carePlans, careLogs);
      },

      getPendingTodoCount: () => {
        return get().getCareTodos().length;
      },

      completeTodoWithLog: (todoId, overrideData) => {
        const todos = get().getCareTodos();
        const todo = todos.find((t) => t.id === todoId);
        if (!todo) return false;

        const logData: Omit<CareLog, "id" | "createdAt"> = {
          plantId: todo.plantId,
          type: todo.taskType,
          date: today(),
          notes: "",
          ...(todo.taskType === "watering" && todo.defaultAmount !== undefined
            ? { amount: todo.defaultAmount }
            : {}),
          ...(todo.taskType === "fertilizing"
            ? {
                amount: todo.defaultAmount,
                fertilizerType: todo.defaultFertilizerType,
              }
            : {}),
          ...overrideData,
        };

        get().addCareLog(logData);
        return true;
      },

      exportData: () => {
        const { plants, careLogs, leafRecords, pestRecords, carePlans, careTemplates, environmentRecords, expenseRecords } = get();
        return JSON.stringify(
          {
            version: "1.1.0",
            exportedAt: now(),
            plants,
            careLogs,
            leafRecords,
            pestRecords,
            carePlans,
            careTemplates,
            environmentRecords,
            expenseRecords,
          },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (
            data &&
            Array.isArray(data.plants) &&
            Array.isArray(data.careLogs) &&
            Array.isArray(data.leafRecords) &&
            Array.isArray(data.pestRecords)
          ) {
            set({
              plants: data.plants,
              careLogs: data.careLogs,
              leafRecords: data.leafRecords,
              pestRecords: data.pestRecords,
              carePlans: data.carePlans || createInitialCarePlans(),
              careTemplates: data.careTemplates || createInitialCareTemplates(),
              environmentRecords: data.environmentRecords || [],
              expenseRecords: data.expenseRecords || [],
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      clearAllData: () =>
        set({
          plants: [],
          careLogs: [],
          leafRecords: [],
          pestRecords: [],
          carePlans: [],
          careTemplates: [],
          environmentRecords: [],
          expenseRecords: [],
        }),

      resetWithMockData: () =>
        set({
          plants: MOCK_PLANTS,
          careLogs: MOCK_CARE_LOGS,
          leafRecords: MOCK_LEAF_RECORDS,
          pestRecords: MOCK_PEST_RECORDS,
          carePlans: MOCK_CARE_PLANS,
          careTemplates: MOCK_CARE_TEMPLATES,
          environmentRecords: MOCK_ENVIRONMENT_RECORDS,
          expenseRecords: MOCK_EXPENSE_RECORDS,
        }),

      searchGlobal: (keyword) => {
        const trimmed = keyword.trim().toLowerCase();
        const empty: SearchResults = { plant: [], careLog: [], leaf: [], pest: [], total: 0 };

        if (!trimmed) return empty;

        const { plants, careLogs, leafRecords, pestRecords } = get();

        const matchText = (text: string): boolean => {
          if (!text) return false;
          return text.toLowerCase().includes(trimmed);
        };

        const truncate = (text: string, maxLen = 80): string => {
          if (!text) return "";
          return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
        };

        const findPlantById = (id: string) => plants.find((p) => p.id === id);

        const matched: SearchResults = {
          plant: [],
          careLog: [],
          leaf: [],
          pest: [],
          total: 0,
        };

        plants.forEach((plant) => {
          const matchedFields: string[] = [];
          if (matchText(plant.name)) matchedFields.push("名称");
          if (matchText(plant.species)) matchedFields.push("学名");
          if (matchText(plant.category)) matchedFields.push("分类");
          if (matchText(plant.location)) matchedFields.push("位置");
          if (matchText(plant.notes)) matchedFields.push("备注");

          if (matchedFields.length > 0) {
            matched.plant.push({
              id: plant.id,
              category: "plant",
              title: plant.name,
              summary: truncate(
                [plant.species, plant.category, plant.location, plant.notes].filter(Boolean).join(" · ")
              ),
              matchedFields,
              plantId: plant.id,
              plantName: plant.name,
              plantAvatar: plant.avatar,
              date: plant.plantedDate,
              navigateTo: `/plants/${plant.id}`,
            });
          }
        });

        careLogs.forEach((log) => {
          const plant = findPlantById(log.plantId);
          if (!plant) return;

          const matchedFields: string[] = [];
          if (matchText(CARE_TYPE_LABELS[log.type])) matchedFields.push("类型");
          if (log.amount !== undefined && matchText(String(log.amount))) matchedFields.push("用量");
          if (matchText(log.fertilizerType || "")) matchedFields.push("肥料");
          if (log.lightDuration !== undefined && matchText(String(log.lightDuration))) matchedFields.push("光照时长");
          if (matchText(log.notes)) matchedFields.push("备注");
          if (matchText(plant.name)) matchedFields.push("植物名称");
          if (matchedFields.length === 0 && matchText(plant.species || "")) matchedFields.push("植物学名");

          if (matchedFields.length > 0) {
            let summaryParts: string[] = [];
            if (log.type === "watering" && log.amount) summaryParts.push(`浇水 ${log.amount}ml`);
            if (log.type === "fertilizing" && log.fertilizerType) summaryParts.push(`施肥 ${log.fertilizerType}`);
            if (log.type === "lighting") summaryParts.push(`光照 ${log.lightDuration || "-"}小时`);
            if (log.notes) summaryParts.push(log.notes);

            matched.careLog.push({
              id: log.id,
              category: "careLog",
              title: `${CARE_TYPE_LABELS[log.type]}记录`,
              summary: truncate(summaryParts.join(" · ")),
              matchedFields,
              plantId: plant.id,
              plantName: plant.name,
              plantAvatar: plant.avatar,
              date: log.date,
              navigateTo: `/plants/${plant.id}?record=care-${log.id}`,
            });
          }
        });

        leafRecords.forEach((record) => {
          const plant = findPlantById(record.plantId);
          if (!plant) return;

          const matchedFields: string[] = [];
          if (matchText(LEAF_COLOR_LABELS[record.colorStatus])) matchedFields.push("颜色状态");
          if (matchText(LEAF_CURL_LABELS[record.curlStatus])) matchedFields.push("卷曲状态");
          if (matchText(record.notes)) matchedFields.push("备注");
          if (matchText(plant.name)) matchedFields.push("植物名称");
          if (matchedFields.length === 0 && matchText(plant.species || "")) matchedFields.push("植物学名");

          record.spots.forEach((spot, idx) => {
            if (matchText(spot.type) || matchText(spot.color) || matchText(spot.description)) {
              matchedFields.push(`斑点${idx + 1}`);
            }
          });

          if (record.newLeaves?.description && matchText(record.newLeaves.description)) {
            matchedFields.push("新叶描述");
          }
          if (record.leafSize?.description && matchText(record.leafSize.description)) {
            matchedFields.push("叶片大小描述");
          }

          if (matchedFields.length > 0) {
            const summaryParts: string[] = [];
            summaryParts.push(LEAF_COLOR_LABELS[record.colorStatus]);
            if (record.spots.length > 0) summaryParts.push(`${record.spots.length}处斑点`);
            if (record.notes) summaryParts.push(record.notes);

            matched.leaf.push({
              id: record.id,
              category: "leaf",
              title: "叶片观察记录",
              summary: truncate(summaryParts.join(" · ")),
              matchedFields,
              plantId: plant.id,
              plantName: plant.name,
              plantAvatar: plant.avatar,
              date: record.date,
              navigateTo: `/plants/${plant.id}?record=leaf-${record.id}`,
            });
          }
        });

        pestRecords.forEach((record) => {
          const plant = findPlantById(record.plantId);
          if (!plant) return;

          const matchedFields: string[] = [];
          if (matchText(record.name)) matchedFields.push("名称");
          if (matchText(PEST_TYPE_LABELS[record.type])) matchedFields.push("类型");
          if (matchText(record.symptoms)) matchedFields.push("症状");
          if (matchText(record.treatmentMethod)) matchedFields.push("防治方法");
          if (matchText(record.treatmentEffect)) matchedFields.push("处理效果");
          if (matchText(record.followUpNotes)) matchedFields.push("后续备注");
          if (matchText(plant.name)) matchedFields.push("植物名称");
          if (matchedFields.length === 0 && matchText(plant.species || "")) matchedFields.push("植物学名");

          if (matchedFields.length > 0) {
            matched.pest.push({
              id: record.id,
              category: "pest",
              title: `${PEST_TYPE_LABELS[record.type]}：${record.name}`,
              summary: truncate([record.symptoms, record.treatmentMethod].filter(Boolean).join(" · ")),
              matchedFields,
              plantId: plant.id,
              plantName: plant.name,
              plantAvatar: plant.avatar,
              date: record.discoveredDate,
              navigateTo: `/plants/${plant.id}?record=pest-${record.id}`,
            });
          }
        });

        matched.total =
          matched.plant.length + matched.careLog.length + matched.leaf.length + matched.pest.length;

        return matched;
      },
    }),
    {
      name: "plant-journal-storage",
    }
  )
);
