import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  History,
  Lightbulb,
  Clock,
  Bug,
} from "lucide-react";
import {
  RECURRENCE_RISK_LABELS,
  RECURRENCE_RISK_COLORS,
  PEST_TYPE_LABELS,
  type PestRecurrenceAlert as PestRecurrenceAlertType,
} from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

interface PestRecurrenceAlertProps {
  alert: PestRecurrenceAlertType;
  defaultExpanded?: boolean;
}

export function PestRecurrenceAlert({
  alert,
  defaultExpanded = false,
}: PestRecurrenceAlertProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = RECURRENCE_RISK_COLORS[alert.riskLevel];

  return (
    <div
      className={`card overflow-hidden border-l-4 ${colors.border} ${colors.bg} transition-all duration-300`}
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              alert.riskLevel === "high"
                ? "bg-red-100 text-red-600"
                : alert.riskLevel === "medium"
                ? "bg-orange-100 text-orange-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-forest-900 font-serif">
                {alert.plantAvatar} {alert.plantName}
              </h4>
              <span
                className={`tag ${
                  alert.riskLevel === "high"
                    ? "bg-red-100 text-red-700"
                    : alert.riskLevel === "medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {RECURRENCE_RISK_LABELS[alert.riskLevel]}
              </span>
              <span className="tag bg-forest-50 text-forest-700">
                {alert.pestType === "disease" ? "🦠" : "🐛"}{" "}
                {PEST_TYPE_LABELS[alert.pestType]}
              </span>
            </div>
            <p className={`text-sm mt-1 ${colors.text}`}>
              <span className="font-medium">{alert.pestName}</span> · 历史复发{" "}
              {alert.recurrenceCount} 次
            </p>
            <p className="text-xs text-forest-500 mt-1">
              上次发生：{formatDate(alert.lastOccurrenceDate)}（
              {getRelativeTime(alert.lastOccurrenceDate)}）
            </p>
          </div>
          <button className="p-1 text-forest-400 hover:text-forest-600 transition-colors flex-shrink-0">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-forest-100/50 pt-4">
          {alert.recommendedTreatment && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-emerald-600" />
                <span className="font-medium text-emerald-800 text-sm">
                  推荐处理方案（历史有效）
                </span>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">
                {alert.recommendedTreatment}
              </p>
            </div>
          )}

          {alert.averageResolutionDays > 0 && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <Clock size={14} />
              <span>平均治愈周期：约 {alert.averageResolutionDays} 天</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <History size={16} className="text-forest-500" />
              <span className="text-sm font-medium text-forest-700">
                历史记录
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alert.historyRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="p-2.5 rounded-lg bg-white/70 border border-forest-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-forest-500">
                      {formatDate(record.discoveredDate)}
                    </span>
                    <span className="text-xs tag bg-emerald-50 text-emerald-600">
                      已解决
                    </span>
                  </div>
                  {record.treatmentMethod && (
                    <p className="text-xs text-forest-600 mt-1 line-clamp-2">
                      {record.treatmentMethod}
                    </p>
                  )}
                  {record.treatmentEffect && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      效果：{record.treatmentEffect}
                    </p>
                  )}
                </div>
              ))}
              {alert.historyRecords.length > 5 && (
                <p className="text-xs text-center text-forest-400">
                  还有 {alert.historyRecords.length - 5} 条历史记录
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Link
              to={`/pests?plantId=${alert.plantId}`}
              className="btn-secondary flex-1 text-xs py-2"
            >
              <Bug size={14} />
              查看全部
            </Link>
            <Link
              to="/pests/new"
              className="btn-primary flex-1 text-xs py-2"
            >
              记录处理
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
