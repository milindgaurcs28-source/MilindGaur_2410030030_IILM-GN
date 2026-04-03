import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DiseaseInfo {
    id: bigint;
    plantType: string;
    treatment: string;
    diseaseName: string;
    symptoms: string;
    severity: string;
    prevention: string;
}
export interface DetectionRecord {
    id: DetectionID;
    plantType: string;
    diseaseName: string;
    timestamp: bigint;
    modelUsed: string;
    severity: string;
    confidence: number;
}
export type DetectionID = bigint;
export interface ModelMetrics {
    validationAccuracy: number;
    inferenceTimeMs: number;
    loss: number;
    parameters: bigint;
    modelName: string;
    validationLoss: number;
    accuracy: number;
}
export interface backendInterface {
    clearHistory(): Promise<void>;
    getAllDiseases(): Promise<Array<DiseaseInfo>>;
    getDetectionHistory(): Promise<Array<DetectionRecord>>;
    getDiseaseInfo(diseaseName: string): Promise<DiseaseInfo>;
    getModelMetrics(): Promise<Array<ModelMetrics>>;
    saveDetection(plantType: string, diseaseName: string, confidence: number, modelUsed: string, severity: string): Promise<DetectionID>;
}
