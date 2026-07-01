import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
   {
  image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
  heading: "Pathway to Healthy Life",
  sub: "Experience holistic wellness through natural therapies, lifestyle transformation and expert medical guidance.",
  tag: "Natural • Safe • Effective",
},
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    heading: "Reverse Disease Naturally",
    sub: "Overcome Diabetes, Hypertension, Obesity, PCOD and more through our evidence-based lifestyle programs.",
    tag: "Disease Reversal Programs",
  },
  {
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb3RoZXJhcHklMjBtYXNzYWdlJTIwc3BhJTIwdHJlYXRtZW50fGVufDF8fHx8MTc4MDY2NTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    heading: "Therapeutic Healing",
    sub: "From hydrotherapy to therapeutic massage, we offer a comprehensive range of natural healing treatments.",
    tag: "Holistic Therapies",
  },
  {
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZGlldCUyMG5hdHVyYWwlMjBmb29kJTIwbnV0cml0aW9ufGVufDF8fHx8MTc4MDY2NTQ2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    heading: "Nourish from Within",
    sub: "Personalised nutrition plans and healthy diet guidance to fuel your body's natural healing process.",
    tag: "Nutrition & Healthy Diet",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const go = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section id="home" className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          {/* Background image with Ken Burns zoom */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2744]/85 via-[#0a2744]/60 to-[#0a2744]/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="max-w-2xl"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block px-4 py-1.5 bg-[#1e88e5] text-white text-sm font-semibold rounded-full mb-5 tracking-wide"
              >
                {slides[current].tag}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-white mb-5 leading-tight"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800 }}
              >
                {slides[current].heading}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-white/85 text-lg mb-8 max-w-xl"
              >
                {slides[current].sub}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="#contact"
                  className="px-7 py-3.5 bg-[#1e88e5] hover:bg-[#1565c0] text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  Book Consultation
                </a>
                
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-400 rounded-full ${
              i === current ? "w-8 h-3 bg-[#1e88e5]" : "w-3 h-3 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-1 text-white/60 text-xs"
      >
        <div className="w-px h-10 bg-white/40" />
        <span>Scroll</span>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1 }}
        className="absolute bottom-0 left-0 right-0 z-10 bg-[#0a2744]/90 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
          {[
            { num: "5+", label: "Centers Across India" },
            { num: "10K+", label: "Lives Transformed" },
            { num: "15+", label: "Wellness Services" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-[#4db6e8] font-black text-2xl">{stat.num}</span>
              <span className="text-white/70 text-xs font-medium mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
