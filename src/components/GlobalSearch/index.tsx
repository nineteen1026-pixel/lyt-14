import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Command, ArrowRight, Hash, Calendar } from "lucide-react";
import { useAppStore } from "@/store";
import {
  SEARCH_CATEGORY_LABELS,
  SEARCH_CATEGORY_EMOJIS,
  SEARCH_CATEGORY_COLORS,
  type SearchCategory,
  type SearchResults,
} from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

const CATEGORY_ORDER: SearchCategory[] = ["plant", "careLog", "leaf", "pest"];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const searchGlobal = useAppStore((s) => s.searchGlobal);

  const results: SearchResults = useMemo(
    () => searchGlobal(keyword),
    [keyword, searchGlobal]
  );

  const categoryCounts = useMemo(
    () => ({
      all: results.total,
      plant: results.plant.length,
      careLog: results.careLog.length,
      leaf: results.leaf.length,
      pest: results.pest.length,
    }),
    [results]
  );

  const displayResults = useMemo(() => {
    if (activeCategory === "all") {
      return [...results.plant, ...results.careLog, ...results.leaf, ...results.pest];
    }
    return results[activeCategory];
  }, [activeCategory, results]);

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setKeyword("");
    setActiveCategory("all");
  }, []);

  const handleNavigate = useCallback(
    (to: string) => {
      close();
      navigate(to);
    },
    [close, navigate]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, open, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-forest-100 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm min-w-[240px]"
      >
        <Search size={16} className="text-forest-300" />
        <span className="flex-1 text-left text-forest-300">搜索植物、日志、叶片、病虫害...</span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-forest-300 text-[10px] font-mono">
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in origin-top"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-cream-200">
              <Search size={20} className="text-forest-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入关键词搜索（名称、症状、备注、肥料类型等）"
                className="flex-1 outline-none text-base bg-transparent text-forest-900 placeholder:text-forest-400"
                autoComplete="off"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="p-1.5 rounded-lg hover:bg-cream-100 text-forest-400 hover:text-forest-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-cream-100 text-forest-500 text-[10px] font-mono">
                ESC
              </div>
            </div>

            {keyword.trim() && (
              <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-cream-100 bg-cream-50/50">
                <CategoryTab
                  label="全部"
                  emoji="🔍"
                  count={categoryCounts.all}
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                  color={{ bg: "bg-forest-50", text: "text-forest-700", border: "border-forest-200" }}
                />
                {CATEGORY_ORDER.map((cat) => (
                  <CategoryTab
                    key={cat}
                    label={SEARCH_CATEGORY_LABELS[cat]}
                    emoji={SEARCH_CATEGORY_EMOJIS[cat]}
                    count={categoryCounts[cat]}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                    color={SEARCH_CATEGORY_COLORS[cat]}
                  />
                ))}
              </div>
            )}

            <div className="max-h-[55vh] overflow-y-auto">
              {!keyword.trim() ? (
                <EmptySearchTip />
              ) : results.total === 0 ? (
                <NoResults keyword={keyword} />
              ) : displayResults.length === 0 ? (
                <EmptyCategory keyword={keyword} category={activeCategory} />
              ) : (
                <div className="divide-y divide-cream-100">
                  {activeCategory === "all"
                    ? CATEGORY_ORDER.map((cat) =>
                        results[cat].length > 0 ? (
                          <ResultGroup
                            key={cat}
                            category={cat}
                            items={results[cat]}
                            onNavigate={handleNavigate}
                          />
                        ) : null
                      )
                    : displayResults.map((item, i) => (
                        <ResultRow
                          key={item.id}
                          item={item}
                          index={i}
                          onNavigate={handleNavigate}
                        />
                      ))}
                </div>
              )}
            </div>

            {results.total > 0 && (
              <div className="px-5 py-3 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between text-xs text-forest-500">
                <span>
                  {activeCategory === "all"
                    ? `共找到 ${results.total} 条相关结果`
                    : `「${SEARCH_CATEGORY_LABELS[activeCategory]}」找到 ${categoryCounts[activeCategory]} 条`}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowRight size={12} />
                  点击结果跳转详情页
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface CategoryTabProps {
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: { bg: string; text: string; border: string };
}

function CategoryTab({ label, emoji, count, active, onClick, color }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
        active
          ? `${color.bg} ${color.text} ${color.border} shadow-sm`
          : "bg-white text-forest-500 border-cream-200 hover:border-forest-300 hover:text-forest-700"
      }`}
    >
      <span className="text-xs">{emoji}</span>
      <span>{label}</span>
      <span
        className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
          active ? "bg-white/70" : "bg-cream-100 text-forest-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

interface ResultGroupProps {
  category: SearchCategory;
  items: any[];
  onNavigate: (to: string) => void;
}

function ResultGroup({ category, items, onNavigate }: ResultGroupProps) {
  const color = SEARCH_CATEGORY_COLORS[category];
  return (
    <div className="py-2">
      <div className="px-5 py-1.5 flex items-center gap-2 text-xs font-semibold text-forest-500">
        <span>{SEARCH_CATEGORY_EMOJIS[category]}</span>
        <span>{SEARCH_CATEGORY_LABELS[category]}</span>
        <span className={`px-1.5 py-0.5 rounded-full ${color.bg} ${color.text} text-[10px]`}>
          {items.length}
        </span>
      </div>
      <div>
        {items.map((item, i) => (
          <ResultRow key={item.id} item={item} index={i} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

interface ResultRowProps {
  item: any;
  index: number;
  onNavigate: (to: string) => void;
}

function ResultRow({ item, index, onNavigate }: ResultRowProps) {
  const color = SEARCH_CATEGORY_COLORS[item.category as SearchCategory];
  return (
    <button
      onClick={() => onNavigate(item.navigateTo)}
      className={`w-full text-left px-5 py-3.5 hover:${color.bg} transition-colors duration-150 flex items-start gap-3 group animate-fade-in-up opacity-0 stagger-${
        Math.min((index % 6) + 1, 6)
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color.bg} border ${color.border}`}
        >
          {item.category === "plant" ? item.plantAvatar : SEARCH_CATEGORY_EMOJIS[item.category]}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-forest-900 truncate">{item.title}</h4>
          {item.category !== "plant" && (
            <span className="text-xs text-forest-400 flex items-center gap-1">
              <span>{item.plantAvatar}</span>
              {item.plantName}
            </span>
          )}
          <span className={`tag ${color.bg} ${color.text} text-[10px]`}>
            {SEARCH_CATEGORY_LABELS[item.category as SearchCategory]}
          </span>
        </div>
        {item.summary && (
          <p className="text-sm text-forest-600 mt-1 line-clamp-2">{item.summary}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px]">
          {item.matchedFields?.length > 0 && (
            <span className="flex items-center gap-1 text-forest-500">
              <Hash size={10} />
              匹配字段: {item.matchedFields.slice(0, 3).join("、")}
              {item.matchedFields.length > 3 && ` 等${item.matchedFields.length}项`}
            </span>
          )}
          {item.date && (
            <span className="flex items-center gap-1 text-forest-400">
              <Calendar size={10} />
              {formatDate(item.date)} · {getRelativeTime(item.date)}
            </span>
          )}
        </div>
      </div>
      <ArrowRight
        size={16}
        className="flex-shrink-0 mt-2 text-forest-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
      />
    </button>
  );
}

function EmptySearchTip() {
  const tips = [
    { emoji: "🪴", text: "搜索植物名称，如「绿萝」「多肉」" },
    { emoji: "💧", text: "搜索养护内容，如「浇水」「复合肥」" },
    { emoji: "🍃", text: "搜索叶片状态，如「发黄」「斑点」" },
    { emoji: "🐛", text: "搜索病虫害名，如「黑斑病」「蚜虫」" },
  ];
  return (
    <div className="px-5 py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🔍</div>
        <h3 className="font-bold text-forest-800 font-serif mb-1">开始全局搜索</h3>
        <p className="text-sm text-forest-500">
          支持按关键词检索植物、养护日志、叶片记录和病虫害信息
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200 animate-fade-in-up opacity-0 stagger-${
              i + 1
            }`}
          >
            <span className="text-2xl">{tip.emoji}</span>
            <span className="text-sm text-forest-600">{tip.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-xs text-forest-400">
        快捷键 <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-cream-200 font-mono">Ctrl</kbd>+
        <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-cream-200 font-mono">K</kbd> 随时唤起搜索
      </div>
    </div>
  );
}

function NoResults({ keyword }: { keyword: string }) {
  return (
    <div className="px-5 py-16 text-center">
      <div className="text-5xl mb-4">🌫️</div>
      <h3 className="font-bold text-forest-800 font-serif mb-2">没有找到相关结果</h3>
      <p className="text-sm text-forest-500 mb-1">
        关键词「<span className="text-forest-700 font-medium">{keyword}</span>」未匹配任何内容
      </p>
      <p className="text-xs text-forest-400">尝试更换关键词，或检查拼写是否正确</p>
    </div>
  );
}

function EmptyCategory({
  keyword,
  category,
}: {
  keyword: string;
  category: SearchCategory | "all";
}) {
  const label = category === "all" ? "全部" : SEARCH_CATEGORY_LABELS[category];
  const emoji = category === "all" ? "🔍" : SEARCH_CATEGORY_EMOJIS[category];
  return (
    <div className="px-5 py-12 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm text-forest-600">
        「{label}」分类下未找到关键词「
        <span className="font-medium text-forest-700">{keyword}</span>」的结果
      </p>
      <p className="text-xs text-forest-400 mt-1">试试切换其他分类看看</p>
    </div>
  );
}
