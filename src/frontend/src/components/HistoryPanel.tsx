import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, History, Leaf, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useClearHistory, useDetectionHistory } from "../hooks/useQueries";
import type { DetectionRecord } from "../hooks/useQueries";

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(
    (Date.now() - Number(timestamp) / 1_000_000) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const severityConfig: Record<string, { label: string; className: string }> = {
  healthy: {
    label: "Healthy",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  mild: {
    label: "Mild",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  moderate: {
    label: "Moderate",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  severe: {
    label: "Severe",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

function HistoryCard({
  record,
  index,
}: { record: DetectionRecord; index: number }) {
  const confidence = Math.round(Number(record.confidence) * 100);
  const sev =
    severityConfig[record.severity.toLowerCase()] ?? severityConfig.moderate;

  return (
    <div
      className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-md transition-shadow"
      data-ocid={`history.item.${index}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {record.diseaseName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {record.plantType}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${sev.className}`}
        >
          {sev.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{confidence}%</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {timeAgo(record.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: history = [], isLoading } = useDetectionHistory();
  const clearMutation = useClearHistory();

  const handleClear = () => {
    if (window.confirm("Clear all detection history? This cannot be undone.")) {
      clearMutation.mutate();
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            data-ocid="history.panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 group flex-1 min-w-0"
                  data-ocid="history.toggle"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-foreground">
                      Detection History
                    </span>
                    {history.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {history.length}
                      </Badge>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-auto mr-3"
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </motion.div>
                </button>
              </CollapsibleTrigger>

              {history.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={handleClear}
                  disabled={clearMutation.isPending}
                  data-ocid="history.delete_button"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Content */}
            <CollapsibleContent>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-5"
                  >
                    {isLoading ? (
                      <div
                        className="text-center py-8 text-muted-foreground text-sm"
                        data-ocid="history.loading_state"
                      >
                        Loading history…
                      </div>
                    ) : history.length === 0 ? (
                      <div
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="history.empty_state"
                      >
                        <History className="w-10 h-10 mx-auto mb-3 opacity-25" />
                        <p className="text-sm font-medium">No analyses yet</p>
                        <p className="text-xs mt-1">
                          Upload a leaf image to get started.
                        </p>
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto"
                        data-ocid="history.list"
                      >
                        {history.map((record, i) => (
                          <HistoryCard
                            key={String(record.id)}
                            record={record}
                            index={i + 1}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </section>
  );
}
