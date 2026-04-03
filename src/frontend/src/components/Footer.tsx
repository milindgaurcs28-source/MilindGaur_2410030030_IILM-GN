import { ExternalLink, Github, Heart, Leaf } from "lucide-react";

const FOOTER_LINKS = [
  { label: "About", href: "#" },
  { label: "Research Papers", href: "https://arxiv.org/abs/1604.00772" },
  { label: "PlantVillage Dataset", href: "https://plantvillage.psu.edu/" },
  { label: "Contact Us", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="pv-gradient" data-ocid="footer.panel">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center mt-0.5">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-base">
                PlantVision CNN
              </p>
              <p className="text-white/55 text-xs mt-0.5 max-w-xs">
                Deep CNN research platform for automated plant disease detection
                using the PlantVillage dataset.
              </p>
            </div>
          </div>

          {/* Links */}
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
                data-ocid="footer.link"
              >
                {link.label}
                {link.href.startsWith("http") && (
                  <ExternalLink className="w-3 h-3" />
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Github className="w-3.5 h-3.5" />
            <span>
              CNN architectures: GoogleNet (Inception) · ResNet-50 · MobileNet
            </span>
          </div>
          <p className="text-white/50 text-xs flex items-center gap-1">
            © {year}. Built with{" "}
            <Heart className="w-3 h-3 text-red-400 fill-red-400 mx-0.5" /> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-emerald-200 transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
