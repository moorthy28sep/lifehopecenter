import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle } from "lucide-react";

const conditions = ["Diabetes", "Hypertension", "Obesity", "PCOD", "Thyroid Disorders", "Anxiety & Stress", "Digestive Issues", "Joint Problems"];

export function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left - Image collage */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-56 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1588979355313-6711a095465f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMGhlYWx0aCUyMHdlbGxuZXNzfGVufDF8fHx8MTc4MDY2NTQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Happy family wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden h-36 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoZWFsdGh5JTIwZGlldCUyMG5hdHVyYWwlMjBmb29kJTIwbnV0cml0aW9ufGVufDF8fHx8MTc4MDY2NTQ2Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Healthy food"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden h-36 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80"
                    alt="Yoga wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden h-56 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80"
                    alt="Nature healing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#1e88e5] text-white rounded-2xl px-6 py-3 shadow-xl text-center"
            >
              <div className="font-black text-2xl">Natural</div>
              <div className="text-xs font-semibold opacity-90 tracking-wider">SAFE & EFFECTIVE</div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#1e88e5]/10 text-[#1e88e5] text-sm font-semibold rounded-full mb-4">
              About Life Hope Wellness
            </span>
            <h2 className="text-[#0a2744] mb-5" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800 }}>
              A Holistic Approach to<br />
              <span className="text-[#1e88e5]">Health & Healing</span>
            </h2>
            <p className="text-gray-500 mb-6 text-base leading-relaxed">
              Life Hope Wellness is a premier lifestyle and wellness program with centres in different parts of India. We combine modern medical expertise with time-tested natural therapies to help you achieve lasting health transformation.
            </p>
            <p className="text-gray-500 mb-8 text-base leading-relaxed">
              Our multidisciplinary team of expert doctors and therapists work together to create personalised programs that address the root causes of illness — not just the symptoms.
            </p>

            <div className="mb-8">
              <p className="text-[#0a2744] font-bold mb-3 text-sm uppercase tracking-wider">Conditions We Treat</p>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={16} className="text-[#1e88e5] flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{c}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="#services"
                className="px-6 py-3 bg-[#1e88e5] hover:bg-[#1565c0] text-white font-bold rounded-full transition-colors duration-300 shadow-md"
              >
                Explore Services
              </a>
              <a href="#doctors" className="text-[#1e88e5] font-semibold hover:underline text-sm">
                Meet Our Doctors →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
