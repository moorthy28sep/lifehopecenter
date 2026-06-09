import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MapPin, Clock } from "lucide-react";

const centers = [
  { city: "Thiruvananthapuram", state: "Kerala (HQ)", desc: "SDA Campus, Near Ponnara School, PS Nagar, Vallakkadu", isHQ: true },
  { city: "Patna", state: "Bihar", desc: "Lifestyle & Wellness Center", isHQ: false },
  { city: "Jaipur", state: "Rajasthan", desc: "Lifestyle & Wellness Center", isHQ: false },
  { city: "Varanasi", state: "Uttar Pradesh", desc: "Lifestyle & Wellness Center", isHQ: false },
  { city: "Kolkata", state: "West Bengal", desc: "Lifestyle & Wellness Center", isHQ: false },
  { city: "Asansol", state: "West Bengal", desc: "Lifestyle & Wellness Center", isHQ: false },
];

export function CentersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="centers" className="py-20 bg-[#f4f8ff]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-[#1e88e5]/10 text-[#1e88e5] text-sm font-semibold rounded-full mb-4">
            Our Centers
          </span>
          <h2 className="text-[#0a2744] mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            Find Us <span className="text-[#1e88e5]">Across India</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            With centers spanning multiple states, quality holistic healthcare is never far away.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center, i) => (
            <motion.div
              key={center.city}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg group cursor-pointer ${
                center.isHQ
                  ? "bg-[#0a2744] text-white border-[#1e88e5]"
                  : "bg-white border-gray-100 hover:border-[#1e88e5]/30"
              }`}
            >
              {center.isHQ && (
                <span className="absolute top-4 right-4 text-xs bg-[#1e88e5] text-white px-2.5 py-1 rounded-full font-semibold">
                  Headquarters
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                  center.isHQ ? "bg-[#1e88e5]" : "bg-[#1e88e5]/10 group-hover:bg-[#1e88e5] transition-colors"
                }`}
              >
                <MapPin size={18} className={center.isHQ ? "text-white" : "text-[#1e88e5] group-hover:text-white"} />
              </div>
              <h3 className={`font-bold text-lg ${center.isHQ ? "text-white" : "text-[#0a2744]"}`}>
                {center.city}
              </h3>
              <p className={`text-sm font-semibold mb-2 ${center.isHQ ? "text-[#4db6e8]" : "text-[#1e88e5]"}`}>
                {center.state}
              </p>
              <p className={`text-sm ${center.isHQ ? "text-white/70" : "text-gray-500"}`}>
                {center.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Timings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 bg-[#0a2744] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-6 justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e88e5] flex items-center justify-center flex-shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-white/60 text-sm uppercase tracking-wider font-semibold">Opening Hours</p>
              <p className="text-white font-bold text-lg">Sunday – Thursday: 9:00 AM – 5:30 PM</p>
              <p className="text-[#4db6e8] text-sm font-medium">Friday & Saturday: Closed</p>
            </div>
          </div>
          <a
            href="tel:892139004"
            className="px-6 py-3 bg-[#1e88e5] hover:bg-[#1565c0] text-white font-bold rounded-full transition-colors duration-300 text-sm whitespace-nowrap"
          >
            📞 Call: 892139004
          </a>
        </motion.div>
      </div>
    </section>
  );
}
