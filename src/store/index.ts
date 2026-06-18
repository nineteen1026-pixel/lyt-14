import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Plant,
  CareLog,
  LeafRecord,
  PestRecord,
} from "@/types";
import { generateId, now } from "@/utils/format";
import { exportAllData, parseImportData } from "@/utils/export";

interface AppState {
  plants: Plant[];
  careLogs: CareLog[];
  leafRecords: LeafRecord[];
  pestRecords: PestRecord[];

  addPlant: (plant: Omit<Plant, "id" | "createdAt" | "updatedAt">) => void;
  updatePlant: (id: string, data: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  getPlantById: (id: string) => Plant | undefined;

  addCareLog: (log: Omit<CareLog, "id" | "createdAt">) => void;
  updateCareLog: (id: string, data: Partial<CareLog>) => void;
  deleteCareLog: (id: string) => void;
  getCareLogsByPlant: (plantId: string) => CareLog[];

  addLeafRecord: (record: Omit<LeafRecord, "id" | "createdAt">) => void;
  updateLeafRecord: (id: string, data: Partial<LeafRecord>) => void;
  deleteLeafRecord: (id: string) => void;
  getLeafRecordsByPlant: (plantId: string) => LeafRecord[];

  addPestRecord: (
    record: Omit<PestRecord, "id" | "createdAt" | "updatedAt">
  ) => void;
  updatePestRecord: (id: string, data: Partial<PestRecord>) => void;
  deletePestRecord: (id: string) => void;
  getPestRecordsByPlant: (plantId: string) => PestRecord[];

  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
  seedDemoData: () => void;
}

const initialPlants: Plant[] = [
  {
    id: "demo-1",
    name: "小绿萝",
    species: "绿萝",
    category: "观叶植物",
    plantedDate: "2026-03-15",
    location: "阳台东侧",
    avatar: "🌿",
    notes: "喜半阴环境，不耐强光直射",
    createdAt: "2026-03-15T10:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "demo-2",
    name: "多肉小胖",
    species: "玉露",
    category: "多肉植物",
    plantedDate: "2026-02-20",
    location: "阳台南侧",
    avatar: "🌵",
    notes: "耐旱，每周少量浇水即可",
    createdAt: "2026-02-20T09:00:00.000Z",
    updatedAt: "2026-02-20T09:00:00.000Z",
  },
  {
    id: "demo-3",
    name: "月季花开",
    species: "月季",
    category: "开花植物",
    plantedDate: "2026-01-10",
    location: "阳台花架",
    avatar: "🌹",
    notes: "需要充足阳光，定期修剪",
    createdAt: "2026-01-10T14:00:00.000Z",
    updatedAt: "2026-01-10T14:00:00.000Z",
  },
];

const initialCareLogs: CareLog[] = [
  {
    id: "log-1",
    plantId: "demo-1",
    type: "watering",
    date: "2026-06-15",
    amount: 200,
    notes: "土壤微干时浇水",
    createdAt: "2026-06-15T08:00:00.000Z",
  },
  {
    id: "log-2",
    plantId: "demo-1",
    type: "fertilizing",
    date: "2026-06-10",
    fertilizerType: "复合肥",
    amount: 5,
    notes: "稀释后施用",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "log-3",
    plantId: "demo-2",
    type: "watering",
    date: "2026-06-14",
    amount: 50,
    notes: "少量浇水",
    createdAt: "2026-06-14T10:00:00.000Z",
  },
  {
    id: "log-4",
    plantId: "demo-3",
    type: "lighting",
    date: "2026-06-16",
    lightDuration: 6,
    lightIntensity: "high",
    notes: "全天阳光充足",
    createdAt: "2026-06-16T18:00:00.000Z",
  },
  {
    id: "log-5",
    plantId: "demo-3",
    type: "watering",
    date: "2026-06-16",
    amount: 300,
    notes: "花期需水量大",
    createdAt: "2026-06-16T07:00:00.000Z",
  },
];

const initialLeafRecords: LeafRecord[] = [
  {
    id: "leaf-1",
    plantId: "demo-1",
    date: "2026-06-12",
    colorStatus: "normal",
    spots: [],
    curlStatus: "none",
    images: [],
    notes: "叶片翠绿，生长良好",
    createdAt: "2026-06-12T15:00:00.000Z",
  },
];

const initialPestRecords: PestRecord[] = [
  {
    id: "pest-1",
    plantId: "demo-3",
    type: "pest",
    name: "蚜虫",
    discoveredDate: "2026-06-08",
    severity: "low",
    symptoms: "新芽上发现少量蚜虫，叶片略微卷曲",
    images: [],
    treatmentMethod: "使用肥皂水喷洒叶片，并人工摘除受虫害严重的新芽",
    treatmentDate: "2026-06-09",
    treatmentEffect: "蚜虫数量明显减少，新叶生长正常",
    followUpNotes: "继续观察一周，如无复发即为痊愈",
    status: "resolved",
    resolvedDate: "2026-06-15",
    createdAt: "2026-06-08T11:00:00.000Z",
    updatedAt: "2026-06-15T11:00:00.000Z",
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plants: [],
      careLogs: [],
      leafRecords: [],
      pestRecords: [],

      addPlant: (plant) =>
        set((state) => ({
          plants: [
            ...state.plants,
            { ...plant, id: generateId(), createdAt: now(), updatedAt: now() },
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
          leafRecords: state.leafRecords.filter((r) => r.plantId !== id),
          pestRecords: state.pestRecords.filter((r) => r.plantId !== id),
        })),
      getPlantById: (id) => get().plants.find((p) => p.id === id),

      addCareLog: (log) =>
        set((state) => ({
          careLogs: [
            ...state.careLogs,
            { ...log, id: generateId(), createdAt: now() },
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
            ...state.leafRecords,
            { ...record, id: generateId(), createdAt: now() },
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
            ...state.pestRecords,
            { ...record, id: generateId(), createdAt: now(), updatedAt: now() },
          ],
        })),
      updatePestRecord: (id, data) =>
        set((state) => ({
          pestRecords: state.pestRecords.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: now() } : r
          ),
        })),
      deletePestRecord: (id) =>
        set((state) => ({
          pestRecords: state.pestRecords.filter((r) => r.id !== id),
        })),
      getPestRecordsByPlant: (plantId) =>
        get()
          .pestRecords.filter((r) => r.plantId === plantId)
          .sort((a, b) => b.discoveredDate.localeCompare(a.discoveredDate)),

      exportData: () => {
        const { plants, careLogs, leafRecords, pestRecords } = get();
        return exportAllData(plants, careLogs, leafRecords, pestRecords);
      },
      importData: (json) => {
        const data = parseImportData(json);
        if (!data) return false;
        set({
          plants: data.plants,
          careLogs: data.careLogs,
          leafRecords: data.leafRecords,
          pestRecords: data.pestRecords,
        });
        return true;
      },
      clearAllData: () =>
        set({
          plants: [],
          careLogs: [],
          leafRecords: [],
          pestRecords: [],
        }),
      seedDemoData: () =>
        set({
          plants: initialPlants,
          careLogs: initialCareLogs,
          leafRecords: initialLeafRecords,
          pestRecords: initialPestRecords,
        }),
    }),
    {
      name: "plant-journal-storage",
    }
  )
);
