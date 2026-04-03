import { Leaf, Menu, Moon, Sun, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface NavigationProps {
  onNavigate: (section: "hero" | "detect" | "models" | "knowledge") => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const NAV_LINKS: {
  label: string;
  section: "hero" | "detect" | "models" | "knowledge";
}[] = [
  { label: "Dashboard", section: "hero" },
  { label: "Detect Disease", section: "detect" },
  { label: "Knowledge Base", section: "knowledge" },
  { label: "Model Comparison", section: "models" },
];

export default function Navigation({
  onNavigate,
  darkMode,
  onToggleDark,
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-lg backdrop-blur-md bg-[oklch(0.28_0.12_148/0.95)]"
          : "pv-gradient"
      }`}
      style={{ height: "68px" }}
      data-ocid="nav.panel"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onNavigate("hero")}
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
          aria-label="PlantVision CNN home"
        >
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-display font-bold text-lg tracking-tight">
            PlantVision<span className="text-emerald-300"> CNN</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.section}
              type="button"
              onClick={() => onNavigate(link.section)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/85 hover:text-white hover:bg-white/15 transition-all"
              data-ocid={`nav.${link.section}.link`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA button + dark mode toggle + mobile toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("detect")}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors border border-white/20"
            data-ocid="nav.detect.primary_button"
          >
            <Upload className="w-3.5 h-3.5" />
            Analyze Leaf
          </button>
          <button
            type="button"
            onClick={onToggleDark}
            className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            data-ocid="nav.toggle"
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            className="md:hidden text-white/85 hover:text-white transition-colors p-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden pv-gradient border-t border-white/10 px-4 pb-4"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.section}
                type="button"
                onClick={() => {
                  onNavigate(link.section);
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 text-white/85 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                data-ocid={`nav.${link.section}.link`}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onToggleDark();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-white/85 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
              data-ocid="nav.darkmode.toggle"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
