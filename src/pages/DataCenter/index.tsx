import { useState, useRef, useMemo } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  Database,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAppStore } from "@/store";
import {
  downloadJSON,
  downloadCSV,
  plantsToCSV,
  careLogsToCSV,
  pestsToCSV,
  environmentRecordsToCSV,
  expenseRecordsToCSV,
  yearlyExpensesToCSV,
} from "@/utils/export";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
  EXPENSE_CATEGORY_COLORS,
} from "@/types";
import { formatDateTime } from "@/utils/format";

export function DataCenter() {
  const plants = useAppStore((s) => s.plants);
  const careLogs = useAppStore((s) => s.careLogs);
  const leafRecords = useAppStore((s) => s.leafRecords);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const environmentRecords = useAppStore((s) => s.environmentRecords);
  const expenseRecords = useAppStore((s) => s.expenseRecords);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const resetWithMockData = useAppStore((s) => s.resetWithMockData);
  const getCategoryExpenseSummary = useAppStore((s) => s.getCategoryExpenseSummary);
  const getPlantYearlyExpenses = useAppStore((s) => s.getPlantYearlyExpenses);
  const getExpenseYears = useAppStore((s) => s.getExpenseYears);

  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const expenseYears = useMemo(() => getExpenseYears(), [getExpenseYears]);
  const categorySummary = useMemo(
    () => getCategoryExpenseSummary(selectedYear),
    [getCategoryExpenseSummary, selectedYear]
  );
  const yearlyExpenses = useMemo(
    () => getPlantYearlyExpenses(selectedYear),
    [getPlantYearlyExpenses, selectedYear]
  );

  const totalExpense = useMemo(
    () => categorySummary.reduce((sum, c) => sum + c.totalAmount, 0),
    [categorySummary]
  );

  const pieChartData = useMemo(() => {
    return categorySummary
      .filter((c) => c.totalAmount > 0)
      .map((c) => ({
        name: EXPENSE_CATEGORY_LABELS[c.category],
        value: c.totalAmount,
        color: EXPENSE_CATEGORY_COLORS[c.category].chart,
      }));
  }, [categorySummary]);

  const totalRecords =
    plants.length +
    careLogs.length +
    leafRecords.length +
    pestRecords.length +
    environmentRecords.length +
    expenseRecords.length;

  const handleExportJSON = () => {
    const json = exportData();
    const filename = `plant-journal-backup-${formatDateTime(new Date()).replace(
      /[: ]/g,
      "-"
    )}.json`;
    downloadJSON(json, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const success = importData(json);
      if (success) {
        setImportMessage({ type: "success", text: "数据导入成功！" });
      } else {
        setImportMessage({ type: "error", text: "导入失败：文件格式不正确" });
      }
      setTimeout(() => setImportMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportPlantsCSV = () => {
    downloadCSV(plantsToCSV(plants), `plants-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`);
  };

  const handleExportCareCSV = () => {
    downloadCSV(
      careLogsToCSV(careLogs, plants),
      `care-logs-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`
    );
  };

  const handleExportPestsCSV = () => {
    downloadCSV(
      pestsToCSV(pestRecords, plants),
      `pest-records-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`
    );
  };

  const handleExportEnvironmentCSV = () => {
    downloadCSV(
      environmentRecordsToCSV(environmentRecords),
      `environment-records-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`
    );
  };

  const handleExportExpenseCSV = () => {
    downloadCSV(
      expenseRecordsToCSV(expenseRecords, plants),
      `expense-records-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`
    );
  };

  const handleExportYearlyExpenseCSV = () => {
    downloadCSV(
      yearlyExpensesToCSV(yearlyExpenses, selectedYear),
      `yearly-expenses-${selectedYear}-${formatDateTime(new Date()).replace(/[: ]/g, "-")}.csv`
    );
  };

  const handleClearData = () => {
    if (confirm("确定清空所有数据吗？此操作不可撤销！")) {
      if (confirm("再次确认：真的要删除所有植物、日志和记录吗？")) {
        clearAllData();
      }
    }
  };

  const handleResetMock = () => {
    if (confirm("重置为示例数据？当前数据将被覆盖。")) {
      resetWithMockData();
    }
  };

  const stats = [
    { label: "植物", value: plants.length, icon: "🪴", color: "from-forest-400 to-forest-600" },
    { label: "养护记录", value: careLogs.length, icon: "💧", color: "from-sky-400 to-sky-600" },
    { label: "叶片记录", value: leafRecords.length, icon: "🍃", color: "from-emerald-400 to-emerald-600" },
    { label: "病虫害", value: pestRecords.length, icon: "🐛", color: "from-amber-400 to-amber-600" },
    { label: "环境监测", value: environmentRecords.length, icon: "🌡️", color: "from-rose-400 to-rose-600" },
    { label: "费用记录", value: expenseRecords.length, icon: "💰", color: "from-purple-400 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">📊 数据中心</h1>
        <p className="page-subtitle">管理和导出你的植物养护数据</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
            <Database className="text-forest-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 font-serif">数据概览</h3>
            <p className="text-sm text-forest-500">共 {totalRecords} 条数据记录</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-4 rounded-xl bg-gradient-to-br ${s.color} bg-opacity-10 border border-opacity-20 relative overflow-hidden animate-fade-in-up opacity-0 stagger-${i + 1}`}
              style={{ backgroundColor: "rgba(243, 248, 239, 1)" }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-bold text-forest-900 font-serif">{s.value}</p>
              <p className="text-xs text-forest-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <HardDrive className="text-sky-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 font-serif">数据备份</h3>
              <p className="text-sm text-forest-500">完整备份或恢复所有数据</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-forest-50 to-cream-50 hover:from-forest-100 hover:to-cream-100 transition-all border border-forest-100 group"
            >
              <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileJson className="text-forest-600" size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">导出完整备份</p>
                <p className="text-xs text-forest-500">JSON 格式，包含所有数据</p>
              </div>
              <Download size={18} className="text-forest-500" />
            </button>

            <div>
              <button
                onClick={handleImportClick}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-cream-50 hover:from-sky-100 hover:to-cream-100 transition-all border border-sky-100 group"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-sky-600" size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-forest-800">从备份恢复</p>
                  <p className="text-xs text-forest-500">选择 JSON 备份文件导入</p>
                </div>
                <Upload size={18} className="text-sky-500" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              {importMessage && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm ${
                    importMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {importMessage.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  {importMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileSpreadsheet className="text-amber-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 font-serif">导出为 CSV</h3>
              <p className="text-sm text-forest-500">可在 Excel 中打开分析</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExportPlantsCSV}
              disabled={plants.length === 0}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-forest-50 hover:bg-forest-100 transition-all border border-forest-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl">🪴</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">植物档案</p>
                <p className="text-xs text-forest-500">{plants.length} 条记录</p>
              </div>
              <Download size={16} className="text-forest-500" />
            </button>
            <button
              onClick={handleExportCareCSV}
              disabled={careLogs.length === 0}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-all border border-sky-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl">💧</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">养护记录</p>
                <p className="text-xs text-forest-500">{careLogs.length} 条记录</p>
              </div>
              <Download size={16} className="text-sky-500" />
            </button>
            <button
              onClick={handleExportPestsCSV}
              disabled={pestRecords.length === 0}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-all border border-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl">🐛</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">病虫害记录</p>
                <p className="text-xs text-forest-500">{pestRecords.length} 条记录</p>
              </div>
              <Download size={16} className="text-amber-500" />
            </button>
            <button
              onClick={handleExportEnvironmentCSV}
              disabled={environmentRecords.length === 0}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl">🌡️</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">环境监测记录</p>
                <p className="text-xs text-forest-500">{environmentRecords.length} 条记录</p>
              </div>
              <Download size={16} className="text-rose-500" />
            </button>
            <button
              onClick={handleExportExpenseCSV}
              disabled={expenseRecords.length === 0}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl">💰</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-forest-800">费用记录</p>
                <p className="text-xs text-forest-500">{expenseRecords.length} 条记录</p>
              </div>
              <Download size={16} className="text-purple-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <PieChart className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 font-serif">分类费用报表</h3>
              <p className="text-sm text-forest-500">按类别统计费用支出分布</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="select-field w-auto"
            >
              {expenseYears.length > 0 ? (
                expenseYears.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))
              ) : (
                <option value={currentYear}>{currentYear}年</option>
              )}
            </select>
            <button
              onClick={handleExportYearlyExpenseCSV}
              disabled={totalExpense === 0}
              className="btn-secondary text-sm py-2"
            >
              <Download size={14} />
              导出报表
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-forest-500">{selectedYear}年总支出</p>
          <p className="text-4xl font-bold text-rose-600 font-serif">
            ¥{totalExpense.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-forest-400">
                暂无费用数据
              </div>
            )}
          </div>

          <div className="space-y-2">
            {categorySummary.map((item, i) => {
              const colors = EXPENSE_CATEGORY_COLORS[item.category];
              return (
                <div
                  key={item.category}
                  className={`p-3 rounded-xl ${colors.bg} ${colors.border} border animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {EXPENSE_CATEGORY_ICONS[item.category]}
                      </span>
                      <span className={`text-sm font-medium ${colors.text}`}>
                        {EXPENSE_CATEGORY_LABELS[item.category]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-forest-800">
                        ¥{item.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-xs text-forest-500 ml-2">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: colors.chart,
                      }}
                    />
                  </div>
                  <p className="text-xs text-forest-500 mt-2">
                    {item.recordCount} 笔记录
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 font-serif">年度开支排行</h3>
            <p className="text-sm text-forest-500">
              {selectedYear}年每株植物开支统计
            </p>
          </div>
        </div>

        {yearlyExpenses.filter((p) => p.recordCount > 0).length > 0 ? (
          <div className="space-y-3">
            {[...yearlyExpenses]
              .filter((p) => p.recordCount > 0)
              .sort((a, b) => b.totalAmount - a.totalAmount)
              .map((plantExpense, i) => {
                const maxAmount = Math.max(
                  ...yearlyExpenses.map((p) => p.totalAmount)
                );
                const percentage =
                  maxAmount > 0
                    ? (plantExpense.totalAmount / maxAmount) * 100
                    : 0;
                return (
                  <div
                    key={plantExpense.plantId}
                    className="p-4 rounded-xl bg-forest-50 border border-forest-100 animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl">
                          {plantExpense.plantAvatar}
                        </div>
                        <div>
                          <p className="font-medium text-forest-800">
                            {plantExpense.plantName}
                          </p>
                          <p className="text-xs text-forest-500">
                            {plantExpense.recordCount} 笔记录
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-rose-600 font-serif">
                          ¥{plantExpense.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-forest-400 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(
                        Object.keys(plantExpense.categoryBreakdown) as Array<
                          keyof typeof plantExpense.categoryBreakdown
                        >
                      )
                        .filter((cat) => plantExpense.categoryBreakdown[cat] > 0)
                        .map((cat) => {
                          const colors = EXPENSE_CATEGORY_COLORS[cat];
                          return (
                            <span
                              key={cat}
                              className={`text-xs px-2 py-1 rounded-md ${colors.bg} ${colors.text}`}
                            >
                              {EXPENSE_CATEGORY_ICONS[cat]}{" "}
                              {EXPENSE_CATEGORY_LABELS[cat]}: ¥
                              {plantExpense.categoryBreakdown[cat].toFixed(2)}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 text-forest-400">
            <p>{selectedYear}年暂无费用记录</p>
          </div>
        )}
      </div>

      <div className="card p-6 border-red-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-forest-900 font-serif">数据管理</h3>
            <p className="text-sm text-forest-500">危险操作，请谨慎使用</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetMock}
            className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-700 font-medium transition-all border border-forest-100"
          >
            <RefreshCw size={18} />
            重置为示例数据
          </button>
          <button
            onClick={handleClearData}
            className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all border border-red-100"
          >
            <Trash2 size={18} />
            清空所有数据
          </button>
        </div>
      </div>
    </div>
  );
}
