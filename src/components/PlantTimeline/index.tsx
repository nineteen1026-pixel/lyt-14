import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Plus,
  Droplets,
  Leaf,
  Bug,
  Sun,
  Scroll,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  LayoutList,
  Rows,
  TrendingUp,
  Sprout,
} from "lucide-react";
import type {
  CareLog,
  LeafRecord,
  PestRecord,
  TimelineFilterType,
  TimelineGroupedRecord,
  TimelineTimeRange,
} from "@/types";
import {
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  LIGHT_INTENSITY_LABELS,
  LEAF_COLOR_LABELS,
  LEAF_CURL_LABELS,
  SEVERITY_LABELS,
  PEST_TYPE_LABELS,
  PEST_STATUS_LABELS,
  TIMELINE_KIND_LABELS,
  TIMELINE_KIND_COLORS,
  TIMELINE_TIME_RANGE_LABELS,
} from "@/types";
import { formatDate, getRelativeTime, formatDateTime } from "@/utils/format";
import { getSeverityColor } from "@/utils/helpers";
import { useAppStore } from "@/store";

interface PlantTimelineProps {
  plantId: string;
  careLogs: CareLog[];
  leafRecords: LeafRecord[];
  pestRecords: PestRecord[];
  highlightRecordId?: string;
}

const PAGE_SIZE = 10;

export type TimelineLayout = "vertical" | "horizontal";

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function getCareLogDate(log: CareLog): number {
  const dateStr = isValidDate(log.date) ? log.date : log.createdAt;
  const createdAtStr = isValidDate(log.createdAt) ? log.createdAt : new Date(0).toISOString();
  const date = new Date(isValidDate(dateStr) ? dateStr : createdAtStr);
  const createdAt = new Date(isValidDate(createdAtStr) ? createdAtStr : new Date(0).toISOString());
  return Math.max(date.getTime(), createdAt.getTime());
}

function getLeafRecordDate(record: LeafRecord): number {
  const dateStr = isValidDate(record.date) ? record.date : record.createdAt;
  const createdAtStr = isValidDate(record.createdAt) ? record.createdAt : new Date(0).toISOString();
  const date = new Date(isValidDate(dateStr) ? dateStr : createdAtStr);
  const createdAt = new Date(isValidDate(createdAtStr) ? createdAtStr : new Date(0).toISOString());
  return Math.max(date.getTime(), createdAt.getTime());
}

function getPestRecordDate(record: PestRecord): number {
  const dateStr = isValidDate(record.discoveredDate) ? record.discoveredDate : record.createdAt;
  const createdAtStr = isValidDate(record.createdAt) ? record.createdAt : new Date(0).toISOString();
  const date = new Date(isValidDate(dateStr) ? dateStr : createdAtStr);
  const createdAt = new Date(isValidDate(createdAtStr) ? createdAtStr : new Date(0).toISOString());
  return Math.max(date.getTime(), createdAt.getTime());
}

function groupRecords(
  careLogs: CareLog[],
  leafRecords: LeafRecord[],
  pestRecords: PestRecord[]
): TimelineGroupedRecord[] {
  const result: TimelineGroupedRecord[] = [];

  careLogs.forEach((log) => {
    const timestamp = getCareLogDate(log);
    result.push({
      id: `care-${log.id}`,
      kind: "care",
      timestamp,
      sortKey: `${timestamp}-0-${log.id}`,
      record: { kind: "care", data: log },
    });
  });

  leafRecords.forEach((record) => {
    const timestamp = getLeafRecordDate(record);
    result.push({
      id: `leaf-${record.id}`,
      kind: "leaf",
      timestamp,
      sortKey: `${timestamp}-1-${record.id}`,
      record: { kind: "leaf", data: record },
    });
  });

  pestRecords.forEach((record) => {
    const timestamp = getPestRecordDate(record);
    result.push({
      id: `pest-${record.id}`,
      kind: "pest",
      timestamp,
      sortKey: `${timestamp}-2-${record.id}`,
      record: { kind: "pest", data: record },
    });
  });

  return result.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return b.sortKey.localeCompare(a.sortKey);
  });
}

function filterByTimeRange(records: TimelineGroupedRecord[], range: TimelineTimeRange): TimelineGroupedRecord[] {
  if (range === "all") return records;
  const now = Date.now();
  const daysMap: Record<Exclude<TimelineTimeRange, "all">, number> = {
    week: 7,
    month: 30,
    year: 365,
  };
  const days = daysMap[range as Exclude<TimelineTimeRange, "all">];
  const threshold = now - days * 24 * 60 * 60 * 1000;
  return records.filter((r) => r.timestamp >= threshold);
}

