import type { Plant, CareLog, LeafRecord, PestRecord, Severity } from "@/types";
import { getDaysAgo } from "./format";

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
