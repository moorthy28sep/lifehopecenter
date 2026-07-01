import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, CalendarDays, HeartPulse, Leaf, Sparkles, Stethoscope, Users, Wind } from "lucide-react";
import { toast } from "sonner";

type ServiceItem = {
  title: string;
  description: string;
  icon: typeof Stethoscope;
};

const services: ServiceItem[] = [
  {
    title: "Tele-consultation",
    description:
      "Consult with experts from different medical backgrounds and specialties from across the country to understand the root cause of your concerns.",
    icon: Stethoscope,
  },
  {
    title: "Personalized Diet Plan",
    description:
      "Get a customized diet plan tailored to your unique condition, helping your body and mind heal through the right nutrition.",
    icon: Leaf,
  },
  {
    title: "Coaching Program",
    description:
      "Build lasting transformation with accountability-based coaching that supports sustainable habits, emotional resilience, and better health.",
    icon: Users,
  },
  {
    title: "3 Months Disease Reversal Program",
    description:
      "A comprehensive program covering mental wellbeing, sustainable habits, natural healing, and personalized treatment protocols for lifestyle diseases.",
    icon: HeartPulse,
  },
  {
    title: "1 Month Short Lifestyle Program",
    description:
      "Kickstart your healing journey with a focused one-month plan that combines diet guidance, health education, and coaching for momentum.",
    icon: Sparkles,
  },
  {
    title: "10 Days Live In Program",
    description:
      "Stay at our wellness centre for guided rejuvenation, personalized nutrition, natural therapies, and deeply restorative care.",
    icon: CalendarDays,
  },
  {
    title: "Natural Remedies",
    description:
      "Explore natural treatments such as massage, hydrotherapy, healing herbs, and restorative therapies that support lasting wellness.",
    icon: Wind,
  },
];

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  selectedService: services[0].title,
  notes: "",
};

export function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://lifehopewellness.com/api/create-checkout-session.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.fullName,
          email: formState.email,
          phone: formState.phone,
          selectedService: formState.selectedService,
          notes: formState.notes,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error(result.message || "Unable to start your consultation booking.");
      }

      window.location.href = result.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start your booking right now.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="services" className="overflow-x-hidden bg-[#f7fbff] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[#1e88e5]/10 px-4 py-1.5 text-sm font-semibold text-[#1e88e5]">
            Our Services
          </span>
          <h2 className="mb-4 text-[#0a2744]" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            Guided wellness paths for <span className="text-[#1e88e5]">real transformation</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Choose a service that fits your wellness journey. Each plan is designed to support healing, lasting habits, and sustainable recovery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e88e5]/10 text-[#1e88e5]">
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#0a2744]">{service.title}</h3>
                  <p className="mb-5 text-sm leading-6 text-gray-600">{service.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, selectedService: service.title }));
                      document.getElementById("services-booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center gap-2 font-semibold text-[#1e88e5] transition hover:text-[#1565c0]"
                  >
                    Book Consultation <ArrowRight size={16} />
                  </button>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            id="services-booking-form"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-[28px] border border-[#1e88e5]/10 bg-gradient-to-br from-[#0a2744] to-[#1e88e5] p-8 text-white shadow-xl"
          >
            <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
              Consultation Booking
            </div>
            <h3 className="mb-2 text-2xl font-bold">Reserve your consultation</h3>
            <p className="mb-6 text-sm leading-6 text-blue-50">
              Pay a one-time consultation fee of ₹1,000 to confirm your booking. Your details will be stored securely for follow-up.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Selected Service</label>
                <select
                  required
                  name="selectedService"
                  value={formState.selectedService}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-800 outline-none"
                >
                  {services.map((service) => (
                    <option key={service.title} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Notes</label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formState.notes}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Tell us about your health goals or concerns"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0a2744] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Preparing payment..." : "Pay ₹1,000 and continue"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
