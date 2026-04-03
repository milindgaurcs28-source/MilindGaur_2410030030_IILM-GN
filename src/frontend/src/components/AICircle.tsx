import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AICircleState = "idle" | "scanning" | "result" | "error";

export interface AICircleProps {
  state: AICircleState;
  imageUrl?: string | null;
  confidence?: number; // 0–100
  diseaseName?: string;
  plantType?: string;
  errorMessage?: string;
  onUploadClick?: () => void;
  size?: number; // diameter in px, default 320
}

// ─── Slideshow images ─────────────────────────────────────────────────────────

const SLIDE_IMAGES = [
  "/assets/generated/slide-tomato-plant.dim_600x600.jpg",
  "/assets/generated/slide-apple.dim_600x600.jpg",
  "/assets/generated/slide-banana.dim_600x600.jpg",
  "/assets/generated/slide-grapes.dim_600x600.jpg",
  "/assets/generated/slide-orange.dim_600x600.jpg",
  "/assets/generated/slide-pepper.dim_600x600.jpg",
  "/assets/generated/slide-strawberry.dim_600x600.jpg",
  "/assets/generated/slide-corn.dim_600x600.jpg",
  "/assets/generated/slide-mango.dim_600x600.jpg",
  "/assets/generated/slide-potato-plant.dim_600x600.jpg",
];

// ─── Neural Network Canvas (idle state) ──────────────────────────────────────

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function NeuralCanvas({ size }: { size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    const nodeCount = 18;
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.4;
      const dist = r * (0.3 + Math.random() * 0.55);
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 2 + Math.random() * 2,
      };
    });
    nodes.push({ x: cx, y: cy, vx: 0, vy: 0, radius: 3.5 });

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      frame++;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        const dx = node.x - cx;
        const dy = node.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r - 8) {
          node.vx -= (dx / dist) * 0.04;
          node.vy -= (dy / dist) * 0.04;
        }
      }

      const maxDist = size * 0.38;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.35;
            const pulse =
              0.5 + 0.5 * Math.sin(frame * 0.02 + i * 0.5 + j * 0.3);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const grad = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y,
            );
            grad.addColorStop(0, `rgba(22,163,74,${alpha * pulse})`);
            grad.addColorStop(1, `rgba(37,99,235,${alpha * pulse})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = 0.7 + 0.3 * Math.sin(frame * 0.03 + node.x * 0.05);
        const grd = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 2.5,
        );
        grd.addColorStop(0, `rgba(22,163,74,${0.9 * pulse})`);
        grd.addColorStop(1, "rgba(37,99,235,0)");
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(22,163,74,${0.8 * pulse})`;
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="absolute inset-0 rounded-full"
    />
  );
}

// ─── Circular SVG Progress Ring ───────────────────────────────────────────────

