import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FlaskConical,
  Leaf,
  Search,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAllDiseases } from "../hooks/useQueries";
import type { DiseaseInfo } from "../hooks/useQueries";

const PLANT_TYPES = [
  "All",
  "Tomato",
  "Potato",
  "Apple",
  "Grape",
  "Pepper",
  "Corn",
];

const SEVERITY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  healthy: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Healthy",
  },
  mild: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    label: "Mild",
  },
  moderate: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    label: "Moderate",
  },
  severe: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Severe",
  },
};

function getSeverityConfig(severity: string) {
  return SEVERITY_CONFIG[severity.toLowerCase()] ?? SEVERITY_CONFIG.moderate;
}

function DiseaseCard({
  disease,
  index,
}: { disease: DiseaseInfo; index: number }) {
  const sev = getSeverityConfig(disease.severity);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="bg-card rounded-2xl border border-pv-border shadow-card hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col"
      data-ocid={`knowledge.item.${index}`}
    >
      {/* Header stripe */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            sev.label === "Severe"
              ? "oklch(0.60 0.20 25)"
              : sev.label === "Moderate"
                ? "oklch(0.70 0.14 54)"
                : sev.label === "Mild"
                  ? "oklch(0.80 0.14 90)"
                  : "oklch(0.65 0.14 150)",
        }}
      />

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pv-highlight flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-pv-green" />
            </div>
            <div>
              <Badge
                variant="outline"
                className="text-[10px] text-pv-green border-pv-green/30 bg-pv-highlight"
              >
                {disease.plantType}
              </Badge>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sev.bg} ${sev.text} ${sev.border}`}
          >
            <ShieldAlert className="w-2.5 h-2.5" />
            {sev.label}
          </span>
        </div>

        <h4 className="font-bold text-foreground leading-snug">
          {disease.diseaseName}
        </h4>

        {/* Symptoms */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            <Stethoscope className="w-3 h-3" />
            Symptoms
          </div>
          <p className="text-xs text-foreground leading-relaxed line-clamp-2">
            {disease.symptoms}
          </p>
        </div>

        {/* Treatment */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            <FlaskConical className="w-3 h-3" />
            Treatment
          </div>
          <p className="text-xs text-foreground leading-relaxed line-clamp-2">
            {disease.treatment}
          </p>
        </div>

        {/* Prevention */}
        <div className="mt-auto pt-3 border-t border-pv-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold">Prevention: </span>
            {disease.prevention}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const { data: diseases = [], isLoading } = useAllDiseases();

  const filtered = useMemo(() => {
    let list = diseases;
    if (activeTab !== "All") {
      list = list.filter((d) => d.plantType === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.diseaseName.toLowerCase().includes(q) ||
          d.plantType.toLowerCase().includes(q) ||
          d.symptoms.toLowerCase().includes(q),
      );
    }
    return list;
  }, [diseases, activeTab, search]);

  return (
    <div data-ocid="knowledge.section">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases, plants, symptoms…"
            className="pl-9 rounded-full border-pv-border bg-pv-surface"
            data-ocid="knowledge.search_input"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="knowledge.filter.tab"
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-card border border-pv-border rounded-full p-1">
            {PLANT_TYPES.map((pt) => (
              <TabsTrigger
                key={pt}
                value={pt}
                className="text-xs rounded-full data-[state=active]:bg-pv-green data-[state=active]:text-white"
                data-ocid={`knowledge.${pt.toLowerCase()}.tab`}
              >
                {pt}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Disease Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="knowledge.loading_state"
        >
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <Skeleton key={key} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="knowledge.empty_state"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No diseases found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="knowledge.list"
        >
          {filtered.map((disease, i) => (
            <DiseaseCard
              key={String(disease.id)}
              disease={disease}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
