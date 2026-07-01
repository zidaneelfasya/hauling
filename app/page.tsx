"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import PixelFooter from "@/components/pixel-footer";
import {
  Truck,
  ArrowRight,
  ChevronRight,
  Shield,
  Layers,
  Scale,
  Database,
  Cpu,
  BatteryCharging,
  Globe,
  MapPin,
  Menu,
  X,
  LayoutDashboard,
  Gauge,
  TrendingUp,
  Clock,
  Wrench,
  ChevronLeft
} from "lucide-react";

// Client-side Counter component using requestAnimationFrame for butter-smooth animation
function Counter({ end, duration = 1500, suffix = "", prefix = "" }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasAnimated, end, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [activeFleet, setActiveFleet] = useState<"volvo" | "scania">("volvo");

  // Fleet Rent Calculator State
  const [months, setMonths] = useState(12);

  // Reveal Animation Scroll State
  const [isMobile, setIsMobile] = useState(false);
  const revealContainerRef = useRef<HTMLDivElement>(null);

  // Check user auth state client-side
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScrollProgress = () => {
      if (revealContainerRef.current) {
        const rect = revealContainerRef.current.getBoundingClientRect();
        const elementHeight = revealContainerRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        const scrollTrackHeight = elementHeight - windowHeight;
        if (scrollTrackHeight > 0) {
          const scrolledAmount = -rect.top;
          const progress = Math.max(0, Math.min(1, scrolledAmount / scrollTrackHeight));
          revealContainerRef.current.style.setProperty("--reveal-progress", progress.toFixed(4));
        }
      }
    };

    checkMobile();
    handleScrollProgress();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScrollProgress);
    };
  }, []);

  const stages = [
    {
      title: "Loading Site (Pit)",
      subtitle: "EXCAVATION & LOGISTICS DISPATCH",
      description: "Nickel ore is excavated and carefully loaded into our heavy units. Each dispatch is logged with real-time telemetry.",
      duration: "10-15 Min loading time",
      metric: "Target: 45 Tons/load",
      bg: "bg-[#56694E]/10 border-[#56694E]/20 text-[#56694E]"
    },
    {
      title: "Hauling Route",
      subtitle: "HAZARDOUS INDUSTRIAL TRANSIT",
      description: "High-power trucks navigate the rugged private mining roads under strict speed restrictions to guarantee maximum safety.",
      duration: "30-40 Min travel time",
      metric: "Max Speed: 40 km/h",
      bg: "bg-[#C67A2B]/10 border-[#C67A2B]/20 text-[#C67A2B]"
    },
    {
      title: "Weighbridge Station",
      subtitle: "REVENUE ASSURANCE & CONTROL",
      description: "Precise digital weighbridges capture gross weight and cross-reference with digital manifests to secure operational payload.",
      duration: "3 Min cycle time",
      metric: "Accuracy tolerance: ±0.1%",
      bg: "bg-neutral-800/10 border-neutral-800/20 text-neutral-800"
    },
    {
      title: "Dumping Yard",
      subtitle: "SEGREGATED STOCKPILE CONTROL",
      description: "Ore is categorized by nickel grade and dumped at strategic stockpile zones based on real-time chemistry specifications.",
      duration: "5 Min discharge time",
      metric: "Stockpile segregation: 100%",
      bg: "bg-[#56694E]/10 border-[#56694E]/20 text-[#56694E]"
    },
    {
      title: "Lab Assay & Release",
      subtitle: "FINAL PORT/EXPLOITATION DELIVERY",
      description: "Dumping operations are confirmed, grade verification samples are certified, and units return to cycle immediately.",
      duration: "Continuous cycle loop",
      metric: "Daily target: 200 cycles",
      bg: "bg-[#C67A2B]/10 border-[#C67A2B]/20 text-[#C67A2B]"
    }
  ];

  const fleets = {
    volvo: {
      name: "Volvo FMX 440 6x4",
      tagline: "Uncompromised Torque for Rugged Terrain",
      engine: "D13A, 12.8 Liters Euro 5",
      power: "440 HP @ 1400-1800 rpm",
      payload: "45,000 Kg (45 Tons)",
      baseMonthlyRent: 85000000, // Rp 85,000,000 per month
      fuelAvg: "1.8 - 2.2 Liters / Km",
      highlights: [
        "Dynamic Steering for heavy load control",
        "Reinforced steel chassis for mine operations",
        "Advanced driver collision prevention telemetry"
      ],
      features: "Ideal for deep-pit heavy ore hauling under severe grade conditions."
    },
    scania: {
      name: "Scania P410 XT 6x4",
      tagline: "Exceptional Fuel Efficiency & High Duty Cycle",
      engine: "DC13, 13 Liters Euro 4",
      power: "410 HP @ 1900 rpm",
      payload: "40,000 Kg (40 Tons)",
      baseMonthlyRent: 78000000, // Rp 78,000,000 per month
      fuelAvg: "1.6 - 1.9 Liters / Km",
      highlights: [
        "Opticruise automated gearbox for cycle efficiency",
        "XT heavy-duty front steel bumper and shield",
        "Full integration with FMS tracking systems"
      ],
      features: "Optimized for high-speed continuous hauling routes and optimal payload-cost ratio."
    }
  };

  // Cost calculator based on lease duration (longer duration = discount)
  const getCalculatedRent = (base: number) => {
    let discount = 1.0;
    if (months >= 24) discount = 0.88; // 12% discount
    else if (months >= 18) discount = 0.92; // 8% discount
    else if (months >= 12) discount = 0.95; // 5% discount

    const monthlyCost = base * discount;
    const totalCost = monthlyCost * months;

    return {
      monthly: Math.round(monthlyCost),
      total: Math.round(totalCost)
    };
  };

  const currentRent = getCalculatedRent(fleets[activeFleet].baseMonthlyRent);

  return (
    <div className="light min-h-screen bg-[#F7F5F2] text-[#1B1B1B] font-sans antialiased selection:bg-[#C67A2B] selection:text-white">
      {/* Dynamic Font Styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@200;300;400;500;600;700&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-outfit { font-family: 'Outfit', sans-serif; }
          .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        `
      }} />

      {/* Glassmorphic Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-jakarta border-b ${scrolled
          ? "bg-[#F7F5F2]/80 backdrop-blur-md border-[#E4E4E4] py-4 shadow-sm"
          : "bg-transparent border-transparent py-6"
        }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo/light-logo.svg"
              width={50}
              height={50}
              alt="Picture of the author"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-sm md:text-base leading-tight">HAULING KEMBAR JAYA</span>
              <span className="text-[10px] text-[#6D6D6D] tracking-widest uppercase">Mining Logistics</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#6D6D6D]">
            <a href="#about" className="hover:text-[#1B1B1B] transition-colors">Story</a>
            <a href="#operational-journey" className="hover:text-[#1B1B1B] transition-colors">Operational Journey</a>
            <a href="#fleet" className="hover:text-[#1B1B1B] transition-colors">Fleet Specs</a>
            <a href="#performance" className="hover:text-[#1B1B1B] transition-colors">Performance</a>
            <a href="#innovation" className="hover:text-[#1B1B1B] transition-colors">Innovation</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-[#1B1B1B] text-[#F7F5F2] hover:bg-[#C67A2B] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="bg-[#1B1B1B] text-[#F7F5F2] hover:bg-[#C67A2B] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm"
              >
                Enterprise Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#1B1B1B]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 bg-[#F7F5F2] transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-8`}>
        <nav className="flex flex-col gap-6 text-lg font-jakarta font-semibold text-[#1B1B1B] mb-12">
          <a href="#about" onClick={() => setIsMenuOpen(false)} className="border-b border-[#E4E4E4] pb-3">Story</a>
          <a href="#operational-journey" onClick={() => setIsMenuOpen(false)} className="border-b border-[#E4E4E4] pb-3">Operational Journey</a>
          <a href="#fleet" onClick={() => setIsMenuOpen(false)} className="border-b border-[#E4E4E4] pb-3">Fleet Specs</a>
          <a href="#performance" onClick={() => setIsMenuOpen(false)} className="border-b border-[#E4E4E4] pb-3">Performance</a>
          <a href="#innovation" onClick={() => setIsMenuOpen(false)} className="border-b border-[#E4E4E4] pb-3">Innovation</a>
        </nav>
        <Link
          href="/dashboard"
          onClick={() => setIsMenuOpen(false)}
          className="bg-[#1B1B1B] text-[#F7F5F2] py-4 rounded-xl text-center font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2"
        >
          {user ? <LayoutDashboard className="w-5 h-5" /> : null}
          {user ? "Open Dashboard" : "Sign In to Portal"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content Wrapper for Sticky Reveal Footer */}
      <div className="relative z-10 bg-[#F7F5F2] shadow-[0_20px_50px_rgba(0,0,0,0.15)] pb-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] pt-32 pb-12 flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-12 overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#C67A2B]/5 blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-[#56694E]/5 blur-[80px] pointer-events-none -z-10" />

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-[#C67A2B]" />
              <span className="font-outfit text-xs font-semibold uppercase tracking-[0.25em] text-[#C67A2B]">
                PT Hauling Kembar Jaya
              </span>
            </div>

            <h1 className="font-syne text-[2.8rem] sm:text-[4rem] md:text-[6.5rem] leading-[1.05] tracking-tight font-extrabold text-[#1B1B1B] max-w-5xl select-none">
              HAULING<br />
              <span className="text-[#C67A2B]">OPERATIONS</span><br />
              DEFINED BY PRECISION.
            </h1>

            <div className="grid md:grid-cols-12 gap-8 mt-12 md:mt-16 items-start">
              <div className="md:col-span-5 font-jakarta text-base md:text-lg text-[#6D6D6D] leading-relaxed font-light">
                We engineer logistics for high-volume mining projects. Combining heavy fleet operations, telemetry control, and complete safety parameters to deliver nickel ore efficiently.
              </div>
              <div className="md:col-span-7 flex flex-wrap gap-4 md:justify-end">
                <Link
                  href="/dashboard"
                  className="bg-[#1B1B1B] text-[#F7F5F2] hover:bg-[#C67A2B] text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3 shadow-md group"
                >
                  Access Control Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#operational-journey"
                  className="border border-[#E4E4E4] bg-white text-[#1B1B1B] hover:bg-neutral-50 text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-2"
                >
                  Observe Logistics Cycle
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky scale-reveal image container */}
        <div
          ref={revealContainerRef}
          className="relative h-[180vh] w-full bg-transparent"
          style={{
            "--reveal-progress": "0",
            "--clip-tb-coef": isMobile ? "25%" : "17.5%",
            "--clip-lr-coef": isMobile ? "5%" : "15%",
            "--border-radius-coef": isMobile ? "16px" : "24px",
          } as React.CSSProperties}
        >
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <div
              className="relative w-full h-full shadow-2xl flex items-center justify-center overflow-hidden"
              style={{
                clipPath: "inset(calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) round calc(var(--border-radius-coef) * (1 - var(--reveal-progress))))",
                WebkitClipPath: "inset(calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) round calc(var(--border-radius-coef) * (1 - var(--reveal-progress))))",
                willChange: "clip-path",
              }}
            >
              <Image
                src="/hero_mining_truck.png"
                alt="Mining Truck golden hour hauling operations"
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{
                  transform: "scale(calc(1.15 - 0.15 * var(--reveal-progress)))",
                  willChange: "transform",
                }}
              />
              {/* Dark vignette overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(27, 27, 27, calc(0.4 + 0.4 * var(--reveal-progress))), rgba(27, 27, 27, calc(0.1 * var(--reveal-progress))))",
                  willChange: "background",
                }}
              />

              {/* Absolute bottom caption */}
              <div
                className="absolute bottom-10 left-10 md:bottom-16 md:left-16 text-white font-jakarta transition-opacity duration-300"
                style={{
                  opacity: "clamp(0, calc(1 - var(--reveal-progress) * 2.5), 1)",
                } as React.CSSProperties}
              >
                <p className="font-outfit text-xs font-semibold tracking-widest uppercase text-[#C67A2B] mb-2">
                  Active Fleet Focus
                </p>
                <h3 className="font-syne text-xl md:text-3xl font-bold tracking-tight">
                  PT Vale Indonesia Nickel Project Site
                </h3>
              </div>

              {/* Center Callout - displays when fullscreen */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-all duration-300"
                style={{
                  opacity: "clamp(0, calc((var(--reveal-progress) - 0.45) / 0.55), 1)",
                  transform: "scale(calc(0.92 + 0.08 * var(--reveal-progress)))",
                } as React.CSSProperties}
              >
                <span className="font-outfit text-xs font-bold uppercase tracking-[0.3em] text-[#C67A2B] mb-4">
                  ENTERPRISE LOGISTICS SYSTEM
                </span>
                <h2 className="font-syne text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-4xl">
                  UNCOMPROMISING PRECISION IN EVERY TRANSIT
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Story / Mission Section */}
        <section id="about" className="py-24 md:py-36 bg-white border-y border-[#E4E4E4] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 space-y-8">
              <span className="font-outfit text-xs font-bold uppercase tracking-[0.2em] text-[#C67A2B] bg-[#C67A2B]/10 px-3 py-1.5 rounded">
                OUR MISSION STATEMENT
              </span>
              <h2 className="font-syne text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1B1B1B]">
                The backbone of heavy mining logistics in Indonesia.
              </h2>
              <p className="font-jakarta text-[#6D6D6D] leading-relaxed text-base font-light">
                Our enterprise logistics management enables miners to control costs, audit haul routes, and maximize tonase targets. From loading site dispatch to quality assay verifications, every cycle is integrated into a unified portal.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-[#C67A2B] pl-4">
                  <h4 className="font-syne text-3xl font-extrabold text-[#1B1B1B]">
                    <Counter end={99} suffix="%" />
                  </h4>
                  <p className="text-xs text-[#6D6D6D] uppercase tracking-wider mt-1">SLA Contract Adherence</p>
                </div>
                <div className="border-l-2 border-[#56694E] pl-4">
                  <h4 className="font-syne text-3xl font-extrabold text-[#1B1B1B]">
                    <Counter end={0} prefix="Zero " />
                  </h4>
                  <p className="text-xs text-[#6D6D6D] uppercase tracking-wider mt-1">LTI - Lost Time Injury Rate</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 relative w-full h-[320px] md:h-[450px] rounded-2xl overflow-hidden border border-[#E4E4E4] group shadow-inner">
              <Image
                src="/mining_road.png"
                alt="Mining road industrial logistics"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#C67A2B]/10 mix-blend-multiply opacity-20 group-hover:opacity-0 transition-opacity duration-700" />
            </div>
          </div>
        </section>

        {/* Operational Journey: Interactive Timeline Section */}
        <section id="operational-journey" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="font-outfit text-xs font-semibold uppercase tracking-[0.25em] text-[#56694E] mb-3 inline-block">
              PROCESS FLOW & TRANSPARENCY
            </span>
            <h2 className="font-syne text-3xl md:text-5xl font-extrabold tracking-tight text-[#1B1B1B]">
              Interactive Operational Journey
            </h2>
            <p className="font-jakarta text-[#6D6D6D] mt-4 font-light">
              Each cycle has specific checks. Click any node below to trace a hauling unit's workflow as it processes from loading point to laboratory release.
            </p>
          </div>

          {/* Timeline Visual Track */}
          <div className="relative mb-16 pt-8 pb-12 font-jakarta">
            {/* Horizontal line track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E4E4E4] -translate-y-1/2 rounded-full hidden md:block" />

            {/* Active progress indicator line */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#C67A2B] -translate-y-1/2 rounded-full hidden md:block transition-all duration-700 ease-out"
              style={{ width: `${activeStage * 25}%` }}
            />

            {/* Nodes Container */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const isActive = idx === activeStage;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStage(idx)}
                    className={`flex flex-col items-center md:items-stretch text-left p-6 md:p-4 rounded-xl border transition-all duration-300 bg-white ${isActive
                        ? "border-[#C67A2B] shadow-md ring-2 ring-[#C67A2B]/10 -translate-y-2"
                        : "border-[#E4E4E4] hover:border-[#C67A2B]/50 hover:-translate-y-1"
                      }`}
                  >
                    <div className="flex items-center gap-3 md:flex-col md:items-start">
                      {/* Node status dot */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${isActive
                          ? "bg-[#C67A2B] text-white"
                          : idx < activeStage
                            ? "bg-[#56694E] text-white"
                            : "bg-neutral-200 text-[#6D6D6D]"
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="md:mt-4">
                        <h4 className="font-syne text-sm font-bold text-[#1B1B1B]">
                          {stage.title}
                        </h4>
                        <p className="text-[9px] text-[#6D6D6D] tracking-widest uppercase font-semibold mt-0.5">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive animated truck simulator */}
            <div className="hidden md:block relative h-8 mt-12 bg-white/40 border border-[#E4E4E4] rounded-full overflow-hidden">
              <div
                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#C67A2B] font-bold text-xs uppercase transition-all duration-700 ease-out"
                style={{ left: `calc(${activeStage * 23.5}% + 16px)` }}
              >
                <Truck className="w-5 h-5 animate-pulse" />
                <span className="font-outfit tracking-wider text-[10px]">UNIT TRANSIT POSITION</span>
              </div>
            </div>
          </div>

          {/* Selected Stage Detail Panel */}
          <div className="bg-white border border-[#E4E4E4] rounded-2xl p-8 md:p-12 shadow-sm font-jakarta transition-all duration-500 transform scale-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className={`inline-block border px-3 py-1 rounded text-xs font-semibold ${stages[activeStage].bg}`}>
                STAGE 0{activeStage + 1} DIRECTIVES
              </span>
              <h3 className="font-syne text-2xl md:text-3xl font-extrabold text-[#1B1B1B]">
                {stages[activeStage].title} — {stages[activeStage].subtitle}
              </h3>
              <p className="text-[#6D6D6D] leading-relaxed font-light">
                {stages[activeStage].description}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-[#F7F5F2] border border-[#E4E4E4] px-4 py-2 rounded-lg text-xs font-medium">
                  <Clock className="w-4 h-4 text-[#C67A2B]" />
                  {stages[activeStage].duration}
                </div>
                <div className="flex items-center gap-2 bg-[#F7F5F2] border border-[#E4E4E4] px-4 py-2 rounded-lg text-xs font-medium">
                  <Shield className="w-4 h-4 text-[#56694E]" />
                  {stages[activeStage].metric}
                </div>
              </div>
            </div>
            <div className="flex gap-4 md:flex-col shrink-0">
              <button
                onClick={() => setActiveStage(prev => Math.max(0, prev - 1))}
                disabled={activeStage === 0}
                className="flex-1 md:flex-initial border border-[#E4E4E4] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Stage
              </button>
              <button
                onClick={() => setActiveStage(prev => Math.min(stages.length - 1, prev + 1))}
                disabled={activeStage === stages.length - 1}
                className="flex-1 md:flex-initial bg-[#1B1B1B] text-[#F7F5F2] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                Next Stage <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Fleet Showcase & Calculator Section */}
        <section id="fleet" className="py-24 md:py-36 bg-[#F1EFEA] border-y border-[#E4E4E4] relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-12 items-end mb-16">
              <div className="md:col-span-8">
                <span className="font-outfit text-xs font-semibold uppercase tracking-[0.25em] text-[#C67A2B] mb-3 inline-block">
                  HEAVY POWERHOUSE
                </span>
                <h2 className="font-syne text-3xl md:text-5xl font-extrabold tracking-tight text-[#1B1B1B]">
                  Engineered for Infinite Duty Cycles
                </h2>
              </div>
              <div className="md:col-span-4 flex md:justify-end">
                {/* Fleet Spec Tabs */}
                <div className="inline-flex bg-white/60 p-1.5 rounded-full border border-[#E4E4E4] gap-1">
                  <button
                    onClick={() => setActiveFleet("volvo")}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeFleet === "volvo"
                        ? "bg-[#1B1B1B] text-white shadow"
                        : "text-[#6D6D6D] hover:text-[#1B1B1B]"
                      }`}
                  >
                    Volvo FMX
                  </button>
                  <button
                    onClick={() => setActiveFleet("scania")}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeFleet === "scania"
                        ? "bg-[#1B1B1B] text-white shadow"
                        : "text-[#6D6D6D] hover:text-[#1B1B1B]"
                      }`}
                  >
                    Scania XT
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Spec Panel */}
              <div className="lg:col-span-7 bg-white border border-[#E4E4E4] rounded-2xl p-8 md:p-12 shadow-sm flex flex-col justify-between space-y-8 font-jakarta">
                <div>
                  <span className="text-[#C67A2B] font-outfit text-xs font-bold uppercase tracking-widest">
                    {fleets[activeFleet].tagline}
                  </span>
                  <h3 className="font-syne text-2xl md:text-3xl font-extrabold mt-1 text-[#1B1B1B]">
                    {fleets[activeFleet].name}
                  </h3>
                  <p className="text-[#6D6D6D] text-sm mt-3 leading-relaxed font-light">
                    {fleets[activeFleet].features}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-[#E4E4E4] pt-8">
                  <div>
                    <span className="text-[10px] text-[#6D6D6D] tracking-wider uppercase font-semibold">Engine Specs</span>
                    <p className="text-sm font-bold text-[#1B1B1B] mt-1">{fleets[activeFleet].engine}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6D6D6D] tracking-wider uppercase font-semibold">Horsepower output</span>
                    <p className="text-sm font-bold text-[#1B1B1B] mt-1">{fleets[activeFleet].power}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6D6D6D] tracking-wider uppercase font-semibold">Payload Capacity</span>
                    <p className="text-sm font-bold text-[#1B1B1B] mt-1">{fleets[activeFleet].payload}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6D6D6D] tracking-wider uppercase font-semibold">Average Fuel Efficiency</span>
                    <p className="text-sm font-bold text-[#1B1B1B] mt-1">{fleets[activeFleet].fuelAvg}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#F7F5F2] border border-[#E4E4E4] p-5 rounded-xl">
                  <span className="text-[10px] text-[#6D6D6D] tracking-wider uppercase font-bold">Standard Features</span>
                  <ul className="space-y-1.5 text-xs text-[#1B1B1B] font-medium">
                    {fleets[activeFleet].highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#56694E]" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Rent Calculator */}
              <div className="lg:col-span-5 bg-white border border-[#E4E4E4] rounded-2xl p-8 md:p-12 shadow-sm space-y-8 font-jakarta">
                <div>
                  <span className="text-[#56694E] font-outfit text-xs font-bold uppercase tracking-widest">
                    FLEXIBLE LEASE CALCULATOR
                  </span>
                  <h3 className="font-syne text-2xl font-bold mt-1 text-[#1B1B1B]">
                    Estimate Leasing Costs
                  </h3>
                  <p className="text-[#6D6D6D] text-xs mt-2 leading-relaxed">
                    Project your operation budget. Rental pricing is scaled to contract length. Discounts apply for long-term commitments.
                  </p>
                </div>

                {/* Input details */}
                <div className="space-y-6 pt-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-[#6D6D6D]">Lease Period (Months)</span>
                      <span className="text-[#1B1B1B] bg-neutral-100 px-2.5 py-1 rounded">{months} Months</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="36"
                      step="3"
                      value={months}
                      onChange={(e) => setMonths(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#E4E4E4] rounded-lg appearance-none cursor-pointer accent-[#C67A2B]"
                    />
                    <div className="flex justify-between text-[10px] text-[#6D6D6D] mt-1.5 font-semibold">
                      <span>3m</span>
                      <span>12m (5% Disc)</span>
                      <span>18m (8% Disc)</span>
                      <span>24m+ (12% Disc)</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E4E4E4] pt-6 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#6D6D6D] font-medium">Monthly Rent Spec</span>
                      <span className="font-syne text-lg font-bold text-[#1B1B1B]">
                        Rp {currentRent.monthly.toLocaleString("id-ID")}
                        <span className="text-[10px] text-[#6D6D6D] font-normal"> / month</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline bg-[#F7F5F2] border border-[#E4E4E4] p-4 rounded-xl">
                      <span className="text-xs text-[#6D6D6D] font-medium">Estimated Total Rental</span>
                      <span className="font-syne text-xl font-extrabold text-[#C67A2B]">
                        Rp {currentRent.total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#6D6D6D] leading-relaxed flex gap-2 pt-2">
                    <Wrench className="w-4 h-4 shrink-0 text-[#C67A2B]" />
                    <span>Lease includes scheduled preventive mine site maintenance, spare parts, and mandatory unit compliance certifications.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance & Analytics: Dark Dashboard Section */}
        <section id="performance" className="py-24 md:py-36 bg-[#121212] text-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(198,122,43,0.06),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(86,105,78,0.05),transparent_50%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Details panel */}
              <div className="lg:col-span-5 space-y-6">
                <span className="font-outfit text-xs font-bold uppercase tracking-[0.25em] text-[#C67A2B] bg-[#C67A2B]/15 px-3 py-1.5 rounded">
                  LIVE PERFORMANCE METRICS
                </span>
                <h2 className="font-syne text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
                  Real-Time Auditing & Yields
                </h2>
                <p className="font-jakarta text-gray-400 font-light leading-relaxed">
                  We manage contract performance under a centralized dashboard. Track operational parameters, calculate hauling cycles, measure fuel usage, and keep budgets completely matching the contract target.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#C67A2B]">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-syne text-sm font-bold">Total Operations Telemetry</h4>
                      <p className="text-xs text-gray-400">All haul trucks connected via GPS/IoT payload monitors</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#56694E]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-syne text-sm font-bold">Live Budget Tracking</h4>
                      <p className="text-xs text-gray-400">Instantly matches fuel, driver payroll, and rental costs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark Console Widget */}
              <div className="lg:col-span-7 bg-[#1B1B1B] border border-neutral-800 rounded-3xl p-6 md:p-10 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-5 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-[10px] text-gray-500 font-mono ml-2">HMS://HKJ.CONSOLE-FEED</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-mono animate-pulse">
                    SYSTEM ACTIVE
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 font-jakarta">
                  <div className="border-b border-neutral-800 pb-6">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Total Nickel Ore Hauled</span>
                    <div className="font-syne text-3xl font-extrabold mt-1.5 text-white">
                      <Counter end={12450800} suffix=" Tons" />
                    </div>
                  </div>
                  <div className="border-b border-neutral-800 pb-6">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Active Operational Contracts</span>
                    <div className="font-syne text-3xl font-extrabold mt-1.5 text-white">
                      <Counter end={2} suffix=" Contracts" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Average Haul Cycle Time</span>
                    <div className="font-syne text-3xl font-extrabold mt-1.5 text-[#C67A2B]">
                      <Counter end={38} suffix=" Min" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Contract Target Margin</span>
                    <div className="font-syne text-3xl font-extrabold mt-1.5 text-[#56694E]">
                      <Counter end={30} suffix="%" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-gray-400">
                  <span>Update rate: Real-time via Weighbridge</span>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-[#C67A2B] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    Inspect Live Reports
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Innovation / Why Choose Us Section */}
        <section id="innovation" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <span className="font-outfit text-xs font-semibold uppercase tracking-[0.25em] text-[#C67A2B]">
                NEXT-GEN INFRASTRUCTURE
              </span>
              <h2 className="font-syne text-3xl md:text-4xl font-extrabold tracking-tight text-[#1B1B1B] leading-none">
                Safety, Electrification, Telemetry.
              </h2>
              <p className="font-jakarta text-[#6D6D6D] text-sm leading-relaxed font-light">
                We continually upgrade our mining fleet and technical stack. Incorporating advanced security and monitoring layers.
              </p>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-3 gap-6 font-jakarta">
              <div className="bg-white border border-[#E4E4E4] p-8 rounded-2xl flex flex-col justify-between h-72 hover:border-[#C67A2B]/40 transition-colors">
                <div className="w-12 h-12 bg-[#C67A2B]/10 rounded-xl flex items-center justify-center text-[#C67A2B]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-lg text-[#1B1B1B]">IoT Payload Verification</h4>
                  <p className="text-xs text-[#6D6D6D] mt-2 font-light">Digital integration with weighbridge systems prevents manual tampering or tonase leakages.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E4E4E4] p-8 rounded-2xl flex flex-col justify-between h-72 hover:border-[#56694E]/40 transition-colors">
                <div className="w-12 h-12 bg-[#56694E]/10 rounded-xl flex items-center justify-center text-[#56694E]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-lg text-[#1B1B1B]">Route Speed Auditing</h4>
                  <p className="text-xs text-[#6D6D6D] mt-2 font-light">Continuous GPS reporting tracks vehicle velocities dynamically to eliminate transit accidents.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E4E4E4] p-8 rounded-2xl flex flex-col justify-between h-72 hover:border-[#C67A2B]/40 transition-colors">
                <div className="w-12 h-12 bg-[#C67A2B]/10 rounded-xl flex items-center justify-center text-[#C67A2B]">
                  <BatteryCharging className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-lg text-[#1B1B1B]">Electrification Roadmaps</h4>
                  <p className="text-xs text-[#6D6D6D] mt-2 font-light">Actively testing heavy-duty electric trucks to minimize carbon impact on Indonesian mine sites.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Reveal Footer (Combined CTA + Footer) */}
      <PixelFooter />
    </div>
  );
}
