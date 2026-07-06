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

  const grainOverlay = (
    <div 
      className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 z-10" 
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />
  );

  return (
    <div className="light min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Dynamic Font Styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          .font-sans { font-family: 'Inter', sans-serif; }
          .font-syne { font-family: 'Inter', sans-serif; letter-spacing: -0.02em; }
          .font-outfit { font-family: 'Inter', sans-serif; letter-spacing: -0.01em; }
          .font-jakarta { font-family: 'Inter', sans-serif; }
        `
      }} />

      {/* Glassmorphic Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans border-b ${scrolled
          ? "bg-white/90 backdrop-blur-md border-neutral-200 py-4 shadow-sm"
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
              <span className="font-semibold tracking-tight text-sm md:text-base leading-tight">HAULING KEMBAR JAYA</span>
              <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-medium">Mining Logistics</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-neutral-500">
            <a href="#about" className="hover:text-neutral-900 transition-colors">Story</a>
            <a href="#operational-journey" className="hover:text-neutral-900 transition-colors">Operational Journey</a>
            <a href="#fleet" className="hover:text-neutral-900 transition-colors">Fleet Specs</a>
            <a href="#performance" className="hover:text-neutral-900 transition-colors">Performance</a>
            <a href="#innovation" className="hover:text-neutral-900 transition-colors">Innovation</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-md transition-all duration-300 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-md transition-all duration-300 flex items-center gap-2"
              >
                Enterprise Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-neutral-900"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 bg-white transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-8`}>
        <nav className="flex flex-col gap-6 text-lg font-sans font-medium text-neutral-900 mb-12">
          <a href="#about" onClick={() => setIsMenuOpen(false)} className="border-b border-neutral-100 pb-3">Story</a>
          <a href="#operational-journey" onClick={() => setIsMenuOpen(false)} className="border-b border-neutral-100 pb-3">Operational Journey</a>
          <a href="#fleet" onClick={() => setIsMenuOpen(false)} className="border-b border-neutral-100 pb-3">Fleet Specs</a>
          <a href="#performance" onClick={() => setIsMenuOpen(false)} className="border-b border-neutral-100 pb-3">Performance</a>
          <a href="#innovation" onClick={() => setIsMenuOpen(false)} className="border-b border-neutral-100 pb-3">Innovation</a>
        </nav>
        <Link
          href="/dashboard"
          onClick={() => setIsMenuOpen(false)}
          className="bg-neutral-900 text-white py-4 rounded-md text-center font-semibold tracking-wider uppercase text-sm flex items-center justify-center gap-2"
        >
          {user ? <LayoutDashboard className="w-5 h-5" /> : null}
          {user ? "Open Dashboard" : "Sign In to Portal"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content Wrapper for Sticky Reveal Footer */}
      <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] pb-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] pt-32 pb-12 flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-12 overflow-hidden">
          <div className="mt-8 relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-neutral-900" />
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-900">
                PT Hauling Kembar Jaya
              </span>
            </div>

            <h1 className="font-sans text-[2.8rem] sm:text-[4.5rem] md:text-[6.5rem] leading-[1.05] tracking-tight font-semibold text-neutral-900 max-w-5xl select-none">
              HAULING<br />
              <span className="text-neutral-400">OPERATIONS</span><br />
              DEFINED BY PRECISION.
            </h1>

            <div className="grid md:grid-cols-12 gap-8 mt-12 md:mt-16 items-start">
              <div className="md:col-span-5 font-sans text-base md:text-lg text-neutral-500 leading-relaxed font-normal">
                We engineer logistics for high-volume mining projects. Combining heavy fleet operations, telemetry control, and complete safety parameters to deliver nickel ore efficiently.
              </div>
              <div className="md:col-span-7 flex flex-wrap gap-4 md:justify-end">
                <Link
                  href="/dashboard"
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-md transition-all duration-300 flex items-center gap-3 group"
                >
                  Access Control Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#operational-journey"
                  className="border border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-50 text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-md transition-all duration-300 flex items-center gap-2"
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
            "--border-radius-coef": "0px", // Sharp corners for editorial look
          } as React.CSSProperties}
        >
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden bg-neutral-100"
              style={{
                clipPath: "inset(calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))))",
                WebkitClipPath: "inset(calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))) calc(var(--clip-tb-coef) * (1 - var(--reveal-progress))) calc(var(--clip-lr-coef) * (1 - var(--reveal-progress))))",
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
                  transform: "scale(calc(1.1 - 0.1 * var(--reveal-progress)))",
                  willChange: "transform",
                  filter: "grayscale(20%) contrast(110%)", // slightly editorial look
                }}
              />
              {grainOverlay}
              
              {/* Subtle gradient overlay to ensure text legibility without heavy vignette */}
              <div
                className="absolute inset-0 bg-black"
                style={{
                  opacity: "calc(0.1 + 0.3 * var(--reveal-progress))",
                  willChange: "opacity",
                }}
              />

              {/* Absolute bottom caption */}
              <div
                className="absolute bottom-10 left-10 md:bottom-16 md:left-16 text-white font-sans transition-opacity duration-300 z-20"
                style={{
                  opacity: "clamp(0, calc(1 - var(--reveal-progress) * 2.5), 1)",
                } as React.CSSProperties}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/70 mb-2">
                  Active Fleet Focus
                </p>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight">
                  PT Vale Indonesia Nickel Project Site
                </h3>
              </div>

              {/* Center Callout - displays when fullscreen */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-all duration-300 z-20"
                style={{
                  opacity: "clamp(0, calc((var(--reveal-progress) - 0.45) / 0.55), 1)",
                  transform: "scale(calc(0.95 + 0.05 * var(--reveal-progress)))",
                } as React.CSSProperties}
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-4">
                  ENTERPRISE LOGISTICS SYSTEM
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight max-w-4xl tracking-tight">
                  UNCOMPROMISING PRECISION IN EVERY TRANSIT
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Story / Mission Section */}
        <section id="about" className="py-24 md:py-36 bg-white border-y border-neutral-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-16 md:gap-24 items-center">
            <div className="md:col-span-6 space-y-10">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400">
                OUR MISSION STATEMENT
              </span>
              <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-neutral-900">
                The backbone of heavy mining logistics in Indonesia.
              </h2>
              <p className="font-sans text-neutral-500 leading-relaxed text-lg font-normal max-w-lg">
                Our enterprise logistics management enables miners to control costs, audit haul routes, and maximize tonase targets. From loading site dispatch to quality assay verifications, every cycle is integrated into a unified portal.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-100">
                <div>
                  <h4 className="font-sans text-4xl font-semibold text-neutral-900 tracking-tight">
                    <Counter end={99} suffix="%" />
                  </h4>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2 font-medium">SLA Contract Adherence</p>
                </div>
                <div>
                  <h4 className="font-sans text-4xl font-semibold text-neutral-900 tracking-tight">
                    <Counter end={0} prefix="Zero " />
                  </h4>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2 font-medium">LTI - Lost Time Injury Rate</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 relative w-full h-[400px] md:h-[600px] overflow-hidden">
              <Image
                src="/mining_road.png"
                alt="Mining road industrial logistics"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover filter grayscale-[20%] contrast-[110%]"
              />
              {grainOverlay}
            </div>
          </div>
        </section>

        {/* Operational Journey: Interactive Timeline Section */}
        <section id="operational-journey" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12 relative border-b border-neutral-100">
          <div className="max-w-3xl mb-16 md:mb-24">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 inline-block">
              PROCESS FLOW & TRANSPARENCY
            </span>
            <h2 className="font-sans text-3xl md:text-5xl font-medium tracking-tight text-neutral-900">
              Interactive Operational Journey
            </h2>
            <p className="font-sans text-neutral-500 mt-6 text-lg font-normal">
              Each cycle has specific checks. Trace a hauling unit's workflow as it processes from loading point to laboratory release.
            </p>
          </div>

          {/* Timeline Visual Track */}
          <div className="relative mb-16 pt-8 pb-12 font-sans">
            {/* Horizontal line track */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-200 -translate-y-1/2 hidden md:block" />

            {/* Active progress indicator line */}
            <div
              className="absolute top-1/2 left-0 h-[1px] bg-neutral-900 -translate-y-1/2 hidden md:block transition-all duration-700 ease-out"
              style={{ width: `${activeStage * 25}%` }}
            />

            {/* Nodes Container */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const isActive = idx === activeStage;
                const isPassed = idx < activeStage;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStage(idx)}
                    className={`flex flex-col items-center md:items-stretch text-left p-6 md:p-4 transition-all duration-300 bg-white group ${
                      isActive ? "opacity-100" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-4 md:flex-col md:items-start">
                      {/* Node status dot */}
                      <div className={`w-3 h-3 rounded-full transition-colors ${
                          isActive
                            ? "bg-[#C67A2B] ring-4 ring-[#C67A2B]/20"
                            : isPassed
                              ? "bg-neutral-900"
                              : "bg-neutral-300 group-hover:bg-neutral-400"
                        }`} 
                      />
                      <div className="md:mt-6">
                        <h4 className={`font-sans text-sm font-semibold transition-colors ${isActive ? "text-neutral-900" : "text-neutral-500"}`}>
                          {stage.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 tracking-widest uppercase font-medium mt-1">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Detail Panel */}
          <div className="bg-neutral-50 rounded-none p-8 md:p-12 font-sans transition-all duration-500 flex flex-col md:flex-row md:items-start justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
                STAGE 0{activeStage + 1} DIRECTIVES
              </span>
              <h3 className="font-sans text-2xl md:text-3xl font-medium text-neutral-900 tracking-tight">
                {stages[activeStage].title} — {stages[activeStage].subtitle}
              </h3>
              <p className="text-neutral-600 leading-relaxed text-lg font-normal">
                {stages[activeStage].description}
              </p>
              <div className="flex flex-wrap gap-6 pt-4 border-t border-neutral-200">
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">Duration</span>
                  <span className="text-sm font-medium text-neutral-900">{stages[activeStage].duration}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">Metric</span>
                  <span className="text-sm font-medium text-neutral-900">{stages[activeStage].metric}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 md:flex-col shrink-0">
              <button
                onClick={() => setActiveStage(prev => Math.max(0, prev - 1))}
                disabled={activeStage === 0}
                className="flex-1 md:flex-initial border border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors text-neutral-900"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setActiveStage(prev => Math.min(stages.length - 1, prev + 1))}
                disabled={activeStage === stages.length - 1}
                className="flex-1 md:flex-initial bg-neutral-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Fleet Showcase & Calculator Section */}
        <section id="fleet" className="py-24 md:py-36 bg-white relative border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 inline-block">
                  HEAVY POWERHOUSE
                </span>
                <h2 className="font-sans text-3xl md:text-5xl font-medium tracking-tight text-neutral-900">
                  Engineered for Infinite Duty Cycles
                </h2>
              </div>
              <div className="flex">
                {/* Fleet Spec Tabs */}
                <div className="inline-flex border-b border-neutral-200 w-full md:w-auto">
                  <button
                    onClick={() => setActiveFleet("volvo")}
                    className={`px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-all border-b-2 ${activeFleet === "volvo"
                        ? "border-neutral-900 text-neutral-900"
                        : "border-transparent text-neutral-400 hover:text-neutral-900"
                      }`}
                  >
                    Volvo FMX
                  </button>
                  <button
                    onClick={() => setActiveFleet("scania")}
                    className={`px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-all border-b-2 ${activeFleet === "scania"
                        ? "border-neutral-900 text-neutral-900"
                        : "border-transparent text-neutral-400 hover:text-neutral-900"
                      }`}
                  >
                    Scania XT
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16 md:gap-24">
              {/* Spec Panel */}
              <div className="lg:col-span-7 flex flex-col justify-between font-sans">
                <div>
                  <span className="text-neutral-500 text-[10px] font-semibold uppercase tracking-widest">
                    {fleets[activeFleet].tagline}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-medium mt-2 text-neutral-900 tracking-tight">
                    {fleets[activeFleet].name}
                  </h3>
                  <p className="text-neutral-500 text-lg mt-4 leading-relaxed font-normal">
                    {fleets[activeFleet].features}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-neutral-200 pt-8 mt-12">
                  <div>
                    <span className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold">Engine Specs</span>
                    <p className="text-sm font-medium text-neutral-900 mt-2">{fleets[activeFleet].engine}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold">Horsepower output</span>
                    <p className="text-sm font-medium text-neutral-900 mt-2">{fleets[activeFleet].power}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold">Payload Capacity</span>
                    <p className="text-sm font-medium text-neutral-900 mt-2">{fleets[activeFleet].payload}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold">Average Fuel Efficiency</span>
                    <p className="text-sm font-medium text-neutral-900 mt-2">{fleets[activeFleet].fuelAvg}</p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-200">
                  <span className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold mb-4 block">Standard Features</span>
                  <ul className="space-y-3 text-sm text-neutral-600 font-normal">
                    {fleets[activeFleet].highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-1.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Rent Calculator */}
              <div className="lg:col-span-5 bg-neutral-50 p-8 md:p-12 space-y-10 font-sans border border-neutral-100">
                <div>
                  <span className="text-neutral-400 text-[10px] font-semibold uppercase tracking-widest">
                    FLEXIBLE LEASE CALCULATOR
                  </span>
                  <h3 className="text-2xl font-medium mt-2 text-neutral-900 tracking-tight">
                    Estimate Leasing Costs
                  </h3>
                  <p className="text-neutral-500 text-sm mt-3 leading-relaxed">
                    Project your operation budget. Rental pricing is scaled to contract length. Discounts apply for long-term commitments.
                  </p>
                </div>

                {/* Input details */}
                <div className="space-y-8 pt-4 border-t border-neutral-200">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-6">
                      <span className="text-neutral-500 uppercase tracking-widest">Lease Period</span>
                      <span className="text-neutral-900">{months} Months</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="36"
                      step="3"
                      value={months}
                      onChange={(e) => setMonths(parseInt(e.target.value))}
                      className="w-full h-[1px] bg-neutral-300 rounded-none appearance-none cursor-pointer accent-neutral-900"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-3 font-semibold tracking-widest uppercase">
                      <span>3m</span>
                      <span>12m</span>
                      <span>18m</span>
                      <span>24m+</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-6">
                    <div className="flex justify-between items-baseline border-b border-neutral-200 pb-4">
                      <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Monthly Rent Spec</span>
                      <span className="font-sans text-lg font-semibold text-neutral-900 tabular-nums">
                        Rp {currentRent.monthly.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Estimated Total</span>
                      <span className="font-sans text-2xl font-semibold text-[#C67A2B] tabular-nums tracking-tight">
                        Rp {currentRent.total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-400 leading-relaxed flex gap-3 pt-6 border-t border-neutral-200">
                    <Wrench className="w-4 h-4 shrink-0" />
                    <span>Lease includes scheduled preventive mine site maintenance, spare parts, and mandatory unit compliance certifications.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance & Analytics: Dark Dashboard Section */}
        <section id="performance" className="py-24 md:py-36 bg-[#0a0a0a] text-white relative border-y border-neutral-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
              {/* Details panel */}
              <div className="lg:col-span-5 space-y-10">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  LIVE PERFORMANCE METRICS
                </span>
                <h2 className="font-sans text-3xl md:text-5xl font-medium tracking-tight leading-[1.1]">
                  Real-Time Auditing & Yields
                </h2>
                <p className="font-sans text-neutral-400 font-normal leading-relaxed text-lg">
                  We manage contract performance under a centralized dashboard. Track operational parameters, calculate hauling cycles, measure fuel usage, and keep budgets completely matching the contract target.
                </p>

                <div className="space-y-8 pt-6 border-t border-neutral-800">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                      <Gauge className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base font-medium">Total Operations Telemetry</h4>
                      <p className="text-sm text-neutral-500 mt-1">All haul trucks connected via GPS/IoT payload monitors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base font-medium">Live Budget Tracking</h4>
                      <p className="text-sm text-neutral-500 mt-1">Instantly matches fuel, driver payroll, and rental costs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark Console Widget */}
              <div className="lg:col-span-7 bg-black border border-neutral-800 rounded-lg p-8 md:p-12 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">Console Feed</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-mono tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    System Active
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-12 font-sans">
                  <div className="border-b border-neutral-800 pb-6">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Total Nickel Ore Hauled</span>
                    <div className="text-3xl font-medium mt-2 text-white tabular-nums tracking-tight">
                      <Counter end={12450800} suffix=" T" />
                    </div>
                  </div>
                  <div className="border-b border-neutral-800 pb-6">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Active Operational Contracts</span>
                    <div className="text-3xl font-medium mt-2 text-white tabular-nums tracking-tight">
                      <Counter end={2} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Average Haul Cycle Time</span>
                    <div className="text-3xl font-medium mt-2 text-white tabular-nums tracking-tight">
                      <Counter end={38} suffix=" M" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block">Contract Target Margin</span>
                    <div className="text-3xl font-medium mt-2 text-[#C67A2B] tabular-nums tracking-tight">
                      <Counter end={30} suffix="%" />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-mono text-[10px]">SYNC: WEIGHBRIDGE_LIVE</span>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-neutral-300 font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    Live Reports
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Innovation / Why Choose Us Section */}
        <section id="innovation" className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 md:gap-24">
            <div className="lg:col-span-4 space-y-8">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400">
                NEXT-GEN INFRASTRUCTURE
              </span>
              <h2 className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-neutral-900 leading-tight">
                Safety, Electrification, Telemetry.
              </h2>
              <p className="font-sans text-neutral-500 text-lg leading-relaxed font-normal">
                We continually upgrade our mining fleet and technical stack. Incorporating advanced security and monitoring layers.
              </p>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-3 gap-6 font-sans">
              <div className="bg-white border border-neutral-200 p-8 flex flex-col justify-between h-72 hover:border-neutral-900 transition-colors group">
                <div className="w-10 h-10 border border-neutral-200 rounded-full flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-neutral-900">IoT Payload Verification</h4>
                  <p className="text-sm text-neutral-500 mt-3 font-normal leading-relaxed">Digital integration with weighbridge systems prevents manual tampering or tonase leakages.</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-8 flex flex-col justify-between h-72 hover:border-neutral-900 transition-colors group">
                <div className="w-10 h-10 border border-neutral-200 rounded-full flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-neutral-900">Route Speed Auditing</h4>
                  <p className="text-sm text-neutral-500 mt-3 font-normal leading-relaxed">Continuous GPS reporting tracks vehicle velocities dynamically to eliminate transit accidents.</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-8 flex flex-col justify-between h-72 hover:border-neutral-900 transition-colors group">
                <div className="w-10 h-10 border border-neutral-200 rounded-full flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-neutral-900">Electrification Roadmaps</h4>
                  <p className="text-sm text-neutral-500 mt-3 font-normal leading-relaxed">Actively testing heavy-duty electric trucks to minimize carbon impact on Indonesian mine sites.</p>
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
