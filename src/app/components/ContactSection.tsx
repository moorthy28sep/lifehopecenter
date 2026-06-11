import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";

const initialFormState = {
  name: "",
  phone: "",
  email: "",
  preferredService: "",
  healthConcern: "",
};

export function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);
  const apiBaseUrl = (((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL || "") as string).replace(/\/$/, "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState(initialFormState);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to send request");
      }

      setFormState(initialFormState);
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="overflow-x-hidden bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[#1e88e5]/10 px-4 py-1.5 text-sm font-semibold text-[#1e88e5]">
            Get in Touch
          </span>
          <h2 className="mb-4 text-[#0a2744]" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            Begin Your <span className="text-[#1e88e5]">Healing Journey</span>
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">
            Reach out to us to book a consultation or learn more about our wellness programs. We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
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
                value: "+91892139004",
                sub: "Available Sun–Thu, 9 AM–5:30 PM",
                href: "tel:+91892139004",
                color: "#1e88e5",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Chat",
                value: "Chat with us on WhatsApp",
                sub: "Quick response guaranteed",
                href: "https://wa.me/+91892139004",
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
                  className="group flex items-start gap-4 rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:border-[#1e88e5]/30 hover:shadow-md"
                >
                  <div
                    className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="mb-0.5 text-sm font-bold uppercase tracking-wide text-[#0a2744]">{item.title}</p>
                    <p className="font-semibold text-[#0a2744]">{item.value}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{item.sub}</p>
                  </div>
                </a>
              );
            })}

            {/* Map embed placeholder */}
            <div className="relative h-48 overflow-hidden rounded-2xl border border-gray-100 bg-[#f4f8ff]">
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
            className="rounded-3xl bg-[#f4f8ff] p-8"
          >
            <h3 className="mb-6 text-xl font-bold text-[#0a2744]">Book a Consultation</h3>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-12 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#43a047]">
                  <Send size={28} color="white" />
                </div>
                <p className="text-lg font-bold text-[#0a2744]">Request Received!</p>
                <p className="text-sm text-gray-500">
                  Your request is now stored in the admin dashboard for follow-up.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#0a2744]">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0a2744] transition-colors focus:border-[#1e88e5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#0a2744]">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0a2744] transition-colors focus:border-[#1e88e5] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0a2744]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0a2744] transition-colors focus:border-[#1e88e5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0a2744]">Preferred Service</label>
                  <select
                    name="preferredService"
                    value={formState.preferredService}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0a2744] transition-colors focus:border-[#1e88e5] focus:outline-none"
                  >
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
                  <label className="mb-1.5 block text-sm font-semibold text-[#0a2744]">Your Health Concern</label>
                  <textarea
                    rows={3}
                    name="healthConcern"
                    value={formState.healthConcern}
                    onChange={handleChange}
                    placeholder="Briefly describe your health concern..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0a2744] transition-colors focus:border-[#1e88e5] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e88e5] px-4 py-3.5 font-bold text-white shadow-md transition-colors duration-300 hover:bg-[#1565c0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send size={16} />
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
                {errorMessage ? <p className="text-center text-sm text-red-600">{errorMessage}</p> : null}
                <p className="text-center text-xs text-gray-400">
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
