import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Award, Video } from "lucide-react";

const doctors = [
  {
    name: "Dr. Divya Santhosh",
    qual: "BAA, BSMS, MSC PSY",
    role: "Lead Physician & Lifestyle Specialist",
    image: "https://images.unsplash.com/photo-1681311311149-7254102442de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoYXBweSUyMGZhbWlseSUyMGhlYWx0aCUyMHdlbGxuZXNzfGVufDF8fHx8MTc4MDY2NTQ2M3ww&ixlib=rb-4.1.0&q=80&w=400",
    tele: false,
    color: "#1e88e5",
  },
  {
    name: "Dr. Blessy Suveen",
    qual: "BNYS, MA PSY",
    role: "Naturopathy & Psychology Specialist",
    image: "https://images.unsplash.com/photo-1597524678053-5e6fef52d8a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoYXBweSUyMGZhbWlseSUyMGhlYWx0aCUyMHdlbGxuZXNzfGVufDF8fHx8MTc4MDY2NTQ2M3ww&ixlib=rb-4.1.0&q=80&w=400",
    tele: true,
    color: "#8e24aa",
  },
  {
    name: "Dr. Rachel Giri",
    qual: "BHMS",
    role: "Homeopathy & Wellness Consultant",
    image: "https://images.unsplash.com/photo-1776886099265-6366478b341b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx3ZWxsbmVzcyUyMGxpZmVzdHlsZSUyMGhlYWx0aCUyMGNlbnRlciUyMHRoZXJhcHl8ZW58MXx8fHwxNzgwNjY1NDU1fDA&ixlib=rb-4.1.0&q=80&w=400",
    tele: true,
    color: "#43a047",
  },
  {
    name: "Dr. Austin Navis",
    qual: "MBBS",
    role: "General Physician & Wellness Expert",
    image: "https://images.unsplash.com/photo-1776886089968-687a07d9fdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx3ZWxsbmVzcyUyMGxpZmVzdHlsZSUyMGhlYWx0aCUyMGNlbnRlciUyMHRoZXJhcHl8ZW58MXx8fHwxNzgwNjY1NDU1fDA&ixlib=rb-4.1.0&q=80&w=400",
    tele: false,
    color: "#f9a825",
  },
];

export function DoctorsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="doctors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-[#1e88e5]/10 text-[#1e88e5] text-sm font-semibold rounded-full mb-4">
            Our Expert Team
          </span>
          <h2 className="text-[#0a2744] mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            Doctors Dedicated to <span className="text-[#1e88e5]">Your Wellbeing</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Our multidisciplinary team brings together expertise in naturopathy, homeopathy, modern medicine and psychology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {doctors.map((doc, i) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group text-center"
            >
              <div className="relative mx-auto w-44 h-44 mb-5">
                <div
                  className="absolute inset-0 rounded-full transition-transform duration-500 group-hover:scale-105"
                  style={{ background: `${doc.color}20`, border: `3px solid ${doc.color}30` }}
                />
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                />
                {doc.tele && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1e88e5] flex items-center justify-center shadow-md border-2 border-white">
                    <Video size={14} color="white" />
                  </div>
                )}
              </div>
              <h3 className="text-[#0a2744] font-bold text-base">{doc.name}</h3>
              <p className="text-[#1e88e5] text-xs font-semibold mt-0.5 mb-1">{doc.qual}</p>
              <p className="text-gray-500 text-sm">{doc.role}</p>
              {doc.tele && (
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-[#1e88e5]/10 text-[#1e88e5] text-xs font-medium rounded-full">
                  <Video size={10} /> Tele Consultation
                </span>
              )}
              <div className="mt-3">
                <motion.div
                  className="mx-auto h-0.5 w-0 group-hover:w-16 transition-all duration-500 rounded-full"
                  style={{ backgroundColor: doc.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Award strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 bg-[#f4f8ff] rounded-2xl px-8 py-6 flex flex-wrap gap-6 justify-center items-center"
        >
          {[
            "BSMS Qualified",
            "BNYS Certified",
            "BHMS Accredited",
            "MBBS Licensed",
            "MSC Psychology",
            "MA Psychology",
          ].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-[#0a2744]">
              <Award size={16} className="text-[#f9a825]" />
              <span className="text-sm font-semibold">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
