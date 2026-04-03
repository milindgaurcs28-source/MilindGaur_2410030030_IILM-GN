import { useCamera } from "@/camera/useCamera";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Cpu,
  ImageIcon,
  Leaf,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAllDiseases, useSaveDetection } from "../hooks/useQueries";
import type { DiseaseInfo } from "../hooks/useQueries";
import AICircle from "./AICircle";
import type { AICircleState } from "./AICircle";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputMode = "upload" | "webcam" | "sample";

interface ModelResultItem {
  modelName: string;
  displayName: string;
  confidence: number;
  color: string;
}

interface AlternativeItem {
  diseaseName: string;
  confidence: number;
}

interface DetectionResultType {
  disease: DiseaseInfo;
  primaryConfidence: number;
  primaryModel: string;
  modelResults: ModelResultItem[];
  alternatives: AlternativeItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────────

const MODEL_OPTIONS = [
  { id: "GoogleNet", label: "GoogleNet (Inception)", color: "#1F6B4D" },
  { id: "ResNet", label: "ResNet-50", color: "#E8894C" },
  { id: "MobileNet", label: "MobileNet", color: "#A8DCC5" },
];

const SAMPLE_IMAGES = [
  {
    path: "/assets/generated/leaf-tomato-early-blight.dim_400x400.jpg",
    plant: "Tomato",
    disease: "Early Blight",
  },
  {
    path: "/assets/generated/leaf-tomato-healthy.dim_400x400.jpg",
    plant: "Tomato",
    disease: "Healthy",
  },
  {
    path: "/assets/generated/leaf-potato-late-blight.dim_400x400.jpg",
    plant: "Potato",
    disease: "Late Blight",
  },
  {
    path: "/assets/generated/leaf-corn-blight.dim_400x400.jpg",
    plant: "Corn",
    disease: "Northern Corn Leaf Blight",
  },
  {
    path: "/assets/generated/leaf-grape-black-rot.dim_400x400.jpg",
    plant: "Grape",
    disease: "Black Rot",
  },
  {
    path: "/assets/generated/leaf-apple-scab.dim_400x400.jpg",
    plant: "Apple",
    disease: "Apple Scab",
  },
  {
    path: "/assets/generated/leaf-pepper-bacterial-spot.dim_400x400.jpg",
    plant: "Pepper",
    disease: "Bacterial Spot",
  },
  {
    path: "/assets/generated/leaf-tomato-powdery-mildew.dim_400x400.jpg",
    plant: "Tomato",
    disease: "Powdery Mildew",
  },
] as const;

const FALLBACK_DISEASES: DiseaseInfo[] = [
  {
    id: 1n,
    plantType: "Tomato",
    diseaseName: "Early Blight",
    symptoms: "Dark spots on leaves, stem lesions",
    treatment: "Fungicides, remove infected leaves",
    prevention: "Crop rotation, proper spacing",
    severity: "Moderate",
  },
  {
    id: 2n,
    plantType: "Tomato",
    diseaseName: "Late Blight",
    symptoms: "Water-soaked lesions, white mold",
    treatment: "Fungicides, remove infected plants",
    prevention: "Clean tools, resistant varieties",
    severity: "Severe",
  },
  {
    id: 3n,
    plantType: "Potato",
    diseaseName: "Potato Scab",
    symptoms: "Corky lesions on tubers",
    treatment: "Use certified seed potatoes",
    prevention: "Rotate crops, maintain soil pH",
    severity: "Mild",
  },
  {
    id: 4n,
    plantType: "Apple",
    diseaseName: "Apple Scab",
    symptoms: "Olive green spots on leaves, fruit lesions",
    treatment: "Fungicides, remove fallen leaves",
    prevention: "Prune trees, resistant varieties",
    severity: "Moderate",
  },
  {
    id: 5n,
    plantType: "Grape",
    diseaseName: "Powdery Mildew",
    symptoms: "White powdery patches on leaves",
    treatment: "Fungicides, improve air circulation",
    prevention: "Proper spacing, resistant varieties",
    severity: "Moderate",
  },
  {
    id: 6n,
    plantType: "Corn",
    diseaseName: "Northern Corn Leaf Blight",
    symptoms: "Cigar-shaped lesions on leaves",
    treatment: "Fungicides, remove crop debris",
    prevention: "Rotate crops, resistant varieties",
    severity: "Moderate",
  },
  {
    id: 7n,
    plantType: "Tomato",
    diseaseName: "Healthy Tomato",
    symptoms: "No visible symptoms",
    treatment: "Continue regular maintenance",
    prevention: "Maintain good practices",
    severity: "Healthy",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getSeverityConfig(severity: string) {
  switch (severity.toLowerCase()) {
    case "healthy":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
        label: "Healthy",
      };
    case "mild":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        dot: "bg-yellow-500",
        label: "Mild",
      };
    case "moderate":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        dot: "bg-orange-500",
        label: "Moderate",
      };
    case "severe":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
        label: "Severe",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        dot: "bg-gray-500",
        label: severity,
      };
  }
}