function ConfidenceRing({
  confidence,
  size,
}: {
  confidence: number;
  size: number;
}) {
  const stroke = 5;
  const r = size / 2 - stroke / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const dash = (confidence / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      aria-label="Confidence ring"
      role="img"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        stroke="url(#confGrad)"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      />
      <defs>
        <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Main AICircle Component ──────────────────────────────────────────────────

export default function AICircle({
  state,
  imageUrl,
  confidence = 0,
  diseaseName,
  plantType,
  errorMessage,
  onUploadClick,
  size = 320,
}: AICircleProps) {
  const [ringVisible, setRingVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (state === "result") {
      const t = setTimeout(() => setRingVisible(true), 100);
      return () => clearTimeout(t);
    }
    setRingVisible(false);
  }, [state]);

  // Auto-play slideshow only in idle state
  useEffect(() => {
    if (state !== "idle") return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [state]);

  const innerSize = size;
  const glowColor =
    state === "error"
      ? "rgba(239,68,68,0.6)"
      : state === "result"
        ? "rgba(22,163,74,0.5)"
        : "rgba(37,99,235,0.4)";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ── Tooltip wrapper ── */}
      <div className="group relative flex items-center justify-center">
        {/* Tooltip */}
        {state === "idle" && (
          <div
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
              bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20
              before:absolute before:left-1/2 before:-translate-x-1/2 before:top-full
              before:border-4 before:border-transparent before:border-t-gray-900/90"
          >
            Upload image to detect disease
          </div>
        )}

        {/* ── Outer ambient glow ── */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: innerSize + 40, height: innerSize + 40 }}
          animate={{
            boxShadow:
              state === "idle"
                ? [
                    `0 0 ${hovered ? 60 : 30}px 10px rgba(37,99,235,0.25), 0 0 ${hovered ? 100 : 60}px 20px rgba(22,163,74,0.15)`,
                    `0 0 ${hovered ? 80 : 50}px 15px rgba(22,163,74,0.3), 0 0 ${hovered ? 120 : 80}px 25px rgba(37,99,235,0.2)`,
                    `0 0 ${hovered ? 60 : 30}px 10px rgba(37,99,235,0.25), 0 0 ${hovered ? 100 : 60}px 20px rgba(22,163,74,0.15)`,
                  ]
                : state === "scanning"
                  ? "0 0 50px 15px rgba(37,99,235,0.4), 0 0 90px 30px rgba(22,163,74,0.2)"
                  : `0 0 40px 12px ${glowColor}`,
          }}
          transition={{
            duration: state === "idle" ? 3 : 0.5,
            repeat: state === "idle" ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        />

        {/* ── Main circle container ── */}
        <motion.div
          className="relative rounded-full overflow-hidden cursor-pointer select-none"
          style={{
            width: innerSize,
            height: innerSize,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(17,24,39,0.96) 100%)",
            backdropFilter: "blur(16px)",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={state === "idle" ? onUploadClick : undefined}
        >
          {/* Glassmorphism inner border */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none z-10"
            style={{
              border: "2px solid",
              borderColor:
                state === "scanning"
                  ? "rgba(37,99,235,0.5)"
                  : state === "result"
                    ? "rgba(22,163,74,0.5)"
                    : state === "error"
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.1)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          />

          {/* ── State contents ── */}
          <AnimatePresence mode="wait">
            {/* IDLE */}
            {state === "idle" && (
              <motion.div
                key="idle"
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Slideshow background layer */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={SLIDE_IMAGES[currentSlide]}
                      alt="Plant slideshow"
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  </AnimatePresence>
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                </div>

                {/* Neural canvas on top (semi-transparent over slideshow) */}
                <div className="absolute inset-0 opacity-30">
                  <NeuralCanvas size={innerSize} />
                </div>

                {/* Center text overlay */}
                <motion.div
                  className="relative z-10 flex flex-col items-center gap-3 text-center px-8"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(22,163,74,0.15)",
                      border: "1px solid rgba(22,163,74,0.3)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-label="Upload"
                      role="img"
                      className="w-7 h-7"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug drop-shadow-lg">
                    Upload a Leaf Image
                  </p>
                  <p className="text-white/60 text-xs drop-shadow">
                    Click to browse
                  </p>
                </motion.div>

                {/* Dot indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {SLIDE_IMAGES.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(i);
                      }}
                      className="rounded-full transition-all duration-300 focus:outline-none"
                      style={{
                        width: i === currentSlide ? 18 : 6,
                        height: 6,
                        background:
                          i === currentSlide
                            ? "#16A34A"
                            : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* SCANNING */}
            {state === "scanning" && imageUrl && (
              <motion.div
                key="scanning"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <motion.img
                  src={imageUrl}
                  alt="Scanning leaf"
                  className="w-full h-full object-cover rounded-full"
                  animate={{
                    filter: [
                      "blur(3px) brightness(0.7)",
                      "blur(2px) brightness(0.8)",
                      "blur(3px) brightness(0.7)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{ zIndex: 5 }}
                >
                  <motion.div
                    className="absolute inset-x-0 h-1"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(37,99,235,0.8), rgba(22,163,74,0.8), transparent)",
                      boxShadow: "0 0 12px 4px rgba(37,99,235,0.5)",
                    }}
                    animate={{ top: ["-2%", "102%", "-2%"] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                </motion.div>

                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 80%, rgba(37,99,235,0.6) 90%, rgba(22,163,74,0.8) 100%)",
                    zIndex: 6,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />

                <div
                  className="absolute inset-0 flex flex-col items-center justify-end pb-8 z-10"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
                  }}
                >
                  <p className="text-white font-semibold text-sm">
                    Analyzing with CNN...
                  </p>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.22,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {state === "result" && imageUrl && (
              <motion.div
                key="result"
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <img
                  src={imageUrl}
                  alt="Analyzed leaf"
                  className="w-full h-full object-cover rounded-full"
                  style={{ filter: "brightness(0.85)" }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, transparent 45%, rgba(0,0,0,0.55) 100%)",
                  }}
                />

                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, ease: "backOut" }}
                >
                  <div
                    className="rounded-2xl px-4 py-2 text-center"
                    style={{
                      background: "rgba(0,0,0,0.65)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                      {plantType ?? "Plant"}
                    </p>
                    <p className="text-white font-bold text-sm leading-tight mt-0.5">
                      {diseaseName}
                    </p>
                    <p
                      className="text-lg font-bold mt-1"
                      style={{
                        background: "linear-gradient(90deg, #16A34A, #2563EB)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {confidence.toFixed(1)}%
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-5 right-5 z-20"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wide"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(22,163,74,0.9), rgba(37,99,235,0.9))",
                      border: "1px solid rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    AI Powered
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ERROR */}
            {state === "error" && (
              <motion.div
                key="error"
                className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-label="Error"
                    role="img"
                    className="w-7 h-7"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm">
                  Analysis Failed
                </p>
                <p className="text-white/50 text-xs mt-1 leading-snug">
                  {errorMessage ?? "An unexpected error occurred"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Confidence progress ring (result state, rendered outside clip) ── */}
        {state === "result" && ringVisible && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: innerSize + 40,
              height: innerSize + 40,
              left: -20,
              top: -20,
            }}
          >
            <ConfidenceRing confidence={confidence} size={innerSize + 40} />
          </div>
        )}

        {/* ── Idle gradient border ring ── */}
        {state === "idle" && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: innerSize + 6,
              height: innerSize + 6,
              left: -3,
              top: -3,
              padding: 2,
              background: "linear-gradient(135deg, #16A34A, #2563EB, #16A34A)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ background: "rgb(15,23,42)" }}
            />
          </motion.div>
        )}

        {/* ── Scanning double ring ── */}
        {state === "scanning" && (
          <>
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                width: innerSize + 16,
                height: innerSize + 16,
                left: -8,
                top: -8,
                borderColor: "transparent",
                borderTopColor: "rgba(37,99,235,0.8)",
                borderRightColor: "rgba(22,163,74,0.4)",
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                width: innerSize + 28,
                height: innerSize + 28,
                left: -14,
                top: -14,
                borderColor: "transparent",
                borderTopColor: "rgba(22,163,74,0.5)",
                borderLeftColor: "rgba(37,99,235,0.3)",
              }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </>
        )}
      </div>

      {/* ── Confidence label below circle (result state) ── */}
      <AnimatePresence>
        {state === "result" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.9, duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-white/70">Confidence</span>
              <span
                className="font-bold text-sm"
                style={{
                  background: "linear-gradient(90deg, #16A34A, #2563EB)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {confidence.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}
        {state === "scanning" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs text-white/60"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
            CNN processing...
          </motion.div>
        )}
        {state === "idle" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-white/40"
          >
            JPG · PNG · WebP supported
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
