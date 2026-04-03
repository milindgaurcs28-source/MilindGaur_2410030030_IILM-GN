import { ArrowRight, ShieldCheck, Sparkles, Upload, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  onUploadClick: () => void;
}

const STAT_ITEMS = [
  { icon: ShieldCheck, value: "97.8%", label: "ResNet Accuracy" },
  { icon: Zap, value: "27ms", label: "MobileNet Inference" },
  { icon: Sparkles, value: "38+", label: "Disease Classes" },
];

const SLIDES = [
  {
    src: "/assets/generated/hero-plant-scan.dim_600x480.png",
    label: "Plant Scan",
  },
  {
    src: "/assets/generated/slide-tomato-leaf.dim_600x600.png",
    label: "Tomato Leaf",
  },
  {
    src: "/assets/generated/slide-strawberry.dim_600x600.png",
    label: "Strawberry",
  },
  { src: "/assets/generated/slide-grape.dim_600x600.png", label: "Grape" },
  { src: "/assets/generated/slide-corn.dim_600x600.png", label: "Corn" },
  { src: "/assets/generated/slide-apple.dim_600x600.png", label: "Apple" },
  { src: "/assets/generated/slide-potato.dim_600x600.png", label: "Potato" },
  { src: "/assets/generated/slide-orange.dim_600x600.png", label: "Orange" },
  {
    src: "/assets/generated/slide-cherry-tomato.dim_600x600.png",
    label: "Cherry Tomato",
  },
  { src: "/assets/generated/slide-mango.dim_600x600.png", label: "Mango" },
];

export default function HeroSection({ onUploadClick }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="pv-gradient-hero pv-mesh pt-[68px] overflow-hidden"
      aria-label="Hero"
      style={{ minHeight: "520px" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-10">
        {/* Left copy */}
        <motion.div
          className="flex-1 text-white z-10"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-xs font-medium text-emerald-200">
              PlantVillage Dataset · CNN Comparison Study
            </span>
          </div>

          <h1 className="font-display text-4xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight">
            Detect Plant Disease{" "}
            <span className="text-emerald-300">with AI</span>
          </h1>

          <p className="text-white/75 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
            Compare GoogleNet (Inception), ResNet-50, and MobileNet CNN
            architectures for automated plant disease identification from leaf
            images.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              onClick={onUploadClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-colors"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.74 0.14 54), oklch(0.68 0.15 51))",
                boxShadow: "0 4px 20px oklch(0.74 0.14 54 / 0.35)",
              }}
              data-ocid="hero.primary_button"
            >
              <Upload className="w-4 h-4" />
              Upload Leaf Image
            </motion.button>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <ArrowRight className="w-4 h-4" />
              <span>Drag &amp; drop supported · JPG, PNG, WebP</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-10 pt-8 border-t border-white/15">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
              Benchmark Results
            </p>
            <div className="flex flex-wrap gap-4">
              {STAT_ITEMS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-3 border border-white/15"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-none">
                      {value}
                    </p>
                    <p className="text-white/55 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right illustration — slideshow */}
        <motion.div
          className="relative flex-shrink-0"
          initial={{ opacity: 0, scale: 0.92, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <div
            className="pv-spotlight absolute inset-0 rounded-full"
            style={{ width: "340px", height: "340px" }}
          />

          {/* Circle container */}
          <div
            className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 border-white/20"
            style={{ boxShadow: "0 0 60px oklch(0.90 0.06 161 / 0.15)" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={SLIDES[current].label}
                src={SLIDES[current].src}
                alt={SLIDES[current].label}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>
            {/* Scan animation overlay */}
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-scan-line z-10" />
          </div>

          {/* Dot indicators */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {SLIDES.map((slide, i) => (
              <button
                type="button"
                key={slide.label}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-emerald-400 w-4" : "bg-white/30 w-1.5"
                }`}
                aria-label={`Go to slide ${slide.label}`}
              />
            ))}
          </div>

          {/* Floating accuracy badge */}
          <motion.div
            className="absolute -bottom-2 -left-4 bg-white rounded-xl px-3 py-2 shadow-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">ResNet-50 Accuracy</p>
            <p className="text-lg font-bold text-pv-green">97.8%</p>
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-4 bg-white rounded-xl px-3 py-2 shadow-card"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-muted-foreground">Models</p>
            <p className="text-lg font-bold text-pv-green">3 CNN</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