function simulateCNNDetection(
  file: File,
  diseases: DiseaseInfo[],
  selectedModels: string[],
): DetectionResultType {
  const list = diseases.length > 0 ? diseases : FALLBACK_DISEASES;
  const seed = ((file.size * 31 + file.lastModified) >>> 0) % 0x7fffffff;

  const diseaseIndex = seed % list.length;
  const disease = list[diseaseIndex];

  const primaryConf = 75 + (seed % 24);
  const remaining = 100 - primaryConf;
  const alt1Idx = (diseaseIndex + 1 + (seed % 3)) % list.length;
  const alt2Idx = (diseaseIndex + 2 + ((seed >> 4) % 3)) % list.length;
  const alt1Conf = Math.floor(remaining * 0.6);
  const alt2Conf = remaining - alt1Conf;

  const colorMap: Record<string, string> = {
    GoogleNet: "#1F6B4D",
    ResNet: "#E8894C",
    MobileNet: "#A8DCC5",
  };

  const modelResults: ModelResultItem[] = selectedModels.map((modelId, i) => {
    const variation = ((seed >> (i * 3)) & 7) - 3;
    const conf = Math.max(70, Math.min(99, primaryConf + variation));
    const opt = MODEL_OPTIONS.find((m) => m.id === modelId);
    return {
      modelName: modelId,
      displayName: opt?.label ?? modelId,
      confidence: conf,
      color: colorMap[modelId] ?? "#1F6B4D",
    };
  });

  return {
    disease,
    primaryConfidence: primaryConf,
    primaryModel: modelResults[0]?.displayName ?? selectedModels[0],
    modelResults,
    alternatives: [
      { diseaseName: list[alt1Idx].diseaseName, confidence: alt1Conf },
      { diseaseName: list[alt2Idx].diseaseName, confidence: alt2Conf },
    ],
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────────────

export default function DetectionPanel() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "GoogleNet",
    "ResNet",
    "MobileNet",
  ]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResultType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: diseases = [] } = useAllDiseases();
  const saveMutation = useSaveDetection();

  // ── Camera hook ──
  const {
    isActive: cameraIsActive,
    isSupported: cameraIsSupported,
    error: cameraError,
    isLoading: cameraIsLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", width: 640, height: 480 });

  useEffect(() => {
    if (inputMode !== "webcam" && cameraIsActive) {
      stopCamera();
    }
  }, [inputMode, cameraIsActive, stopCamera]);

  // Derive AICircle state
  const circleState: AICircleState = hasError
    ? "error"
    : isAnalyzing
      ? "scanning"
      : result
        ? "result"
        : "idle";

  // ── Handlers ──

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploadedFile(file);
    setResult(null);
    setHasError(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const runAnalysis = useCallback(
    async (file: File) => {
      if (selectedModels.length === 0) {
        toast.error("Select at least one model");
        return;
      }
      setIsAnalyzing(true);
      setHasError(false);
      setProgress(0);

      try {
        const steps = [10, 25, 45, 65, 80, 95, 100];
        for (const step of steps) {
          await new Promise((r) => setTimeout(r, 280));
          setProgress(step);
        }

        const detection = simulateCNNDetection(file, diseases, selectedModels);
        setResult(detection);
        setIsAnalyzing(false);

        saveMutation.mutate({
          plantType: detection.disease.plantType,
          diseaseName: detection.disease.diseaseName,
          confidence: detection.primaryConfidence / 100,
          modelUsed: detection.modelResults[0]?.modelName ?? selectedModels[0],
          severity: detection.disease.severity,
        });

        toast.success(`Detection complete: ${detection.disease.diseaseName}`);
      } catch {
        setIsAnalyzing(false);
        setHasError(true);
        toast.error("Analysis failed. Please try again.");
      }
    },
    [selectedModels, diseases, saveMutation],
  );

  const handleAnalyze = async () => {
    if (!uploadedFile || selectedModels.length === 0) return;
    await runAnalysis(uploadedFile);
  };

  const handleCapture = useCallback(async () => {
    const file = await capturePhoto();
    if (!file) {
      toast.error("Failed to capture photo");
      return;
    }
    handleFile(file);
    setInputMode("upload");
    setTimeout(() => runAnalysis(file), 150);
  }, [capturePhoto, handleFile, runAnalysis]);

  const handleSampleClick = useCallback(
    async (sample: (typeof SAMPLE_IMAGES)[number]) => {
      try {
        const response = await fetch(sample.path);
        if (!response.ok) throw new Error("Failed to fetch image");
        const blob = await response.blob();
        const filename = sample.path.split("/").pop() ?? "sample.jpg";
        const file = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });
        handleFile(file);
        setInputMode("upload");
        setTimeout(() => runAnalysis(file), 150);
      } catch {
        toast.error("Failed to load sample image");
      }
    },
    [handleFile, runAnalysis],
  );

  const handleTabChange = useCallback(
    (tab: InputMode) => {
      if (tab !== "webcam" && cameraIsActive) {
        stopCamera();
      }
      setInputMode(tab);
    },
    [cameraIsActive, stopCamera],
  );

  const resetUpload = () => {
    setPreviewUrl(null);
    setUploadedFile(null);
    setResult(null);
    setProgress(0);
    setHasError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId],
    );
  };

  const sev = result ? getSeverityConfig(result.disease.severity) : null;

  const TABS: { id: InputMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "upload",
      label: "Upload File",
      icon: <Upload className="w-3 h-3" />,
    },
    {
      id: "webcam",
      label: "Live Webcam",
      icon: <Camera className="w-3 h-3" />,
    },
    {
      id: "sample",
      label: "Sample Images",
      icon: <ImageIcon className="w-3 h-3" />,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Sidebar ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tabbed Input Card */}
          <div className="bg-card rounded-2xl border border-pv-border shadow-card overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-pv-border">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Upload Leaf Image
              </h3>
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      inputMode === tab.id
                        ? "bg-pv-green text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                    data-ocid={`detect.${tab.id}.tab`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.id === "upload"
                        ? "Upload"
                        : tab.id === "webcam"
                          ? "Camera"
                          : "Samples"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* ── Upload Tab ── */}
              {inputMode === "upload" && (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Upload leaf image — click or drag and drop"
                      className={`w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "dropzone-active"
                          : "border-pv-border hover:border-pv-green hover:bg-pv-highlight/30"
                      } ${previewUrl ? "border-solid border-pv-green" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      data-ocid="detect.dropzone"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0])
                            handleFile(e.target.files[0]);
                        }}
                        data-ocid="detect.upload_button"
                      />
                      {previewUrl ? (
                        <div className="space-y-2">
                          <img
                            src={previewUrl}
                            alt="Uploaded leaf"
                            className="w-32 h-32 object-cover rounded-xl mx-auto"
                          />
                          <p className="text-xs font-medium text-foreground truncate max-w-full">
                            {uploadedFile?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {uploadedFile
                              ? (uploadedFile.size / 1024).toFixed(1)
                              : 0}
                            KB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-pv-highlight mx-auto flex items-center justify-center">
                            <Upload className="w-6 h-6 text-pv-green" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Click to upload or drag &amp; drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP supported
                          </p>
                        </div>
                      )}
                    </button>

                    {previewUrl && (
                      <button
                        type="button"
                        onClick={resetUpload}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        aria-label="Remove uploaded image"
                        data-ocid="detect.close_button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={
                      !uploadedFile ||
                      isAnalyzing ||
                      selectedModels.length === 0
                    }
                    className="w-full font-semibold"
                    style={
                      uploadedFile && !isAnalyzing && selectedModels.length > 0
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.74 0.14 54), oklch(0.68 0.15 51))",
                            color: "white",
                            border: "none",
                          }
                        : {}
                    }
                    data-ocid="detect.primary_button"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 mr-2" />
                        Run CNN Analysis
                      </>
                    )}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-1" data-ocid="detect.loading_state">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processing…</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                </>
              )}

              {/* ── Webcam Tab ── */}
              {inputMode === "webcam" && (
                <div className="space-y-3">
                  {cameraIsSupported === false && (
                    <div
                      className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl p-3 text-xs"
                      data-ocid="detect.webcam.error_state"
                    >
                      <CameraOff className="w-4 h-4 flex-shrink-0" />
                      <span>Camera is not supported in this browser.</span>
                    </div>
                  )}

                  {cameraError && (
                    <div
                      className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl p-3 text-xs"
                      data-ocid="detect.webcam.error_state"
                    >
                      <CameraOff className="w-4 h-4 flex-shrink-0" />
                      <span>{cameraError.message}</span>
                    </div>
                  )}

                  <div
                    className={`relative w-full rounded-xl overflow-hidden bg-black ${
                      !cameraIsActive && !cameraIsLoading ? "hidden" : ""
                    }`}
                    style={{ aspectRatio: "4/3" }}
                  >
                    {cameraIsLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 z-10">
                        <Loader2 className="w-8 h-8 text-pv-green animate-spin" />
                        <span className="text-white text-xs">
                          Starting camera…
                        </span>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      data-ocid="detect.webcam.canvas_target"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {!cameraIsActive && !cameraIsLoading && (
                    <div className="relative w-full rounded-xl overflow-hidden bg-muted flex flex-col items-center justify-center gap-2 py-10">
                      <Camera className="w-10 h-10 text-muted-foreground opacity-40" />
                      <p className="text-xs text-muted-foreground">
                        Camera inactive
                      </p>
                    </div>
                  )}

                  {!cameraIsActive ? (
                    <Button
                      type="button"
                      onClick={startCamera}
                      disabled={cameraIsLoading || cameraIsSupported === false}
                      className="w-full font-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.35 0.10 163), oklch(0.28 0.08 163))",
                        color: "white",
                        border: "none",
                      }}
                      data-ocid="detect.webcam.primary_button"
                    >
                      {cameraIsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting…
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={!cameraIsActive || cameraIsLoading}
                        className="flex-1 font-semibold"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.74 0.14 54), oklch(0.68 0.15 51))",
                          color: "white",
                          border: "none",
                        }}
                        data-ocid="detect.webcam.secondary_button"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={stopCamera}
                        disabled={cameraIsLoading}
                        className="px-3"
                        data-ocid="detect.webcam.cancel_button"
                      >
                        <CameraOff className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Sample Images Tab ── */}
              {inputMode === "sample" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    PlantVillage dataset samples — click to analyze
                  </p>
                  <div
                    className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-0.5"
                    data-ocid="detect.sample.list"
                  >
                    {SAMPLE_IMAGES.map((sample, i) => (
                      <button
                        key={sample.path}
                        type="button"
                        className="rounded-xl overflow-hidden border border-pv-border cursor-pointer hover:border-pv-green transition-all text-left group"
                        onClick={() => handleSampleClick(sample)}
                        data-ocid={`detect.sample.item.${i + 1}`}
                      >
                        <img
                          src={sample.path}
                          alt={`${sample.plant} — ${sample.disease}`}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="px-2 py-1.5">
                          <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
                            {sample.disease}
                          </p>
                          <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-pv-highlight text-pv-green mt-0.5">
                            {sample.plant}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="bg-card rounded-2xl border border-pv-border shadow-card p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-pv-green" />
              Select Models
            </h3>
            <div className="space-y-2.5">
              {MODEL_OPTIONS.map((model) => (
                <div key={model.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => toggleModel(model.id)}
                    data-ocid={`detect.${model.id.toLowerCase()}.checkbox`}
                  />
                  <Label
                    htmlFor={`model-${model.id}`}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: model.color }}
                    />
                    {model.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedModels.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Select at least one model
              </p>
            )}
          </div>
        </div>

        {/* ── Right: AI Visualization + Results ── */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl border border-pv-border shadow-card overflow-hidden h-full"
            style={{
              background:
                "linear-gradient(145deg, rgb(11,17,32) 0%, rgb(15,23,42) 50%, rgb(10,16,28) 100%)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    AI Analysis Visualizer
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    CNN model analysis output
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(22,163,74,0.15)",
                    border: "1px solid rgba(22,163,74,0.25)",
                    color: "rgba(22,163,74,0.9)",
                  }}
                >
                  <Activity className="w-3 h-3" />
                  <span className="font-semibold">Live</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* ── AI Circle ── */}
              <div className="flex justify-center py-6">
                <AICircle
                  state={circleState}
                  imageUrl={previewUrl}
                  confidence={result?.primaryConfidence ?? 0}
                  diseaseName={result?.disease.diseaseName}
                  plantType={result?.disease.plantType}
                  onUploadClick={() => fileInputRef.current?.click()}
                  size={280}
                />
              </div>

              {/* Hidden file input for AICircle click */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />

              {/* ── Detailed Results (shown only in result state) ── */}
              <AnimatePresence mode="wait">
                {isAnalyzing && (
                  <motion.div
                    key="analyzing-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-center"
                    data-ocid="detect.loading_state"
                  >
                    <div
                      className="rounded-xl px-4 py-3 mx-auto max-w-xs"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p className="text-white/60 text-xs">
                        Processing with{" "}
                        <span className="text-white/90 font-medium">
                          {selectedModels.join(", ")}
                        </span>
                      </p>
                      <Progress value={progress} className="mt-2 h-1" />
                    </div>
                  </motion.div>
                )}

                {result && !isAnalyzing && (
                  <motion.div
                    key="result-detail"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="mt-4 space-y-4"
                    data-ocid="detect.success_state"
                  >
                    {/* Disease header */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs border-green-500/30 bg-green-500/10 text-green-400"
                            >
                              {result.disease.plantType}
                            </Badge>
                            {sev && (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${sev.bg} ${sev.text}`}
                                data-ocid="detect.result.card"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}
                                />
                                {sev.label}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-display font-bold text-white">
                            {result.disease.diseaseName}
                          </h4>
                          <p
                            className="text-sm mt-0.5"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            Confidence:{" "}
                            <span className="font-bold text-emerald-400">
                              {result.primaryConfidence}%
                            </span>
                          </p>
                        </div>
                        <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                      </div>

                      <div
                        className="h-px my-3"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      />

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p
                            className="text-xs uppercase tracking-wide mb-1"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                          >
                            Symptoms
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.75)" }}>
                            {result.disease.symptoms}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs uppercase tracking-wide mb-1"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                          >
                            Treatment
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.75)" }}>
                            {result.disease.treatment}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Per-model confidence */}
                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <p className="text-sm font-semibold text-white/80">
                        Per-Model Confidence
                      </p>
                      {result.modelResults.map((m) => (
                        <div key={m.modelName} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-white/70">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: m.color }}
                              />
                              {m.displayName}
                            </span>
                            <span className="font-bold text-white/90">
                              {m.confidence}%
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: m.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.confidence}%` }}
                              transition={{
                                duration: 0.8,
                                ease: "easeOut",
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alternatives + Actions */}
                    {result.alternatives.length > 0 && (
                      <div
                        className="rounded-xl p-4 space-y-2"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          Alternative Possibilities
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {result.alternatives.map((alt) => (
                            <div
                              key={alt.diseaseName}
                              className="flex items-center justify-between rounded-lg px-3 py-2"
                              style={{ background: "rgba(255,255,255,0.04)" }}
                            >
                              <span className="text-xs text-white/60 truncate">
                                {alt.diseaseName}
                              </span>
                              <span className="text-xs font-bold text-white/50 ml-2">
                                {alt.confidence}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Primary model:{" "}
                        <span className="font-medium text-white/70">
                          {result.primaryModel}
                        </span>
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetUpload}
                        className="text-xs border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                        data-ocid="detect.secondary_button"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!result && !isAnalyzing && circleState === "idle" && (
                  <motion.div
                    key="empty-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mt-2"
                    data-ocid="detect.empty_state"
                  >
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      Click the circle to upload a leaf image, or use the panel
                      on the left
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
