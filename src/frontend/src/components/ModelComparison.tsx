import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Clock, Cpu, Database, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useModelMetrics } from "../hooks/useQueries";
import type { ModelMetrics } from "../hooks/useQueries";

// ─── Chart colors matching design spec ──────────────────────────────────────
const CHART_COLORS = {
  GoogleNet: "#1F6B4D",
  ResNet: "#E8894C",
  MobileNet: "#A8DCC5",
};

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c"];

// Fallback data while backend loads
const FALLBACK_METRICS: ModelMetrics[] = [
  {
    modelName: "GoogleNet",
    accuracy: 96.5,
    validationAccuracy: 95.2,
    loss: 0.12,
    validationLoss: 0.15,
    inferenceTimeMs: 45,
    parameters: 13000000n,
  },
  {
    modelName: "ResNet",
    accuracy: 97.8,
    validationAccuracy: 96.7,
    loss: 0.09,
    validationLoss: 0.12,
    inferenceTimeMs: 52,
    parameters: 11600000n,
  },
  {
    modelName: "MobileNet",
    accuracy: 94.8,
    validationAccuracy: 93.5,
    loss: 0.18,
    validationLoss: 0.21,
    inferenceTimeMs: 27,
    parameters: 4200000n,
  },
];

function formatParams(params: bigint): string {
  const n = Number(params);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function buildChartData(metrics: ModelMetrics[]) {
  const get = (name: string) => metrics.find((m) => m.modelName === name);
  const g = get("GoogleNet");
  const r = get("ResNet");
  const m = get("MobileNet");

  return [
    {
      metric: "Accuracy",
      GoogleNet: g ? +g.accuracy.toFixed(1) : 96.5,
      ResNet: r ? +r.accuracy.toFixed(1) : 97.8,
      MobileNet: m ? +m.accuracy.toFixed(1) : 94.8,
    },
    {
      metric: "Val. Accuracy",
      GoogleNet: g ? +g.validationAccuracy.toFixed(1) : 95.2,
      ResNet: r ? +r.validationAccuracy.toFixed(1) : 96.7,
      MobileNet: m ? +m.validationAccuracy.toFixed(1) : 93.5,
    },
    {
      metric: "Loss (×100)",
      GoogleNet: g ? +(g.loss * 100).toFixed(1) : 12.0,
      ResNet: r ? +(r.loss * 100).toFixed(1) : 9.0,
      MobileNet: m ? +(m.loss * 100).toFixed(1) : 18.0,
    },
  ];
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  GoogleNet: "GoogleNet (Inception)",
  ResNet: "ResNet-50",
  MobileNet: "MobileNet",
};

export default function ModelComparison() {
  const { data: metrics = [], isLoading } = useModelMetrics();
  const activeMetrics = metrics.length > 0 ? metrics : FALLBACK_METRICS;
  const chartData = buildChartData(activeMetrics);

  return (
    <div data-ocid="models.section">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── Grouped Bar Chart ── */}
        <div className="xl:col-span-3 bg-card rounded-2xl border border-pv-border shadow-card p-5">
          <h3 className="font-semibold text-sm text-foreground mb-4">
            Accuracy &amp; Loss Comparison
          </h3>
          {isLoading ? (
            <Skeleton
              className="h-64 w-full"
              data-ocid="models.loading_state"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.90 0.02 161)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="metric"
                    tick={{ fontSize: 12, fill: "oklch(0.52 0.04 152)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.52 0.04 152)" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid oklch(0.90 0.02 152)",
                      boxShadow: "0 4px 16px oklch(0.18 0.02 152 / 0.08)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}`,
                      MODEL_DISPLAY_NAMES[name] ?? name,
                    ]}
                  />
                  <Legend
                    formatter={(value) => MODEL_DISPLAY_NAMES[value] ?? value}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  <Bar
                    dataKey="GoogleNet"
                    fill={CHART_COLORS.GoogleNet}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="ResNet"
                    fill={CHART_COLORS.ResNet}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="MobileNet"
                    fill={CHART_COLORS.MobileNet}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* ── Stats Cards ── */}
        <div className="xl:col-span-2 space-y-3">
          {isLoading
            ? SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-28 w-full rounded-2xl" />
              ))
            : activeMetrics.map((metric, i) => {
                const modelKey = metric.modelName as keyof typeof CHART_COLORS;
                const color = CHART_COLORS[modelKey] ?? CHART_COLORS.GoogleNet;
                const displayName =
                  MODEL_DISPLAY_NAMES[metric.modelName] ?? metric.modelName;
                return (
                  <motion.div
                    key={metric.modelName}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="bg-card rounded-2xl border border-pv-border shadow-card p-4"
                    data-ocid={`models.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="font-semibold text-sm text-foreground">
                        {displayName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <TrendingUp className="w-3.5 h-3.5 mx-auto mb-1 text-pv-green" />
                        <p className="text-base font-bold text-foreground">
                          {metric.accuracy.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Accuracy
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
                        <p className="text-base font-bold text-foreground">
                          {metric.inferenceTimeMs.toFixed(0)}ms
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Inference
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Database className="w-3.5 h-3.5 mx-auto mb-1 text-blue-500" />
                        <p className="text-base font-bold text-foreground">
                          {formatParams(metric.parameters)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Parameters
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Cpu className="w-3.5 h-3.5 mx-auto mb-1 text-purple-500" />
                        <p className="text-base font-bold text-foreground">
                          {(metric.loss * 100).toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Loss
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>

      {/* ── Full Stats Table ── */}
      <motion.div
        className="mt-6 bg-card rounded-2xl border border-pv-border shadow-card overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        data-ocid="models.table"
      >
        <div className="p-4 border-b border-pv-border">
          <h3 className="font-semibold text-sm text-foreground">
            Detailed Performance Metrics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pv-border bg-muted/50">
                {[
                  "Model",
                  "Accuracy (%)",
                  "Val. Accuracy (%)",
                  "Loss",
                  "Val. Loss",
                  "Inference (ms)",
                  "Parameters",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeMetrics.map((metric, i) => {
                const modelKey = metric.modelName as keyof typeof CHART_COLORS;
                const color = CHART_COLORS[modelKey] ?? CHART_COLORS.GoogleNet;
                const displayName =
                  MODEL_DISPLAY_NAMES[metric.modelName] ?? metric.modelName;
                return (
                  <tr
                    key={metric.modelName}
                    className="border-b border-pv-border/60 hover:bg-muted/30 transition-colors"
                    data-ocid={`models.row.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <span className="font-medium text-foreground">
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {metric.accuracy.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {metric.validationAccuracy.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {metric.loss.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {metric.validationLoss.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {metric.inferenceTimeMs.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatParams(metric.parameters)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
