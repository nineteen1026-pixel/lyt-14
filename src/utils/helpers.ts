import type {
  Plant,
  CareLog,
  LeafRecord,
  PestRecord,
  Severity,
  CarePlan,
  CareTodo,
  CareTaskType,
  PlantHealthScore,
  LeafColor,
  LeafCurl,
  PestRecurrenceAlert,
  RecurrenceRiskLevel,
} from "@/types";
import { getDaysAgo, formatDate, today, daysBetween } from "./format";

export const getPlantHealthStatus = (
  plant: Plant,
  careLogs: CareLog[],
  pestRecords: PestRecord[]
): "healthy" | "warning" | "danger" => {
  const activePests = pestRecords.filter(
    (p) => p.plantId === plant.id && p.status === "ongoing"
  );
  if (activePests.some((p) => p.severity === "high")) return "danger";
  if (activePests.length > 0) return "warning";

  const recentWatering = careLogs
    .filter((l) => l.plantId === plant.id && l.type === "watering")
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (recentWatering) {
    const daysSince = Math.abs(
      new Date().getTime() - new Date(recentWatering.date).getTime()
    ) / (1000 * 60 * 60 * 24);
    if (daysSince > 10) return "warning";
  } else {
    return "warning";
  }

  return "healthy";
};

export const getHealthStatusColor = (
  status: "healthy" | "warning" | "danger"
): string => {
  switch (status) {
    case "healthy":
      return "bg-forest-500";
    case "warning":
      return "bg-amber-500";
    case "danger":
      return "bg-red-500";
  }
};

export const getHealthStatusLabel = (
  status: "healthy" | "warning" | "danger"
): string => {
  switch (status) {
    case "healthy":
      return "健康";
    case "warning":
      return "需关注";
    case "danger":
      return "需处理";
  }
};

export const getSeverityColor = (severity: Severity): string => {
  switch (severity) {
    case "low":
      return "bg-amber-400";
    case "medium":
      return "bg-orange-500";
    case "high":
      return "bg-red-500";
  }
};

export const getCareStatsByDate = (
  careLogs: CareLog[],
  days = 30
): Array<{ date: string; watering: number; fertilizing: number; lighting: number }> => {
  const stats: Array<{
    date: string;
    watering: number;
    fertilizing: number;
    lighting: number;
  }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const dayLogs = careLogs.filter((l) => l.date === date);
    stats.push({
      date,
      watering: dayLogs.filter((l) => l.type === "watering").length,
      fertilizing: dayLogs.filter((l) => l.type === "fertilizing").length,
      lighting: dayLogs.filter((l) => l.type === "lighting").length,
    });
  }

  return stats;
};

export const getPlantsNeedingCare = (
  plants: Plant[],
  careLogs: CareLog[]
): Plant[] => {
  return plants.filter((plant) => {
    const recentWatering = careLogs
      .filter((l) => l.plantId === plant.id && l.type === "watering")
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (!recentWatering) return true;

    const daysSince = Math.abs(
      new Date().getTime() - new Date(recentWatering.date).getTime()
    ) / (1000 * 60 * 60 * 24);

    return daysSince > 5;
  });
};

export const getAllLeafImages = (
  leafRecords: LeafRecord[]
): Array<{ image: string; date: string; plantId: string; recordId: string }> => {
  const images: Array<{
    image: string;
    date: string;
    plantId: string;
    recordId: string;
  }> = [];
  leafRecords.forEach((record) => {
    record.images.forEach((img) => {
      images.push({
        image: img,
        date: record.date,
        plantId: record.plantId,
        recordId: record.id,
      });
    });
  });
  return images.sort((a, b) => b.date.localeCompare(a.date));
};

const getLastCareLogDate = (
  plantId: string,
  taskType: CareTaskType,
  careLogs: CareLog[]
): string | undefined => {
  const logs = careLogs
    .filter((l) => l.plantId === plantId && l.type === taskType)
    .sort((a, b) => b.date.localeCompare(a.date));
  return logs[0]?.date;
};

const calculateDueDate = (
  lastDate: string | undefined,
  plantedDate: string,
  intervalDays: number
): string => {
  const baseDate = lastDate || plantedDate;
  const d = new Date(baseDate);
  d.setDate(d.getDate() + intervalDays);
  return formatDate(d);
};

