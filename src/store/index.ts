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
} from "@/types";
import { DEFAULT_CARE_PLANS } from "@/types";
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

interface AppState {
  plants: Plant[];
  careLogs: CareLog[];
  leafRecords: LeafRecord[];
  pestRecords: PestRecord[];
  carePlans: CarePlan[];
  environmentRecords: EnvironmentRecord[];

  addPlant: (
    plant: Omit<Plant, "id" | "createdAt" | "updatedAt">
  ) => void;
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

  addEnvironmentRecord: (
    record: Omit<EnvironmentRecord, "id" | "createdAt">
  ) => void;
  updateEnvironmentRecord: (id: string, data: Partial<EnvironmentRecord>) => void;
  deleteEnvironmentRecord: (id: string) => void;
  getEnvironmentRecordsByLocation: (location: string) => EnvironmentRecord[];
  getEnvironmentLocations: () => string[];

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plants: MOCK_PLANTS,
      careLogs: MOCK_CARE_LOGS,
      leafRecords: MOCK_LEAF_RECORDS,
      pestRecords: MOCK_PEST_RECORDS,
      carePlans: MOCK_CARE_PLANS,
      environmentRecords: MOCK_ENVIRONMENT_RECORDS,

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
        const { plants, careLogs, leafRecords, pestRecords, carePlans, environmentRecords } = get();
        return JSON.stringify(
          {
            version: "1.0.0",
            exportedAt: now(),
            plants,
            careLogs,
            leafRecords,
            pestRecords,
            carePlans,
            environmentRecords,
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
              environmentRecords: data.environmentRecords || [],
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
          environmentRecords: [],
        }),

      resetWithMockData: () =>
        set({
          plants: MOCK_PLANTS,
          careLogs: MOCK_CARE_LOGS,
          leafRecords: MOCK_LEAF_RECORDS,
          pestRecords: MOCK_PEST_RECORDS,
          carePlans: MOCK_CARE_PLANS,
          environmentRecords: MOCK_ENVIRONMENT_RECORDS,
        }),
    }),
    {
      name: "plant-journal-storage",
    }
  )
);
