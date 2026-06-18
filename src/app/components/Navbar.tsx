import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import LogoComponent from "./LogoComponent";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Wellness Programs", href: "#wellness" },
  { label: "Our Doctors", href: "#doctors" },
  { label: "Centers", href: "#centers" },
  { label: "Contact", href: "#contact" },
  //{ label: "Admin", href: "/admin" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a2744] text-white text-sm py-1.5 px-6 flex justify-between items-center">
        <span className="opacity-80">Lifestyle & Wellness | Pathway to Healthy Life</span>
        <a href="tel:+91-892139004" className="flex items-center gap-1.5 font-semibold hover:text-[#4db6e8] transition-colors">
          <Phone size={14} /> +91-892139004
        </a>
      </div>

      {/* Main navbar */}
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-[30px] left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-md shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              {/* Sun/star logo recreation */}
              <LogoComponent />
            </div>
            <div>
              <div className="leading-tight">
                <span className="text-[#0a2744] font-black text-lg tracking-wide">Life</span>
                <span className="text-[#1e88e5] font-black text-lg tracking-wide"> Hope</span>
              </div>
              <div className="text-[#0a2744] text-xs font-semibold tracking-widest uppercase -mt-0.5">Wellness</div>
             {/* <div className="text-[#888] text-[9px] tracking-wider">Thiruvananthapuram</div> */}
            </div>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="px-3 py-2 text-sm font-semibold text-[#0a2744] hover:text-[#1e88e5] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1e88e5] group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="ml-3 px-4 py-2 bg-[#1e88e5] text-white text-sm font-bold rounded-full hover:bg-[#1565c0] transition-colors shadow-md"
              >
                Book Now
              </a>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-[#0a2744] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <ul className="px-6 py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="block text-sm font-semibold text-[#0a2744] hover:text-[#1e88e5] py-1 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="tel:+91-892139004"
                    className="inline-block px-5 py-2 bg-[#1e88e5] text-white text-sm font-bold rounded-full hover:bg-[#1565c0] transition-colors"
                  >
                    Book Now
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
