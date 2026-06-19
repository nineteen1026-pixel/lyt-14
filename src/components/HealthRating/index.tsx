import { Star } from "lucide-react";
import type { PlantHealthScore } from "@/types";
import { HEALTH_LEVEL_LABELS, HEALTH_LEVEL_COLORS } from "@/types";

interface HealthRatingProps {
  score: PlantHealthScore;
  showLabel?: boolean;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function HealthRating({
  score,
  showLabel = true,
  showScore = false,
  size = "md",
}: HealthRatingProps) {
  const starSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const starSize = starSizes[size];
  const colorClass = HEALTH_LEVEL_COLORS[score.level];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={starSize}
            className={`${
              i < score.stars
                ? `${colorClass} fill-current`
                : "text-forest-200"
            } transition-colors`}
          />
        ))}
      </div>
      {showScore && (
        <span className={`text-sm font-semibold ${colorClass}`}>
          {score.total}分
        </span>
      )}
      {showLabel && (
        <span className={`text-xs font-medium ${colorClass}`}>
          {HEALTH_LEVEL_LABELS[score.level]}
        </span>
      )}
    </div>
  );
}
