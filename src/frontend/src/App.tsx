import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import DetectionPanel from "./components/DetectionPanel";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HistoryPanel from "./components/HistoryPanel";
import HowItWorks from "./components/HowItWorks";
import KnowledgeBase from "./components/KnowledgeBase";
import ModelComparison from "./components/ModelComparison";
import Navigation from "./components/Navigation";

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const detectRef = useRef<HTMLElement>(null);
  const modelRef = useRef<HTMLElement>(null);
  const knowledgeRef = useRef<HTMLElement>(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("pv-dark") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("pv-dark", String(darkMode));
  }, [darkMode]);

  const scrollToSection = (
    section: "hero" | "detect" | "models" | "knowledge",
  ) => {
    const refs = {
      hero: heroRef,
      detect: detectRef,
      models: modelRef,
      knowledge: knowledgeRef,
    };
    refs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation
        onNavigate={scrollToSection}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <section ref={heroRef} id="hero">
        <HeroSection onUploadClick={() => scrollToSection("detect")} />
      </section>

      <main className="flex-1">
        {/* How It Works */}
        <HowItWorks />

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Detection */}
        <section ref={detectRef} id="detect" className="py-16 lg:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary/70 mb-2">
                AI-Powered Analysis
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Disease Detection
              </h2>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Upload a leaf image or use the webcam to run multi-model CNN
                analysis across GoogleNet, ResNet-50, and MobileNet.
              </p>
            </div>
            <DetectionPanel />
          </div>
        </section>

        {/* Detection History */}
        <HistoryPanel />

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <section
          ref={modelRef}
          id="model-comparison"
          className="py-16 lg:py-24 px-4 bg-pv-surface"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary/70 mb-2">
                Benchmark Results
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Model Performance
              </h2>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Comparative analysis of accuracy, inference speed, and parameter
                efficiency across CNN architectures.
              </p>
            </div>
            <ModelComparison />
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <section
          ref={knowledgeRef}
          id="knowledge"
          className="py-16 lg:py-24 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary/70 mb-2">
                Reference Database
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Plant Disease Library
              </h2>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Evidence-based disease profiles with symptoms, treatment
                protocols, and prevention strategies.
              </p>
            </div>
            <KnowledgeBase />
          </div>
        </section>
      </main>

      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
