import type { Plant, CareLog, LeafRecord, PestRecord, Severity, CarePlan, CareTodo, CareTaskType } from "@/types";
import { getDaysAgo, formatDate, today } from "./format";

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
