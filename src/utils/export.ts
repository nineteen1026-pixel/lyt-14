import type {
  Plant,
  CareLog,
  LeafRecord,
  PestRecord,
  CareLogType,
  EnvironmentRecord,
  ExpenseRecord,
  ExpenseCategory,
  PlantYearlyExpense,
} from "@/types";

export interface ExportData {
  version: string;
  exportedAt: string;
  plants: Plant[];
  careLogs: CareLog[];
  leafRecords: LeafRecord[];
  pestRecords: PestRecord[];
  environmentRecords: EnvironmentRecord[];
}

export const exportAllData = (
  plants: Plant[],
  careLogs: CareLog[],
  leafRecords: LeafRecord[],
  pestRecords: PestRecord[],
  environmentRecords: EnvironmentRecord[] = []
): string => {
  const data: ExportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    plants,
    careLogs,
    leafRecords,
    pestRecords,
    environmentRecords,
  };
  return JSON.stringify(data, null, 2);
};

export const downloadJSON = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  triggerDownload(blob, filename);
};

export const downloadCSV = (content: string, filename: string): void => {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, filename);
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const plantsToCSV = (plants: Plant[]): string => {
  const headers = [
    "ID",
    "名称",
    "品种",
    "分类",
    "种植日期",
    "位置",
    "备注",
    "创建时间",
  ];
  const rows = plants.map((p) => [
    p.id,
    p.name,
    p.species,
    p.category,
    p.plantedDate,
    p.location,
    escapeCSV(p.notes),
    p.createdAt,
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

export const careLogsToCSV = (
  careLogs: CareLog[],
  plants: Plant[]
): string => {
  const plantMap = new Map(plants.map((p) => [p.id, p.name]));
  const typeLabels: Record<CareLogType, string> = {
    watering: "浇水",
    fertilizing: "施肥",
    lighting: "光照",
  };
  const headers = [
    "ID",
    "植物",
    "类型",
    "日期",
    "数量/时长",
    "肥料类型",
    "光照强度",
    "备注",
    "创建时间",
  ];
  const rows = careLogs.map((log) => [
    log.id,
    plantMap.get(log.plantId) || "",
    typeLabels[log.type],
    log.date,
    log.amount ?? log.lightDuration ?? "",
    log.fertilizerType || "",
    log.lightIntensity || "",
    escapeCSV(log.notes),
    log.createdAt,
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

export const pestsToCSV = (
  pestRecords: PestRecord[],
  plants: Plant[]
): string => {
  const plantMap = new Map(plants.map((p) => [p.id, p.name]));
  const severityLabels = { low: "轻微", medium: "中等", high: "严重" };
  const typeLabels = { disease: "病害", pest: "虫害" };
  const statusLabels = { ongoing: "处理中", resolved: "已解决" };

  const headers = [
    "ID",
    "植物",
    "类型",
    "名称",
    "发现日期",
    "严重程度",
    "症状",
    "防治方法",
    "处理日期",
    "处理效果",
    "状态",
    "解决日期",
  ];
  const rows = pestRecords.map((p) => [
    p.id,
    plantMap.get(p.plantId) || "",
    typeLabels[p.type],
    p.name,
    p.discoveredDate,
    severityLabels[p.severity],
    escapeCSV(p.symptoms),
    escapeCSV(p.treatmentMethod),
    p.treatmentDate,
    escapeCSV(p.treatmentEffect),
    statusLabels[p.status],
    p.resolvedDate || "",
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

const escapeCSV = (value: string): string => {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const environmentRecordsToCSV = (
  records: EnvironmentRecord[]
): string => {
  const headers = [
    "ID",
    "位置",
    "日期",
    "温度(°C)",
    "湿度(%)",
    "光照(lux)",
    "备注",
    "创建时间",
  ];
  const rows = records.map((r) => [
    r.id,
    r.location,
    r.date,
    r.temperature,
    r.humidity,
    r.light,
    escapeCSV(r.notes),
    r.createdAt,
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

export const parseImportData = (json: string): ExportData | null => {
  try {
    const data = JSON.parse(json);
    if (
      data &&
      Array.isArray(data.plants) &&
      Array.isArray(data.careLogs) &&
      Array.isArray(data.leafRecords) &&
      Array.isArray(data.pestRecords)
    ) {
      return data as ExportData;
    }
    return null;
  } catch {
    return null;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const expenseRecordsToCSV = (
  records: ExpenseRecord[],
  plants: Plant[]
): string => {
  const plantMap = new Map(plants.map((p) => [p.id, p.name]));
  const categoryLabels: Record<ExpenseCategory, string> = {
    repotting: "换盆",
    fertilizer: "肥料",
    pest_control: "病虫害防治",
    tools: "工具",
    soil: "土壤",
    pot: "花盆",
    other: "其他",
  };

  const headers = [
    "ID",
    "植物",
    "类别",
    "金额(元)",
    "日期",
    "描述",
    "备注",
    "创建时间",
  ];
  const rows = records.map((r) => [
    r.id,
    plantMap.get(r.plantId) || "",
    categoryLabels[r.category],
    r.amount.toFixed(2),
    r.date,
    escapeCSV(r.description),
    escapeCSV(r.notes),
    r.createdAt,
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

export const yearlyExpensesToCSV = (
  yearlyExpenses: PlantYearlyExpense[],
  year: number
): string => {
  const categoryLabels: Record<ExpenseCategory, string> = {
    repotting: "换盆",
    fertilizer: "肥料",
    pest_control: "病虫害防治",
    tools: "工具",
    soil: "土壤",
    pot: "花盆",
    other: "其他",
  };

  const headers = [
    "植物",
    "总支出(元)",
    "记录数",
    "换盆(元)",
    "肥料(元)",
    "病虫害防治(元)",
    "工具(元)",
    "土壤(元)",
    "花盆(元)",
    "其他(元)",
  ];
  const rows = yearlyExpenses.map((p) => [
    p.plantName,
    p.totalAmount.toFixed(2),
    p.recordCount,
    p.categoryBreakdown.repotting.toFixed(2),
    p.categoryBreakdown.fertilizer.toFixed(2),
    p.categoryBreakdown.pest_control.toFixed(2),
    p.categoryBreakdown.tools.toFixed(2),
    p.categoryBreakdown.soil.toFixed(2),
    p.categoryBreakdown.pot.toFixed(2),
    p.categoryBreakdown.other.toFixed(2),
  ]);

  const totalRow = [
    "合计",
    yearlyExpenses
      .reduce((sum, p) => sum + p.totalAmount, 0)
      .toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.recordCount, 0),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.repotting, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.fertilizer, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.pest_control, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.tools, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.soil, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.pot, 0).toFixed(2),
    yearlyExpenses.reduce((sum, p) => sum + p.categoryBreakdown.other, 0).toFixed(2),
  ];

  return [`${year}年度植物费用报表`, "", ...[headers, ...rows, totalRow].map((r) => r.join(","))].join("\n");
};
