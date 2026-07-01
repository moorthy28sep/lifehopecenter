import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Droplets, Salad, Heart, Stethoscope, Brain, Leaf, Pill, MessageCircle } from "lucide-react";

const programs = [
  {
    icon: Stethoscope,
    title: "Lifestyle Consultation",
    desc: "Comprehensive assessment and personalised lifestyle plans tailored to your unique health needs.",
    image: "https://images.unsplash.com/photo-1776886099265-6366478b341b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx3ZWxsbmVzcyUyMGxpZmVzdHlsZSUyMGhlYWx0aCUyMGNlbnRlciUyMHRoZXJhcHl8ZW58MXx8fHwxNzgwNjY1NDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#1e88e5",
  },
  {
    icon: Heart,
    title: "Therapeutic Massage",
    desc: "Expert massage therapy to relieve stress, improve circulation and restore natural energy flow.",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb3RoZXJhcHklMjBtYXNzYWdlJTIwc3BhJTIwdHJlYXRtZW50fGVufDF8fHx8MTc4MDY2NTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#e53935",
  },
  {
  icon: Leaf,
  title: "Disease Reversal",
  desc: "Proven protocols to reverse Diabetes, Hypertension, Obesity, PCOD and chronic conditions naturally.",
  image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1080&q=80",
  color: "#43a047",
},
  {
    icon: Droplets,
    title: "Hydrotherapy",
    desc: "Therapeutic use of water in various forms to stimulate healing, detox and rejuvenate your body.",
    image: "https://images.unsplash.com/photo-1643685276743-1b52832c58d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoeWRyb3RoZXJhcHklMjBtYXNzYWdlJTIwc3BhJTIwdHJlYXRtZW50fGVufDF8fHx8MTc4MDY2NTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#039be5",
  },
  {
    icon: Salad,
    title: "Healthy Diet & Nutrition",
    desc: "Science-backed nutrition plans and healthy eating habits for sustainable wellness and vitality.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZGlldCUyMG5hdHVyYWwlMjBmb29kJTIwbnV0cml0aW9ufGVufDF8fHx8MTc4MDY2NTQ2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#fb8c00",
  },
  {
    icon: Brain,
    title: "Counselling",
    desc: "Professional psychological support and counselling to promote mental wellness and emotional balance.",
     image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1080&q=80",
    color: "#8e24aa",
  },
  {
    icon: Pill,
    title: "Natural Remedies",
    desc: "Time-tested herbal and natural remedies harnessing the power of nature for safe, effective healing.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwZGlldCUyMG5hdHVyYWwlMjBmb29kJTIwbnV0cml0aW9ufGVufDF8fHx8MTc4MDY2NTQ2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#00897b",
  },
  {
    icon: MessageCircle,
    title: "Tele Consultation",
    desc: "Connect with our expert doctors remotely for convenient, accessible healthcare from anywhere.",
    image: "https://images.unsplash.com/photo-1775133263714-848c8fe09e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxoeWRyb3RoZXJhcHklMjBtYXNzYWdlJTIwc3BhJTIwdHJlYXRtZW50fGVufDF8fHx8MTc4MDY2NTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "#1e88e5",
  },
];

function ProgramCard({ program, index }: { program: typeof programs[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = program.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-400 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <motion.img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2744]/70 to-transparent" />
        {/* Icon badge */}
        <div
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: program.color }}
        >
          <Icon size={18} color="white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="font-bold text-lg mb-2 group-hover:transition-colors duration-200"
          style={{ color: "#0a2744" }}
        >
          {program.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{program.desc}</p>
        <div className="mt-4 flex items-center gap-1.5" style={{ color: program.color }}>
          <span className="text-sm font-semibold">Learn More</span>
          <motion.span
            className="inline-block"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >→</motion.span>
        </div>
      </div>

      {/* Bottom color bar */}
      <div
        className="h-1 w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: program.color }}
      />
    </motion.div>
  );
}

export function WellnessPrograms() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="wellness" className="py-20 bg-[#f4f8ff]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-[#1e88e5]/10 text-[#1e88e5] text-sm font-semibold rounded-full mb-4 tracking-wide">
            Our Wellness Programs
          </span>
          <h2 className="text-[#0a2744] mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800 }}>
            Comprehensive Care for Your
            <span className="text-[#1e88e5]"> Total Wellness</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            From therapeutic treatments to lifestyle transformation — we offer a complete spectrum of natural healing services guided by expert doctors.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program, i) => (
            <ProgramCard key={program.title} program={program} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-[#0a2744] hover:bg-[#1565c0] text-white font-bold rounded-full transition-colors duration-300 shadow-lg"
          >
            Start Your Wellness Journey
          </a>
        </motion.div>
      </div>
    </section>
  );
}