function isSameDay(ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDayHeader(ts: number): string {
  const now = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前 · ${formatDate(date)}`;
  return formatDate(date);
}

function getCareSummary(log: CareLog): string {
  switch (log.type) {
    case "watering":
      return `浇水量 ${log.amount ?? "-"}ml`;
    case "fertilizing":
      return log.fertilizerType ? `${log.fertilizerType} ${log.amount ?? ""}g` : "施肥操作";
    case "lighting":
      return `${log.lightDuration ?? "-"}小时 · ${log.lightIntensity ? LIGHT_INTENSITY_LABELS[log.lightIntensity] : ""}`;
  }
}

function getLeafSummary(record: LeafRecord): string {
  const parts = [LEAF_COLOR_LABELS[record.colorStatus]];
  if (record.curlStatus !== "none") parts.push(LEAF_CURL_LABELS[record.curlStatus]);
  if (record.spots.length > 0) parts.push(`共${record.spots.length}处斑点`);
  if (record.newLeaves && record.newLeaves.count > 0) {
    parts.push(`新叶${record.newLeaves.count}片`);
  }
  if (record.leafSize && record.leafSize.growthRate) {
    parts.push(`叶片${record.leafSize.growthRate}`);
  }
  return parts.join(" · ");
}

function getPestSummary(record: PestRecord): string {
  return `${PEST_TYPE_LABELS[record.type]} · ${SEVERITY_LABELS[record.severity]} · ${PEST_STATUS_LABELS[record.status]}`;
}

function getIcon(kind: TimelineGroupedRecord["kind"], record?: TimelineGroupedRecord["record"]) {
  if (kind === "care" && record?.kind === "care") {
    const icon = CARE_TYPE_ICONS[record.data.type];
    return { emoji: icon, lucide: null as unknown as React.ReactNode };
  }
  if (kind === "leaf") {
    return { emoji: "🍃", lucide: null as unknown as React.ReactNode };
  }
  if (kind === "pest" && record?.kind === "pest") {
    return {
      emoji: record.data.type === "disease" ? "🦠" : "🐛",
      lucide: null as unknown as React.ReactNode,
    };
  }
  return { emoji: "📝", lucide: null as unknown as React.ReactNode };
}

export function PlantTimeline({
  plantId,
  careLogs,
  leafRecords,
  pestRecords,
  highlightRecordId,
}: PlantTimelineProps) {
  const [filterType, setFilterType] = useState<TimelineFilterType>("all");
  const [timeRange, setTimeRange] = useState<TimelineTimeRange>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [careSubFilter, setCareSubFilter] = useState<string>("all");
  const [layout, setLayout] = useState<TimelineLayout>("vertical");
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const isHighlightingRef = useRef(false);
  const scrollAttemptsRef = useRef(0);

  const deleteCareLog = useAppStore((s) => s.deleteCareLog);
  const deleteLeafRecord = useAppStore((s) => s.deleteLeafRecord);
  const deletePestRecord = useAppStore((s) => s.deletePestRecord);

  const allGroupedRecords = useMemo(
    () => groupRecords(careLogs, leafRecords, pestRecords),
    [careLogs, leafRecords, pestRecords]
  );

  const filteredRecords = useMemo(() => {
    let result = [...allGroupedRecords];

    result = filterByTimeRange(result, timeRange);

    if (filterType !== "all") {
      result = result.filter((r) => r.kind === filterType);
    }

    if (filterType === "care" && careSubFilter !== "all") {
      result = result.filter(
        (r) => r.kind === "care" && r.record.kind === "care" && r.record.data.type === careSubFilter
      );
    }

    return result;
  }, [allGroupedRecords, filterType, timeRange, careSubFilter]);

  const visibleRecords = useMemo(
    () => filteredRecords.slice(0, visibleCount),
    [filteredRecords, visibleCount]
  );

  const hasMore = visibleCount < filteredRecords.length;

  useEffect(() => {
    if (isHighlightingRef.current) return;
    setVisibleCount(PAGE_SIZE);
  }, [filterType, timeRange, careSubFilter]);

  useEffect(() => {
    if (!highlightRecordId) return;

    const targetId = highlightRecordId;
    const target = allGroupedRecords.find((r) => r.id === targetId);
    if (!target) return;

    isHighlightingRef.current = true;
    scrollAttemptsRef.current = 0;

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    let nextFilterType: TimelineFilterType = "all";
    if (target.kind === "care") nextFilterType = "care";
    else if (target.kind === "leaf") nextFilterType = "leaf";
    else if (target.kind === "pest") nextFilterType = "pest";

    setFilterType(nextFilterType);
    setCareSubFilter("all");
    setTimeRange("all");

    const getFilteredRecords = () => {
      let result = [...allGroupedRecords];
      result = filterByTimeRange(result, "all");
      if (nextFilterType !== "all") {
        result = result.filter((r) => r.kind === nextFilterType);
      }
      return result;
    };

    const tryLocate = () => {
      const filtered = getFilteredRecords();
      const idx = filtered.findIndex((r) => r.id === targetId);

      if (idx >= 0) {
        const targetVisible = Math.max(PAGE_SIZE, idx + 5);
        setVisibleCount((prev) => Math.max(prev, targetVisible));
      }

      const attemptScroll = () => {
        const el = document.getElementById(`timeline-item-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("timeline-highlight");
          setTimeout(() => el.classList.remove("timeline-highlight"), 2500);
          isHighlightingRef.current = false;
          scrollAttemptsRef.current = 0;
          return true;
        }
        if (scrollAttemptsRef.current < 15) {
          scrollAttemptsRef.current += 1;
          setVisibleCount((prev) => prev + PAGE_SIZE);
          setTimeout(attemptScroll, 150);
        } else {
          isHighlightingRef.current = false;
          scrollAttemptsRef.current = 0;
        }
        return false;
      };

      setTimeout(attemptScroll, 100);
    };

    setTimeout(tryLocate, 50);
  }, [highlightRecordId, allGroupedRecords]);

  useEffect(() => {
    if (layout === "horizontal" && horizontalScrollRef.current) {
      setTimeout(() => {
        if (horizontalScrollRef.current) {
          horizontalScrollRef.current.scrollLeft = horizontalScrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [layout, visibleCount]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType("all");
    setTimeRange("all");
    setCareSubFilter("all");
  }, []);

  const hasActiveFilters =
    filterType !== "all" || timeRange !== "all" || careSubFilter !== "all";

  const handleDelete = useCallback(
    (item: TimelineGroupedRecord) => {
      if (!confirm("确定删除这条记录吗？")) return;
      if (item.record.kind === "care") deleteCareLog(item.record.data.id);
      else if (item.record.kind === "leaf") deleteLeafRecord(item.record.data.id);
      else deletePestRecord(item.record.data.id);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    },
    [deleteCareLog, deleteLeafRecord, deletePestRecord]
  );

  const filterButtons: Array<{ type: TimelineFilterType; label: string; icon: React.ReactNode; count: number }> = [
    {
      type: "all",
      label: "全部",
      icon: <Sparkles size={16} />,
      count: allGroupedRecords.length,
    },
    {
      type: "care",
      label: TIMELINE_KIND_LABELS.care,
      icon: <Droplets size={16} />,
      count: allGroupedRecords.filter((r) => r.kind === "care").length,
    },
    {
      type: "leaf",
      label: TIMELINE_KIND_LABELS.leaf,
      icon: <Leaf size={16} />,
      count: allGroupedRecords.filter((r) => r.kind === "leaf").length,
    },
    {
      type: "pest",
      label: TIMELINE_KIND_LABELS.pest,
      icon: <Bug size={16} />,
      count: allGroupedRecords.filter((r) => r.kind === "pest").length,
    },
  ];

  const timeRangeButtons: Array<{ range: TimelineTimeRange; label: string }> = [
    { range: "all", label: TIMELINE_TIME_RANGE_LABELS.all },
    { range: "week", label: TIMELINE_TIME_RANGE_LABELS.week },
    { range: "month", label: TIMELINE_TIME_RANGE_LABELS.month },
    { range: "year", label: TIMELINE_TIME_RANGE_LABELS.year },
  ];

  const renderGroupedWithDays = () => {
    if (visibleRecords.length === 0) return null;
    const groups: Array<{ ts: number; items: TimelineGroupedRecord[] }> = [];
    visibleRecords.forEach((r) => {
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.ts, r.timestamp)) {
        last.items.push(r);
      } else {
        groups.push({ ts: r.timestamp, items: [r] });
      }
    });
    return groups.map((group) => (
      <div key={group.ts} className="mb-6 last:mb-0">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Calendar size={14} className="text-forest-400 shrink-0" />
          <span className="text-xs font-semibold text-forest-600 tracking-wide">
            {formatDayHeader(group.ts)}
          </span>
          <div className="flex-1 h-px bg-forest-100" />
          <span className="text-[10px] text-forest-400">
            {group.items.length} 条记录
          </span>
        </div>
        {group.items.map((item, idx) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLastInDay={idx === group.items.length - 1}
            isExpanded={expandedIds.has(item.id)}
            onToggle={() => toggleExpand(item.id)}
            onDelete={() => handleDelete(item)}
            plantId={plantId}
          />
        ))}
      </div>
    ));
  };

  const scrollHorizontal = (direction: "left" | "right") => {
    if (!horizontalScrollRef.current) return;
    const scrollAmount = 320;
    horizontalScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const renderHorizontalTimeline = () => {
    if (filteredRecords.length === 0) return null;
    const records = filteredRecords
      .slice(0, Math.min(visibleCount, filteredRecords.length))
      .reverse();

    return (
      <div className="relative">
        <div className="absolute top-[52px] left-0 right-0 h-[2px] bg-gradient-to-r from-forest-200 via-forest-150 to-forest-100 rounded-full z-0" />

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => scrollHorizontal("left")}
            className="btn-ghost !p-2 !rounded-full"
            title="向左滚动"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-forest-500 font-medium">
            从早到晚 · 共 {filteredRecords.length} 条记录
          </span>
          <button
            onClick={() => scrollHorizontal("right")}
            className="btn-ghost !p-2 !rounded-full"
            title="向右滚动"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          ref={horizontalScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-forest-200 scrollbar-track-forest-50"
          style={{ scrollbarWidth: "thin" } as React.CSSProperties}
        >
          {records.map((item, idx) => (
            <HorizontalTimelineCard
              key={item.id}
              item={item}
              isFirst={idx === 0}
              isLast={idx === records.length - 1}
              isExpanded={expandedIds.has(item.id)}
              onToggle={() => toggleExpand(item.id)}
              onDelete={() => handleDelete(item)}
              plantId={plantId}
            />
          ))}
          {hasMore && (
            <div className="shrink-0 flex items-center justify-center min-w-[200px]">
              <button
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + PAGE_SIZE, filteredRecords.length)
                  )
                }
                className="btn-secondary !px-4 !py-2 flex-col gap-1 h-auto"
              >
                <Plus size={18} />
                <span className="text-xs">
                  加载更多</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVerticalTimeline = () => {
    if (filteredRecords.length === 0) return null;
    return (
      <div className="relative">
        <div className="hidden md:block absolute left-[30px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-forest-200 via-forest-150 to-forest-100 rounded-full" />
        <div className="block md:hidden absolute left-[22px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-forest-200 via-forest-150 to-forest-100 rounded-full" />

        {renderGroupedWithDays()}

        {hasMore && (
          <div className="flex justify-center py-4">
            <button
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.min(prev + PAGE_SIZE, filteredRecords.length)
                )
              }
              className="btn-secondary !px-6 !py-2"
            >
              <ChevronDown size={16} />
              加载更多 ({filteredRecords.length - visibleCount} 条剩余)
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-100 to-cream-100 flex items-center justify-center">
            <Scroll size={18} className="text-forest-600" />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 font-serif text-lg">成长时间轴</h3>
            <p className="text-xs text-forest-400 mt-0.5">
              共 {allGroupedRecords.length} 条记录 · 筛选后 {filteredRecords.length} 条
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-forest-50 rounded-xl">
            <button
              onClick={() => setLayout("vertical")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                layout === "vertical"
                  ? "bg-white text-forest-700 shadow-sm"
                  : "text-forest-500 hover:text-forest-700"
              }`}
              title="纵向时间轴"
            >
              <Rows size={14} />
              <span className="hidden sm:inline">纵向</span>
            </button>
            <button
              onClick={() => setLayout("horizontal")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                layout === "horizontal"
                  ? "bg-white text-forest-700 shadow-sm"
                  : "text-forest-500 hover:text-forest-700"
              }`}
              title="横向时间轴"
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">横向</span>
            </button>
          </div>
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            className={`btn-ghost !px-3 !py-2 transition-all ${
              showAdvanced ? "bg-forest-100 text-forest-700" : ""
            }`}
            title="高级筛选"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">高级筛选</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost !px-3 !py-2 text-amber-600 hover:bg-amber-50"
              title="清除筛选"
            >
              <X size={16} />
              <span className="hidden sm:inline">清除筛选</span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-[fadeIn_0.2s_ease]">
          <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <AlertTriangle size={12} /> 当前筛选条件：
          </span>
          {filterType !== "all" && (
            <span className="tag bg-white border border-amber-200 text-amber-700">
              {TIMELINE_KIND_LABELS[filterType]}
              <X
                size={10}
                className="cursor-pointer ml-1"
                onClick={() => setFilterType("all")}
              />
            </span>
          )}
          {timeRange !== "all" && (
            <span className="tag bg-white border border-amber-200 text-amber-700">
              {TIMELINE_TIME_RANGE_LABELS[timeRange]}
              <X
                size={10}
                className="cursor-pointer ml-1"
                onClick={() => setTimeRange("all")}
              />
            </span>
          )}
          {careSubFilter !== "all" && (
            <span className="tag bg-white border border-amber-200 text-amber-700">
              {CARE_TYPE_LABELS[careSubFilter as CareLog["type"]]}
              <X
                size={10}
                className="cursor-pointer ml-1"
                onClick={() => setCareSubFilter("all")}
              />
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-1.5 p-1.5 bg-forest-50 rounded-xl overflow-x-auto sm:overflow-x-visible">
          {filterButtons.map((btn) => {
            const active = filterType === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => setFilterType(btn.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-white text-forest-700 shadow-sm border border-forest-100"
                    : "text-forest-500 hover:text-forest-700 hover:bg-white/60"
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    active
                      ? "bg-forest-100 text-forest-700"
                      : "bg-forest-100/60 text-forest-500"
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-cream-50 rounded-xl">
          <Clock size={14} className="text-forest-400 ml-2 shrink-0" />
          {timeRangeButtons.map((btn) => {
            const active = timeRange === btn.range;
            return (
              <button
                key={btn.range}
                onClick={() => setTimeRange(btn.range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-white text-forest-700 shadow-sm border border-cream-200"
                    : "text-forest-500 hover:text-forest-700 hover:bg-white/60"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {showAdvanced && (
        <div className="mb-5 p-4 bg-gradient-to-br from-cream-50 to-forest-50/40 rounded-xl border border-forest-100 animate-[slideDown_0.25s_ease]">
          <div className="text-xs font-semibold text-forest-700 mb-3 flex items-center gap-2">
            <Filter size={13} /> 高级筛选选项
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="label !text-xs !mb-1">养护类型细分</label>
              <select
                value={careSubFilter}
                onChange={(e) => setCareSubFilter(e.target.value)}
                disabled={filterType !== "care" && filterType !== "all"}
                className="select-field !py-2 !text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">全部养护类型</option>
                <option value="watering">💧 {CARE_TYPE_LABELS.watering}</option>
                <option value="fertilizing">🌾 {CARE_TYPE_LABELS.fertilizing}</option>
                <option value="lighting">☀️ {CARE_TYPE_LABELS.lighting}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center justify-between p-3 bg-gradient-to-r from-forest-50/60 to-sky-50/40 rounded-xl border border-forest-100/60">
        <p className="text-xs text-forest-600 flex items-center gap-1.5">
          <Sparkles size={13} className="text-forest-500" />
          从时间轴直接添加新记录，让成长故事更完整
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={{ pathname: "/care-logs/new", search: `?plantId=${plantId}` }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium hover:bg-sky-200 transition-colors"
          >
            <Plus size={12} />
            添加养护
          </Link>
          <Link
            to={{ pathname: "/leaves/new", search: `?plantId=${plantId}` }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-200 transition-colors"
          >
            <Plus size={12} />
            添加叶片
          </Link>
          <Link
            to={{ pathname: "/pests/new", search: `?plantId=${plantId}` }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors"
          >
            <Plus size={12} />
            添加病虫害
          </Link>
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="transition-all duration-300">
          {layout === "vertical" ? (
            <div key="vertical" className="animate-[fadeIn_0.3s_ease]">
              {renderVerticalTimeline()}
            </div>
          ) : (
            <div key="horizontal" className="animate-[fadeIn_0.3s_ease]">
              {renderHorizontalTimeline()}
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-forest-50 flex items-center justify-center text-4xl">
            🌱
          </div>
          <p className="text-forest-600 font-medium mb-1">
            {hasActiveFilters ? "没有符合条件的记录" : "还没有任何成长记录"}
          </p>
          <p className="text-sm text-forest-400 mb-4">
            {hasActiveFilters ? "尝试调整筛选条件看看" : "开始记录植物的成长历程吧～"}
          </p>
          {!hasActiveFilters && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link
                to={{ pathname: "/care-logs/new", search: `?plantId=${plantId}` }}
                className="btn-primary"
              >
                <Plus size={16} />
                记录第一次养护
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TimelineItemProps {
  item: TimelineGroupedRecord;
  isLastInDay: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  plantId: string;
  isHighlighted?: boolean;
}

function TimelineItem({
  item,
  isLastInDay,
  isExpanded,
  onToggle,
  onDelete,
  plantId,
  isHighlighted,
}: TimelineItemProps) {
  const colors = TIMELINE_KIND_COLORS[item.kind];
  const { emoji } = getIcon(item.kind, item.record);

  const renderContent = () => {
    if (item.record.kind === "care") {
      return <CareRecordContent log={item.record.data} expanded={isExpanded} plantId={plantId} />;
    }
    if (item.record.kind === "leaf") {
      return <LeafRecordContent record={item.record.data} expanded={isExpanded} plantId={plantId} />;
    }
    return <PestRecordContent record={item.record.data} expanded={isExpanded} plantId={plantId} />;
  };

  return (
    <div
      id={`timeline-item-${item.id}`}
      className={`relative pl-10 md:pl-16 ${isLastInDay ? "" : "pb-4"} group/item`}
    >
      <div
        className={`absolute left-0 md:left-[14px] top-1.5 w-10 h-10 md:w-9 md:h-9 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center text-base shadow-sm z-10 transition-transform group-hover/item:scale-110`}
      >
        <span className="drop-shadow-sm">{emoji}</span>
      </div>

      <div
        onClick={onToggle}
        className={`ml-2 md:ml-0 rounded-2xl border-2 ${colors.bg} ${colors.border} p-4 cursor-pointer transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`tag bg-white ${colors.text} border ${colors.border} font-semibold`}>
                {TIMELINE_KIND_LABELS[item.kind]}
              </span>
              <span className="text-xs text-forest-400 flex items-center gap-1">
                <Clock size={11} />
                {formatDateTime(new Date(item.timestamp))}
              </span>
              <span className="text-xs text-forest-500/80 font-medium">
                {getRelativeTime(new Date(item.timestamp))}
              </span>
            </div>
            <div className="mt-2">{renderContent()}</div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg text-forest-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/item:opacity-100"
              title="删除记录"
            >
              <Trash2 size={13} />
            </button>
            <div
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isExpanded
                  ? `${colors.bg} ${colors.text} rotate-180`
                  : "bg-white/60 text-forest-400"
              }`}
            >
              <ChevronDown size={15} />
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-4 border-t border-dashed border-current/10">
            {renderExpanded(item)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CareRecordContent({
  log,
  expanded,
  plantId,
}: {
  log: CareLog;
  expanded: boolean;
  plantId: string;
}) {
  const getEditLink = () => `/care-logs/${log.id}/edit?plantId=${plantId}`;
  void expanded;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {log.type === "watering" && <Droplets size={14} className="text-sky-500" />}
        {log.type === "fertilizing" && <Sparkles size={14} className="text-amber-600" />}
        {log.type === "lighting" && <Sun size={14} className="text-orange-500" />}
        <span className="font-semibold text-forest-800">
          {CARE_TYPE_LABELS[log.type]}
        </span>
        <span className="text-xs text-forest-400 ml-auto flex items-center gap-1">
          <Link
            to={getEditLink()}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:text-forest-600"
          >
            <Edit2 size={10} />
            编辑
          </Link>
        </span>
      </div>
      <p className="text-sm text-forest-700 font-medium">{getCareSummary(log)}</p>
      {!expanded && log.notes && (
        <p className="text-xs text-forest-500 mt-1.5 line-clamp-2">📝 {log.notes}</p>
      )}
    </div>
  );
}

function LeafRecordContent({
  record,
  expanded,
  plantId,
}: {
  record: LeafRecord;
  expanded: boolean;
  plantId: string;
}) {
  void expanded;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Leaf size={14} className="text-emerald-500" />
        <span className="font-semibold text-forest-800">叶片观察记录</span>
        <span className="text-xs text-forest-400 ml-auto flex items-center gap-1">
          <Link
            to={`/leaves/${record.id}/edit?plantId=${plantId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:text-forest-600"
          >
            <Edit2 size={10} />
            编辑
          </Link>
        </span>
      </div>
      <p className="text-sm text-forest-700 font-medium">{getLeafSummary(record)}</p>
      {!expanded && record.newLeaves && record.newLeaves.count > 0 && (
        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
          <Sprout size={11} />
          新叶 {record.newLeaves.count} 片
          {record.newLeaves.size ? ` · ${record.newLeaves.size}` : ""}
        </p>
      )}
      {!expanded && record.leafSize && record.leafSize.growthRate && (
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <TrendingUp size={11} />
          叶片尺寸变化 {record.leafSize.growthRate}
        </p>
      )}
      {!expanded && record.notes && (
        <p className="text-xs text-forest-500 mt-1.5 line-clamp-2">📝 {record.notes}</p>
      )}
      {!expanded && record.images.length > 0 && (
        <p className="text-xs text-emerald-600 mt-1.5">📷 包含 {record.images.length} 张图片</p>
      )}
    </div>
  );
}

function PestRecordContent({
  record,
  expanded,
  plantId,
}: {
  record: PestRecord;
  expanded: boolean;
  plantId: string;
}) {
  void expanded;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {record.type === "disease" ? (
          <AlertTriangle size={14} className="text-amber-500" />
        ) : (
          <Bug size={14} className="text-orange-500" />
        )}
        <span className="font-semibold text-forest-800">{record.name}</span>
        <span className={`tag ${getSeverityColor(record.severity)} text-white !text-[10px]`}>
          {SEVERITY_LABELS[record.severity]}
        </span>
        <span
          className={`tag !text-[10px] ${
            record.status === "resolved"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {record.status === "resolved" ? (
            <CheckCircle2 size={10} />
          ) : (
            <Clock size={10} />
          )}
          {PEST_STATUS_LABELS[record.status]}
        </span>
        <span className="text-xs text-forest-400 ml-auto flex items-center gap-1">
          <Link
            to={`/pests/${record.id}/edit?plantId=${plantId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:text-forest-600"
          >
            <Edit2 size={10} />
            编辑
          </Link>
        </span>
      </div>
      <p className="text-sm text-forest-700 font-medium">{getPestSummary(record)}</p>
      {!expanded && record.symptoms && (
        <p className="text-xs text-forest-500 mt-1.5 line-clamp-2">🔍 症状：{record.symptoms}</p>
      )}
      {!expanded && record.images.length > 0 && (
        <p className="text-xs text-amber-600 mt-1.5">📷 包含 {record.images.length} 张图片</p>
      )}
    </div>
  );
}

function renderExpanded(item: TimelineGroupedRecord) {
  if (item.record.kind === "care") {
    const log = item.record.data;
    return (
      <div className="space-y-3 animate-[fadeIn_0.2s_ease]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="记录日期" value={formatDate(log.date)} icon={<Calendar size={12} />} />
          <InfoRow
            label="操作类型"
            value={`${CARE_TYPE_ICONS[log.type]} ${CARE_TYPE_LABELS[log.type]}`}
          />
          {log.type === "watering" && (
            <InfoRow
              label="浇水量"
              value={log.amount ? `${log.amount} ml` : "未记录"}
              icon={<Droplets size={12} />}
            />
          )}
          {log.type === "fertilizing" && (
            <>
              <InfoRow
                label="肥料种类"
                value={log.fertilizerType ?? "未记录"}
                icon={<Sparkles size={12} />}
              />
              <InfoRow label="施肥量" value={log.amount ? `${log.amount} g` : "未记录"} />
            </>
          )}
          {log.type === "lighting" && (
            <>
              <InfoRow
                label="光照时长"
                value={log.lightDuration ? `${log.lightDuration} 小时` : "未记录"}
                icon={<Sun size={12} />}
              />
              <InfoRow
                label="光照强度"
                value={log.lightIntensity ? LIGHT_INTENSITY_LABELS[log.lightIntensity] : "未记录"}
              />
            </>
          )}
        </div>
        {log.notes && (
          <div className="p-3 bg-white rounded-xl border border-sky-100">
            <p className="text-xs text-sky-600 font-medium mb-1 flex items-center gap-1">
              📝 备注
            </p>
            <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
              {log.notes}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (item.record.kind === "leaf") {
    const record = item.record.data;
    return (
      <div className="space-y-3 animate-[fadeIn_0.2s_ease]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <InfoRow label="观察日期" value={formatDate(record.date)} icon={<Calendar size={12} />} />
          <InfoRow label="叶片颜色" value={LEAF_COLOR_LABELS[record.colorStatus]} icon={<Leaf size={12} />} />
          <InfoRow label="卷曲状态" value={LEAF_CURL_LABELS[record.curlStatus]} />
          {record.newLeaves && record.newLeaves.count > 0 && (
            <InfoRow
              label="新叶数量"
              value={`${record.newLeaves.count} 片${record.newLeaves.size ? ` · ${record.newLeaves.size}` : ""}`}
              icon={<Sprout size={12} />}
            />
          )}
          {record.leafSize && record.leafSize.currentLength != null && (
            <InfoRow
              label="叶片尺寸"
              value={`${record.leafSize.currentLength} × ${record.leafSize.currentWidth ?? "-"} ${record.leafSize.unit ?? "cm"}`}
              icon={<TrendingUp size={12} />}
            />
          )}
          {record.leafSize && record.leafSize.growthRate && (
            <InfoRow
              label="生长速率"
              value={record.leafSize.growthRate}
              icon={<Sparkles size={12} />}
            />
          )}
        </div>
        {record.newLeaves && record.newLeaves.description && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-1 flex items-center gap-1">
              <Sprout size={12} /> 新叶描述
            </p>
            <p className="text-sm text-forest-700 leading-relaxed">
              {record.newLeaves.description}
            </p>
          </div>
        )}
        {record.leafSize && (record.leafSize.previousLength != null || record.leafSize.description) && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-2 flex items-center gap-1">
              <TrendingUp size={12} /> 尺寸变化对比
            </p>
            {record.leafSize.previousLength != null && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                <div className="p-2 bg-forest-50 rounded-lg">
                  <p className="text-forest-400 text-[10px] mb-0.5">之前</p>
                  <p className="font-semibold text-forest-700">
                    {record.leafSize.previousLength} × {record.leafSize.previousWidth ?? "-"} {record.leafSize.unit ?? "cm"}
                  </p>
                </div>
                <div className="flex items-center justify-center text-forest-300">
                  <ChevronRight size={16} />
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-500 text-[10px] mb-0.5">现在</p>
                  <p className="font-semibold text-emerald-700">
                    {record.leafSize.currentLength} × {record.leafSize.currentWidth ?? "-"} {record.leafSize.unit ?? "cm"}
                  </p>
                </div>
              </div>
            )}
            {record.leafSize.description && (
              <p className="text-sm text-forest-700 leading-relaxed">
                {record.leafSize.description}
              </p>
            )}
          </div>
        )}
        {record.spots.length > 0 && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-2">🔬 斑点详情 ({record.spots.length}处)</p>
            <div className="space-y-2">
              {record.spots.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-emerald-50/60 rounded-lg text-xs text-forest-700"
                >
                  <span className="font-semibold text-emerald-700">#{idx + 1}</span>
                  <span className="mx-1 text-forest-300">|</span>
                  <span>{spot.type}</span>
                  <span className="mx-1 text-forest-300">·</span>
                  <span>{spot.color}</span>
                  <span className="mx-1 text-forest-300">·</span>
                  <span>{spot.size}</span>
                  {spot.description && (
                    <>
                      <br />
                      <span className="text-forest-500 mt-1 block">描述：{spot.description}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {record.images.length > 0 && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-2">📷 观察图片 ({record.images.length}张)</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {record.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg bg-emerald-50 overflow-hidden border border-emerald-100"
                >
                  <img
                    src={img}
                    alt={`叶片图片${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {record.notes && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-1">📝 观察备注</p>
            <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    );
  }

  const record = item.record.data;
  return (
    <div className="space-y-3 animate-[fadeIn_0.2s_ease]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <InfoRow
          label="发现日期"
          value={formatDate(record.discoveredDate)}
          icon={<Calendar size={12} />}
        />
        <InfoRow
          label="问题类型"
          value={`${PEST_TYPE_LABELS[record.type]} · ${SEVERITY_LABELS[record.severity]}`}
          icon={
            record.type === "disease" ? (
              <AlertTriangle size={12} />
            ) : (
              <Bug size={12} />
            )
          }
        />
        <InfoRow
          label="当前状态"
          value={
            record.status === "resolved" ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={12} />
                {PEST_STATUS_LABELS[record.status]}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-orange-600">
                <Clock size={12} />
                {PEST_STATUS_LABELS[record.status]}
              </span>
            )
          }
        />
        {record.treatmentDate && (
          <InfoRow label="处理日期" value={formatDate(record.treatmentDate)} />
        )}
        {record.resolvedDate && (
          <InfoRow
            label="解决日期"
            value={formatDate(record.resolvedDate)}
            icon={<CheckCircle2 size={12} />}
          />
        )}
      </div>

      <div className="p-3 bg-white rounded-xl border border-amber-100">
        <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
          🔍 症状描述
        </p>
        <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
          {record.symptoms || "无"}
        </p>
      </div>

      {record.treatmentMethod && (
        <div className="p-3 bg-white rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
            💊 处理措施
          </p>
          <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
            {record.treatmentMethod}
          </p>
        </div>
      )}

      {record.treatmentEffect && (
        <div className="p-3 bg-white rounded-xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium mb-1 flex items-center gap-1">
            ✅ 治疗效果
          </p>
          <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
            {record.treatmentEffect}
          </p>
        </div>
      )}

      {record.images.length > 0 && (
        <div className="p-3 bg-white rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-2">📷 相关图片 ({record.images.length}张)</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {record.images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg bg-amber-50 overflow-hidden border border-amber-100"
              >
                <img
                  src={img}
                  alt={`病虫害图片${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {record.followUpNotes && (
        <div className="p-3 bg-white rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1">📌 后续备注</p>
          <p className="text-sm text-forest-700 whitespace-pre-wrap leading-relaxed">
            {record.followUpNotes}
          </p>
        </div>
      )}
    </div>
  );
}

interface HorizontalTimelineCardProps {
  item: TimelineGroupedRecord;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  plantId: string;
}

function HorizontalTimelineCard({
  item,
  isFirst,
  isLast,
  isExpanded,
  onToggle,
  onDelete,
  plantId,
}: HorizontalTimelineCardProps) {
  const colors = TIMELINE_KIND_COLORS[item.kind];
  const { emoji } = getIcon(item.kind, item.record);

  const renderCompactContent = () => {
    if (item.record.kind === "care") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-forest-600">
            {item.record.data.type === "watering" && <Droplets size={12} className="text-sky-500" />}
            {item.record.data.type === "fertilizing" && <Sparkles size={12} className="text-amber-500" />}
            {item.record.data.type === "lighting" && <Sun size={12} className="text-orange-500" />}
            <span className="font-medium">{CARE_TYPE_LABELS[item.record.data.type]}</span>
          </div>
          <p className="text-sm font-semibold text-forest-800 line-clamp-2">
            {getCareSummary(item.record.data)}
          </p>
        </div>
      );
    }
    if (item.record.kind === "leaf") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-forest-600">
            <Leaf size={12} className="text-emerald-500" />
            <span className="font-medium">叶片观察</span>
          </div>
          <p className="text-sm font-semibold text-forest-800 line-clamp-2">
            {getLeafSummary(item.record.data)}
          </p>
          {item.record.data.newLeaves && item.record.data.newLeaves.count > 0 && (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1">
              <Sprout size={10} /> 新叶 {item.record.data.newLeaves.count} 片
            </p>
          )}
          {item.record.data.leafSize && item.record.data.leafSize.growthRate && (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1">
              <TrendingUp size={10} /> {item.record.data.leafSize.growthRate}
            </p>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-forest-600">
          {item.record.data.type === "disease" ? (
            <AlertTriangle size={12} className="text-amber-500" />
          ) : (
            <Bug size={12} className="text-orange-500" />
          )}
          <span className="font-medium">{item.record.data.name}</span>
        </div>
        <p className="text-sm font-semibold text-forest-800 line-clamp-2">
          {getPestSummary(item.record.data)}
        </p>
        <p className="text-[11px] text-forest-500 line-clamp-2">
          {item.record.data.symptoms}
        </p>
      </div>
    );
  };

  return (
    <div
      id={`timeline-item-${item.id}`}
      className="shrink-0 w-[240px] sm:w-[260px] relative group/card"
    >
      <div className="absolute top-12 left-0 right-0 h-[2px] bg-forest-100 -z-0" />
      {isFirst && (
        <div className="absolute top-12 right-1/2 left-0 h-[2px] bg-gradient-to-r from-transparent to-forest-100 -z-0" />
      )}
      {isLast && (
        <div className="absolute top-12 right-0 left-1/2 h-[2px] bg-gradient-to-l from-transparent to-forest-100 -z-0" />
      )}

      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-forest-500 mb-2 h-4">
          {formatDate(new Date(item.timestamp))}
        </div>

        <div
          className={`w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-3 flex items-center justify-center text-xl shadow-md z-10 transition-transform group-hover/card:scale-110`}
        >
          <span className="drop-shadow">{emoji}</span>
        </div>

        <div
          onClick={onToggle}
          className={`mt-3 w-full rounded-2xl border-2 ${colors.bg} ${colors.border} p-3 cursor-pointer transition-all duration-200 hover:shadow-soft hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`tag bg-white ${colors.text} border ${colors.border} !text-[10px] font-semibold`}>
              {TIMELINE_KIND_LABELS[item.kind]}
            </span>
            <span className="text-[10px] text-forest-400 flex items-center gap-0.5">
              <Clock size={9} />
              {formatDateTime(new Date(item.timestamp)).split(" ")[1] || ""}
            </span>
          </div>

          {renderCompactContent()}

          <div className="mt-3 pt-2 border-t border-dashed border-current/10">
            <div className="flex items-center justify-between">
              <Link
                to={
                  item.record.kind === "care"
                    ? `/care-logs/${item.record.data.id}/edit?plantId=${plantId}`
                    : item.record.kind === "leaf"
                    ? `/leaves/${item.record.data.id}/edit?plantId=${plantId}`
                    : `/pests/${item.record.data.id}/edit?plantId=${plantId}`
                }
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-forest-500 hover:text-forest-700 flex items-center gap-0.5"
              >
                <Edit2 size={9} /> 编辑
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-[10px] text-forest-300 hover:text-red-500 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
              >
                <Trash2 size={9} /> 删除
              </button>
              <span className="text-[10px] text-forest-400 flex items-center gap-0.5">
                详情
                <ChevronDown size={10} className={isExpanded ? "rotate-180" : ""} />
              </span>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              isExpanded ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-3 border-t border-dashed border-current/10">
              {renderExpanded(item)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-2.5 bg-white/70 rounded-lg border border-forest-100/60">
      <p className="text-[10px] text-forest-400 font-medium mb-0.5 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-forest-800 font-medium flex items-center gap-1.5">
        {icon && <span className="text-forest-500">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
