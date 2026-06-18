import { Phone, MapPin, Clock, Heart } from "lucide-react";
import LogoComponent from "./LogoComponent";

const services = [
  "Lifestyle Consultation", "Therapeutic Massage", "Disease Reversal",
  "Natural Remedies", "Healthy Diet", "Hydrotherapy", "Counselling", "Tele Consultation",
];

export function Footer() {
  return (
    <footer className="bg-[#0a2744] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0">
                <LogoComponent />
              </div>
              <div>
                <div>
                  <span className="text-white font-black text-base">Life</span>
                  <span className="text-[#4db6e8] font-black text-base"> Hope</span>
                </div>
                <div className="text-white/60 text-xs font-semibold tracking-widest">WELLNESS</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Lifestyle & Wellness | Pathway to Healthy Life. Natural, Safe & Effective healthcare for the whole family.
            </p>
            <div className="flex gap-3">
              {["fb", "wa", "ig", "yt"].map((s) => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1e88e5] flex items-center justify-center cursor-pointer transition-colors text-xs font-bold">
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a href="#wellness" className="text-white/60 text-sm hover:text-[#4db6e8] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#1e88e5] flex-shrink-0" />
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Centers */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Our Centers</h4>
            <ul className="space-y-2.5">
              {["Thiruvananthapuram", "Patna", "Jaipur", "Varanasi", "Kolkata", "Asansol"].map((city) => (
                <li key={city}>
                  <a href="#centers" className="text-white/60 text-sm hover:text-[#4db6e8] transition-colors flex items-center gap-2">
                    <MapPin size={12} className="text-[#1e88e5] flex-shrink-0" />
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#1e88e5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-0.5">Phone / WhatsApp</p>
                  <a href="tel:+91-892139004" className="text-white font-semibold hover:text-[#4db6e8] transition-colors">
                    +91-892139004
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#1e88e5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-0.5">Address</p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    SDA Campus, Near Ponnara School,<br />
                    PS Nagar, Vallakkadu,<br />
                    Thiruvananthapuram, Kerala – 695008
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#1e88e5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-0.5">Hours</p>
                  <p className="text-white/70 text-sm">Sun–Thu: 9:00 AM – 5:30 PM</p>
                  <p className="text-[#4db6e8] text-xs">Fri & Sat: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-sm">© 2026 Life Hope Wellness. All rights reserved.</p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            Made with <Heart size={12} className="text-[#e53935]" /> for your wellness
          </p>
        </div>
      </div>
    </footer>
  );
}
