import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DetectionRecord, DiseaseInfo, ModelMetrics } from "../backend";
import { useActor } from "./useActor";

export type { DiseaseInfo, DetectionRecord, ModelMetrics };

export function useModelMetrics() {
  const { actor, isFetching } = useActor();
  return useQuery<ModelMetrics[]>({
    queryKey: ["modelMetrics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getModelMetrics();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllDiseases() {
  const { actor, isFetching } = useActor();
  return useQuery<DiseaseInfo[]>({
    queryKey: ["diseases"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDiseases();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDetectionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<DetectionRecord[]>({
    queryKey: ["detectionHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDetectionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveDetection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      plantType: string;
      diseaseName: string;
      confidence: number;
      modelUsed: string;
      severity: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveDetection(
        params.plantType,
        params.diseaseName,
        params.confidence,
        params.modelUsed,
        params.severity,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detectionHistory"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detectionHistory"] });
    },
  });
}
