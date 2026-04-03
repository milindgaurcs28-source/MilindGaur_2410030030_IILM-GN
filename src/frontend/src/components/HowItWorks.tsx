import { CheckCircle2, Cpu, Upload } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Leaf Image",
    description:
      "Take a photo or upload an existing image of a plant leaf using any of our three input methods: file upload, live webcam, or PlantVillage samples.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description:
      "Our CNN models (GoogleNet, ResNet, MobileNet) analyze the image across multiple architectures for cross-validated, high-confidence results.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Get Results",
    description:
      "Receive a detailed report with disease identification, confidence scores, severity assessment, and evidence-based treatment recommendations.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 px-4 bg-pv-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary/70 mb-2">
            Simple Process
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-3 text-base max-w-2xl mx-auto">
            Detect plant diseases in three simple steps using our CNN-powered
            system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group bg-card rounded-2xl border border-border shadow-card p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                data-ocid={`how_it_works.item.${i + 1}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