export const generateCareTodos = (
  plants: Plant[],
  carePlans: CarePlan[],
  careLogs: CareLog[]
): CareTodo[] => {
  const todos: CareTodo[] = [];
  const todayStr = today();

  const enabledPlans = carePlans.filter((p) => p.enabled);

  plants.forEach((plant) => {
    const matchingPlans = enabledPlans.filter(
      (p) => p.category === "all" || p.category === plant.category
    );

    matchingPlans.forEach((plan) => {
      const lastDate = getLastCareLogDate(plant.id, plan.taskType, careLogs);
      const dueDate = calculateDueDate(lastDate, plant.plantedDate, plan.intervalDays);
      const overdueDays = Math.max(
        0,
        Math.floor(
          (new Date(todayStr).getTime() - new Date(dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      let status: CareTodo["status"] = "pending";
      if (overdueDays > 0) status = "overdue";

      if (overdueDays >= 0 && dueDate <= todayStr) {
        todos.push({
          id: `todo-${plant.id}-${plan.taskType}`,
          plantId: plant.id,
          plantName: plant.name,
          plantAvatar: plant.avatar,
          taskType: plan.taskType,
          planId: plan.id,
          dueDate,
          lastDoneDate: lastDate,
          overdueDays,
          status,
          defaultAmount: plan.defaultAmount,
          defaultFertilizerType: plan.defaultFertilizerType,
        });
      }
    });
  });

  return todos.sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (a.status !== "overdue" && b.status === "overdue") return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });
};

const LEAF_COLOR_SCORES: Record<LeafColor, number> = {
  normal: 100,
  yellowing: 65,
  browning: 45,
  spotting: 55,
  wilting: 25,
};

const LEAF_CURL_SCORES: Record<LeafCurl, number> = {
  none: 100,
  slight: 80,
  moderate: 55,
  severe: 25,
};

const PEST_SEVERITY_SCORES: Record<Severity, number> = {
  low: 70,
  medium: 45,
  high: 15,
};

const calculateCareScore = (
  plant: Plant,
  careLogs: CareLog[],
  days: number = 30
): number => {
  const plantLogs = careLogs.filter((l) => l.plantId === plant.id);
  const recentLogs = plantLogs.filter(
    (l) => daysBetween(l.date, today()) <= days
  );

  if (recentLogs.length === 0) return 30;

  const wateringLogs = recentLogs.filter((l) => l.type === "watering");
  const fertilizingLogs = recentLogs.filter((l) => l.type === "fertilizing");
  const lightingLogs = recentLogs.filter((l) => l.type === "lighting");

  let wateringScore = 0;
  if (wateringLogs.length > 0) {
    const lastWatering = wateringLogs.sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0];
    const daysSinceWatering = daysBetween(lastWatering.date, today());

    if (daysSinceWatering <= 3) wateringScore = 100;
    else if (daysSinceWatering <= 7) wateringScore = 85;
    else if (daysSinceWatering <= 14) wateringScore = 65;
    else if (daysSinceWatering <= 21) wateringScore = 40;
    else wateringScore = 20;

    const frequencyScore = Math.min(
      (wateringLogs.length / (days / 5)) * 100,
      100
    );
    wateringScore = (wateringScore * 0.6 + frequencyScore * 0.4);
  }

  let fertilizingScore = 50;
  if (fertilizingLogs.length > 0) {
    const frequencyScore = Math.min(
      (fertilizingLogs.length / (days / 15)) * 100,
      100
    );
    fertilizingScore = 50 + frequencyScore * 0.5;
  }

  let lightingScore = 50;
  if (lightingLogs.length > 0) {
    const totalDuration = lightingLogs.reduce(
      (sum, l) => sum + (l.lightDuration || 0),
      0
    );
    const avgDuration = totalDuration / lightingLogs.length;
    if (avgDuration >= 6) lightingScore = 100;
    else if (avgDuration >= 4) lightingScore = 85;
    else if (avgDuration >= 2) lightingScore = 65;
    else lightingScore = 45;
  }

  const totalWeight = 0.5 + 0.3 + 0.2;
  const weightedScore =
    (wateringScore * 0.5 +
      fertilizingScore * 0.3 +
      lightingScore * 0.2) /
    totalWeight;

  return Math.round(Math.max(0, Math.min(100, weightedScore)));
};

const calculateLeafScore = (
  plant: Plant,
  leafRecords: LeafRecord[]
): number => {
  const plantRecords = leafRecords.filter((r) => r.plantId === plant.id);

  if (plantRecords.length === 0) return 70;

  const sortedRecords = plantRecords.sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  let totalScore = 0;
  let totalWeight = 0;

  sortedRecords.forEach((record, index) => {
    const weight = Math.max(0.1, 1 - index * 0.15);
    const colorScore = LEAF_COLOR_SCORES[record.colorStatus];
    const curlScore = LEAF_CURL_SCORES[record.curlStatus];

    let spotPenalty = 0;
    if (record.spots.length > 0) {
      spotPenalty = Math.min(record.spots.length * 15, 25);
    }

    const baseScore = colorScore * 0.55 + curlScore * 0.45;
    const recordScore = baseScore * (1 - spotPenalty / 100);
    totalScore += recordScore * weight;
    totalWeight += weight;
  });

  const avgScore = totalWeight > 0 ? totalScore / totalWeight : 70;

  const latestRecord = sortedRecords[0];
  const daysSinceLatest = daysBetween(latestRecord.date, today());
  let recencyFactor = 1;
  if (daysSinceLatest > 30) recencyFactor = 0.8;
  if (daysSinceLatest > 60) recencyFactor = 0.6;
  if (daysSinceLatest > 90) recencyFactor = 0.5;

  return Math.round(Math.max(0, Math.min(100, avgScore * recencyFactor)));
};

const calculatePestScore = (
  plant: Plant,
  pestRecords: PestRecord[]
): number => {
  const plantRecords = pestRecords.filter((p) => p.plantId === plant.id);

  if (plantRecords.length === 0) return 100;

  const activePests = plantRecords.filter((p) => p.status === "ongoing");
  const resolvedPests = plantRecords.filter((p) => p.status === "resolved");

  let activeScore = 100;
  if (activePests.length > 0) {
    const worstSeverity = activePests.reduce((worst, pest) => {
      const score = PEST_SEVERITY_SCORES[pest.severity];
      return Math.min(worst, score);
    }, 100);
    activeScore = worstSeverity;

    const countPenalty = (activePests.length - 1) * 10;
    activeScore = Math.max(0, activeScore - countPenalty);
  }

  let resolvedScore = 100;
  if (resolvedPests.length > 0) {
    const recentResolved = resolvedPests.filter(
      (p) => p.resolvedDate && daysBetween(p.resolvedDate, today()) <= 30
    );
    if (recentResolved.length > 0) {
      const worstSeverity = recentResolved.reduce((worst, pest) => {
        const score = PEST_SEVERITY_SCORES[pest.severity];
        return Math.min(worst, score);
      }, 100);
      resolvedScore = 60 + worstSeverity * 0.3;
    }
  }

  const finalScore = activeScore * 0.7 + resolvedScore * 0.3;
  return Math.round(Math.max(0, Math.min(100, finalScore)));
};

export const calculatePlantHealthScore = (
  plant: Plant,
  careLogs: CareLog[],
  leafRecords: LeafRecord[],
  pestRecords: PestRecord[]
): PlantHealthScore => {
  const careScore = calculateCareScore(plant, careLogs);
  const leafScore = calculateLeafScore(plant, leafRecords);
  const pestScore = calculatePestScore(plant, pestRecords);

  const total = Math.round(
    careScore * 0.3 + leafScore * 0.35 + pestScore * 0.35
  );

  let stars: number;
  let level: PlantHealthScore["level"];

  if (total >= 90) {
    stars = 5;
    level = "excellent";
  } else if (total >= 75) {
    stars = 4;
    level = "good";
  } else if (total >= 60) {
    stars = 3;
    level = "fair";
  } else if (total >= 40) {
    stars = 2;
    level = "poor";
  } else {
    stars = 1;
    level = "critical";
  }

  return {
    total,
    careScore,
    leafScore,
    pestScore,
    stars,
    level,
  };
};

const normalizePestName = (name: string): string => {
  return name.trim().toLowerCase();
};

const getEffectiveTreatment = (records: PestRecord[]): string => {
  const resolved = records.filter(
    (r) => r.status === "resolved" && r.treatmentMethod && r.treatmentEffect
  );
  if (resolved.length === 0) {
    const withTreatment = records.filter((r) => r.treatmentMethod);
    return withTreatment.length > 0 ? withTreatment[0].treatmentMethod : "";
  }

  const scored = resolved.map((r) => {
    let score = 0;
    const effect = r.treatmentEffect.toLowerCase();
    if (effect.includes("完全") || effect.includes("痊愈") || effect.includes("全部")) score = 3;
    else if (effect.includes("明显") || effect.includes("显著") || effect.includes("很好")) score = 2;
    else if (effect.includes("有效果") || effect.includes("有效") || effect.includes("好转")) score = 1;
    return { record: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].record.treatmentMethod;
};

const calculateAverageResolutionDays = (records: PestRecord[]): number => {
  const resolved = records.filter(
    (r) => r.status === "resolved" && r.resolvedDate
  );
  if (resolved.length === 0) return 0;

  const totalDays = resolved.reduce((sum, r) => {
    return sum + daysBetween(r.discoveredDate, r.resolvedDate!);
  }, 0);

  return Math.round(totalDays / resolved.length);
};

const determineRiskLevel = (
  recurrenceCount: number,
  hasOngoing: boolean,
  daysSinceLast: number
): RecurrenceRiskLevel => {
  if (hasOngoing && recurrenceCount > 0) return "high";
  if (recurrenceCount >= 2 && daysSinceLast <= 30) return "high";
  if (recurrenceCount >= 2) return "medium";
  if (recurrenceCount === 1 && daysSinceLast <= 14) return "medium";
  return "low";
};

export const getPestRecurrenceAlerts = (
  plants: Plant[],
  pestRecords: PestRecord[]
): PestRecurrenceAlert[] => {
  const alerts: PestRecurrenceAlert[] = [];

  plants.forEach((plant) => {
    const plantPests = pestRecords.filter((p) => p.plantId === plant.id);
    if (plantPests.length === 0) return;

    const pestGroups = new Map<string, PestRecord[]>();
    plantPests.forEach((pest) => {
      const key = normalizePestName(pest.name);
      if (!pestGroups.has(key)) {
        pestGroups.set(key, []);
      }
      pestGroups.get(key)!.push(pest);
    });

    pestGroups.forEach((records, pestKey) => {
      if (records.length < 2) return;

      const sorted = records.sort((a, b) =>
        b.discoveredDate.localeCompare(a.discoveredDate)
      );

      const ongoingRecord = sorted.find((r) => r.status === "ongoing");
      const historyRecords = sorted.filter((r) => r.status === "resolved");
      const recurrenceCount = historyRecords.length;
      const lastOccurrence = sorted[0];
      const lastDate = ongoingRecord
        ? ongoingRecord.discoveredDate
        : lastOccurrence.discoveredDate;
      const daysSinceLast = daysBetween(lastDate, today());
      const riskLevel = determineRiskLevel(
        recurrenceCount,
        !!ongoingRecord,
        daysSinceLast
      );
      const recommendedTreatment = getEffectiveTreatment(sorted);
      const avgResolutionDays = calculateAverageResolutionDays(sorted);

      alerts.push({
        id: `alert-${plant.id}-${pestKey}`,
        plantId: plant.id,
        plantName: plant.name,
        plantAvatar: plant.avatar,
        pestName: sorted[0].name,
        pestType: sorted[0].type,
        riskLevel,
        currentRecord: ongoingRecord,
        historyRecords,
        recurrenceCount,
        recommendedTreatment,
        lastOccurrenceDate: lastDate,
        averageResolutionDays: avgResolutionDays,
      });
    });
  });

  return alerts.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.riskLevel] - priority[b.riskLevel];
  });
};

export const getHighRiskRecurrenceCount = (
  plants: Plant[],
  pestRecords: PestRecord[]
): number => {
  const alerts = getPestRecurrenceAlerts(plants, pestRecords);
  return alerts.filter((a) => a.riskLevel === "high").length;
};

export const getPestHistoryByPlantAndName = (
  plantId: string,
  pestName: string,
  pestRecords: PestRecord[]
): PestRecord[] => {
  const key = normalizePestName(pestName);
  return pestRecords
    .filter(
      (p) =>
        p.plantId === plantId && normalizePestName(p.name) === key
    )
    .sort((a, b) => b.discoveredDate.localeCompare(a.discoveredDate));
};
