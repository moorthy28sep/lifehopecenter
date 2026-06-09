import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";

export function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-[#1e88e5]/10 text-[#1e88e5] text-sm font-semibold rounded-full mb-4">
            Get in Touch
          </span>
          <h2 className="text-[#0a2744] mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            Begin Your <span className="text-[#1e88e5]">Healing Journey</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Reach out to us to book a consultation or learn more about our wellness programs. We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {[
              {
                icon: Phone,
                title: "Call / WhatsApp",
                value: "892139004",
                sub: "Available Sun–Thu, 9 AM–5:30 PM",
                href: "tel:892139004",
                color: "#1e88e5",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Chat",
                value: "Chat with us on WhatsApp",
                sub: "Quick response guaranteed",
                href: "https://wa.me/892139004",
                color: "#43a047",
              },
              {
                icon: MapPin,
                title: "Our Address",
                value: "SDA Campus, Near Ponnara School",
                sub: "PS Nagar, Vallakkadu, Thiruvananthapuram, Kerala – 695008",
                href: "#",
                color: "#e53935",
              },
              {
                icon: Clock,
                title: "Working Hours",
                value: "Sunday – Thursday",
                sub: "9:00 AM – 5:30 PM | Friday & Saturday: Closed",
                href: "#",
                color: "#f9a825",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#1e88e5]/30 hover:shadow-md transition-all duration-300 group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-[#0a2744] font-bold text-sm uppercase tracking-wide mb-0.5">{item.title}</p>
                    <p className="text-[#0a2744] font-semibold">{item.value}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{item.sub}</p>
                  </div>
                </a>
              );
            })}

            {/* Map embed placeholder */}
            <div className="rounded-2xl overflow-hidden h-48 bg-[#f4f8ff] border border-gray-100 relative">
              <iframe
                title="Life Hope Center Location"
                src="https://maps.google.com/maps?q=SDA+Campus+Vallakkadu+Thiruvananthapuram+Kerala&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#f4f8ff] rounded-3xl p-8"
          >
            <h3 className="text-[#0a2744] font-bold text-xl mb-6">Book a Consultation</h3>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#43a047] flex items-center justify-center">
                  <Send size={28} color="white" />
                </div>
                <p className="text-[#0a2744] font-bold text-lg">Request Received!</p>
                <p className="text-gray-500 text-sm">We'll contact you shortly to confirm your appointment.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#0a2744] text-sm font-semibold mb-1.5">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0a2744] text-sm focus:outline-none focus:border-[#1e88e5] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0a2744] text-sm font-semibold mb-1.5">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0a2744] text-sm focus:outline-none focus:border-[#1e88e5] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0a2744] text-sm font-semibold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0a2744] text-sm focus:outline-none focus:border-[#1e88e5] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#0a2744] text-sm font-semibold mb-1.5">Preferred Service</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0a2744] text-sm focus:outline-none focus:border-[#1e88e5] transition-colors">
                    <option value="">Select a service</option>
                    <option>Lifestyle Consultation</option>
                    <option>Therapeutic Massage</option>
                    <option>Disease Reversal Program</option>
                    <option>Hydrotherapy</option>
                    <option>Healthy Diet & Nutrition</option>
                    <option>Counselling</option>
                    <option>Tele Consultation</option>
                    <option>Natural Remedies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0a2744] text-sm font-semibold mb-1.5">Your Health Concern</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your health concern..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0a2744] text-sm focus:outline-none focus:border-[#1e88e5] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1e88e5] hover:bg-[#1565c0] text-white font-bold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 shadow-md"
                >
                  <Send size={16} />
                  Send Request
                </button>
                <p className="text-gray-400 text-xs text-center">
                  We respect your privacy. Your information is safe with us.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
