"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Menu as MenuIcon, X, Smartphone, Network, Brain,
  CheckCircle2, Calendar, Mic, Camera, Upload, Repeat, Tag, BarChart3, Thermometer, Zap
} from "lucide-react";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setMobileNavOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home", "problems", "pillars", "benefits", 
        "executives", "numbers", "pricing"
      ];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen bg-[#0a0a0a] overflow-x-hidden">
        {/* LEFT NAVIGATION */}
        <nav className={`
          fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]
          border-r border-white/10 overflow-y-auto z-50
          transition-transform duration-300
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-8">
              <img 
                src="/checkit-checkit.png" 
                alt="Checkit V7 Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-white">Checkit V7</span>
            </Link>

            <ul className="space-y-1">
              <NavItem label="Home" section="home" active={activeSection === "home"} onClick={() => scrollToSection("home")} />
              <NavItem label="Problems We Solve" section="problems" active={activeSection === "problems"} onClick={() => scrollToSection("problems")} />
              <NavItem label="Three Pillars" section="pillars" active={activeSection === "pillars"} onClick={() => scrollToSection("pillars")} />
              <NavItem label="Benefits" section="benefits" active={activeSection === "benefits"} onClick={() => scrollToSection("benefits")} />
              <NavItem label="Why Executives Switch" section="executives" active={activeSection === "executives"} onClick={() => scrollToSection("executives")} />
              <NavItem label="The Numbers" section="numbers" active={activeSection === "numbers"} onClick={() => scrollToSection("numbers")} />
              <NavItem label="Pricing" section="pricing" active={activeSection === "pricing"} onClick={() => scrollToSection("pricing")} />
            </ul>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
              <Link href="/signup">
                <Button className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold">
                  Sign Up
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile nav toggle */}
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-[#1a1a1a] border border-white/20 rounded-lg p-3 text-white"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>

        {/* MAIN CONTENT */}
        <main className="flex-1 lg:ml-64 overflow-x-hidden w-full">
          <div className="min-h-screen text-white">

            {/* HERO */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
              <div className="absolute inset-0">
                <div className="absolute w-[1000px] h-[1000px] bg-[#c4dfc4]/5 rounded-full blur-3xl top-0 -left-40 animate-blob"></div>
                <div className="absolute w-[800px] h-[800px] bg-[#c8e0f5]/5 rounded-full blur-3xl bottom-0 -right-40 animate-blob animation-delay-2000"></div>
              </div>

              <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Multi-Site Operational Orchestration.<br />
                  <span className="text-[#c4dfc4]">Made Simple.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                  Migrate from paper forms and manual execution to modern workflows.<br />
                  Built for multi-site operations. Designed for frontline simplicity.
                </p>

                <div className="flex gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold text-lg px-8 py-6">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* PROBLEMS WE SOLVE */}
            <section id="problems" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
                  Eliminate the Problems You Have<br />
                  <span className="text-[#ff6b6b]">And the Ones You Don't Know About</span>
                </h2>
                <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                  Multi-site operations face critical challenges. Checkit solves them all.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <ProblemCard 
                    number="1"
                    title="Painful and time-consuming form creation"
                    description="Building checklists takes hours. Deployment across sites is chaos. Version control is a nightmare."
                  />
                  <ProblemCard 
                    number="2"
                    title="Limited or unstructured accountability"
                    description="Who did what, when? Impossible to track. Staff avoid responsibility. Managers can't verify completion."
                  />
                  <ProblemCard 
                    number="3"
                    title="Non-existent or singular access points of work execution"
                    description="One clipboard, one device, one bottleneck. Teams wait. Work stalls. Compliance slips."
                  />
                  <ProblemCard 
                    number="4"
                    title="Manual completion of tasks in checklists and more"
                    description="Every temperature written by hand. Every box checked manually. 25 minutes per checklist."
                  />
                  <ProblemCard 
                    number="5"
                    title="Tracking menu changes and real-time operational adjustments"
                    description="Menu changes? Update 50 forms. Seasonal items? Recreate everything. Exhausting and error-prone."
                  />
                  <ProblemCard 
                    number="6"
                    title="Ink-based food labeling"
                    description="Hand-written labels with illegible dates. Allergen mistakes. FIFO violations. Health dept citations."
                  />
                  <ProblemCard 
                    number="7"
                    title="Disconnected and cumbersome reporting"
                    description="Data scattered across clipboards, spreadsheets, emails. Hours to compile reports. Zero real-time visibility."
                  />
                  <ProblemCard 
                    number="8"
                    title="Non-existent or manual temperature logging"
                    description="Staff walk around with thermometers and clipboards. Logs fabricated at end of shift. No proof."
                  />
                </div>
              </div>
            </section>

            {/* THREE PILLARS - Blended with Problems */}
            <section id="pillars" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
                  Discover the Next Level of <span className="text-[#c4dfc4]">Excellence</span>
                </h2>
                <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                  Three pillars that transform how multi-site operations run.
                </p>

                {/* iPad image with hover effect and gradient background */}
                <div className="mb-16 max-w-4xl mx-auto">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c4dfc4]/20 via-[#c8e0f5]/10 to-[#ddc8f5]/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                    <img
                      src="/mockup-of-an-ipad-pro-against-a-transparent-background-23618.png"
                      alt="Checkit V7 on iPad Pro"
                      className="relative w-full h-auto transform group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Pillar 1 */}
                  <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-2xl p-8 text-center">
                    <Smartphone className="w-16 h-16 text-[#c4dfc4] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">Powerfully Simple</h3>
                    <p className="text-gray-400">
                      Mobile apps designed for frontline workers. Point, speak, done. Vision and audio intelligence 
                      eliminate typing and manual data entry. Simplicity at scale.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-2xl p-8 text-center">
                    <Network className="w-16 h-16 text-[#c8e0f5] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">Efficiently Scalable</h3>
                    <p className="text-gray-400">
                      Ingest data once, replicate workflows instantly across all locations, departments, and groups. 
                      One-click deployment to 100+ sites. Centralized control, distributed execution.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-[#0a0a0a] border border-[#ddc8f5]/30 rounded-2xl p-8 text-center">
                    <Brain className="w-16 h-16 text-[#ddc8f5] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">Predictably Intelligent</h3>
                    <p className="text-gray-400">
                      AI-powered insights across people, places, and things. Predict violations, optimize workflows, 
                      and eliminate surprises. Intelligence that learns your operation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* BENEFITS - Stacked Layout */}
            <section id="benefits" className="py-24 md:py-32 bg-[#0a0a0a]">
              <div className="max-w-5xl mx-auto px-6 space-y-12">
                
                {/* Benefit 1 - Conversational Builder */}
                <div className="bg-gradient-to-br from-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-2xl p-8 md:p-10">
                  <div className="mb-6">
                    <div className="flex gap-3 mb-4">
                      <Zap className="w-10 h-10 text-[#c4dfc4]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Create Robust Frontline Checklists Conversationally with Ease</h3>
                    <p className="text-lg text-gray-300">
                      Create and deploy checklists in 30 seconds using natural language. "Create me a 10-question morning food safety checklist and schedule it daily at 7 AM across all locations." Done. Deployed. 160x faster than traditional methods.
                    </p>
                  </div>
                  <img
                    src="/1b.png"
                    alt="Create Robust Frontline Checklists Conversationally with Ease"
                    className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                  />
                </div>

                {/* Benefit 2 - Audio & Vision */}
                <div className="bg-gradient-to-br from-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-2xl p-8 md:p-10">
                  <div className="mb-6">
                    <div className="flex gap-3 mb-4">
                      <Camera className="w-10 h-10 text-[#c8e0f5]" />
                      <Mic className="w-10 h-10 text-[#c8e0f5]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Enable Frontline Workers to Complete Checks Using Voice and Vision Automation</h3>
                    <p className="text-lg text-gray-300">
                      Point camera, speak reading—form auto-fills with photo evidence attached. No typing, no clipboards. 94% time reduction. Voice-to-text in 20+ languages. OCR reads gauges, thermometers, meters automatically. Complete audit trail with timestamped photos.
                    </p>
                  </div>
                  <img
                    src="/4.vision.png"
                    alt="Enable frontline workers with voice and vision automation"
                    className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                  />
                </div>

                {/* Benefit 3 - White Labeled Reporting */}
                <div className="bg-gradient-to-br from-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-2xl p-8 md:p-10">
                  <div className="mb-6">
                    <div className="flex gap-3 mb-4">
                      <BarChart3 className="w-10 h-10 text-[#ddc8f5]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Deliver Beautifully Curated Reports White Labeled to Your Stakeholders</h3>
                    <p className="text-lg text-gray-300">
                      Branded dashboards and reports with your logo, colors, and domain. Live compliance scores, task completion, violations, trends—across all locations. Export with one click. Share with stakeholders under your brand. Full customization for enterprise operations.
                    </p>
                  </div>
                  <img
                    src="/7.whitelabeling.png"
                    alt="Deliver beautifully curated white labeled reports"
                    className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                  />
                </div>

                {/* Benefit 4 - Temperature Monitoring (Text Left, Image Right) */}
                <div className="bg-gradient-to-br from-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-2xl p-8 md:p-10">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex gap-3 mb-4">
                        <Thermometer className="w-10 h-10 text-[#f5edc8]" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Monitor & Automate Operational Data Collection Across Dozens of Data Sources</h3>
                      <p className="text-lg text-gray-300">
                        Wireless sensors check temps every 15 minutes, automatically. Alerts sent instantly when thresholds are exceeded. No manual logs. No fabricated data. 5-year battery life. FDA/HACCP compliant. Predict equipment failures before they happen.
                      </p>
                    </div>
                    <div>
                      <img
                        src="/7a.webp"
                        alt="Automated operational data monitoring"
                        className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* WHY EXECUTIVES ARE SWITCHING */}
            <section id="executives" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
              <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
                  Why Executives Are Switching to Checkit
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">The Old Way</h3>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b6b]">✗</span>
                        <span>47 hours/week wasted per location on paperwork</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b6b]">✗</span>
                        <span>23% average compliance gap rate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b6b]">✗</span>
                        <span>Zero real-time visibility across locations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b6b]">✗</span>
                        <span>Managers spend 40% of time on admin vs leadership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff6b6b]">✗</span>
                        <span>$2,847/month lost per location to inefficiency</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4]/30 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">With Checkit V7</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                        <span>94% reduction in manual work time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                        <span>Near-perfect compliance with photo evidence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                        <span>Live dashboards showing all locations instantly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                        <span>Managers focus on operations, not paperwork</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                        <span>12% average bottom line improvement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* THE NUMBERS DON'T LIE */}
            <section id="numbers" className="py-24 md:py-32 bg-[#1a1a1a]">
              <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
                  The Numbers Don't Lie
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4]/30 rounded-xl p-8 text-center">
                    <div className="text-5xl font-bold text-[#c4dfc4] mb-2">160x</div>
                    <div className="text-gray-400">Faster than manual methods</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#c8e0f5]/20 to-transparent border border-[#c8e0f5]/30 rounded-xl p-8 text-center">
                    <div className="text-5xl font-bold text-[#c8e0f5] mb-2">30 sec</div>
                    <div className="text-gray-400">To create & deploy checklists</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#ddc8f5]/20 to-transparent border border-[#ddc8f5]/30 rounded-xl p-8 text-center">
                    <div className="text-5xl font-bold text-[#ddc8f5] mb-2">2 min</div>
                    <div className="text-gray-400">Menu to printed FDA labels</div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white mb-4">
                    For a 10-location operation:
                  </p>
                  <p className="text-6xl font-bold text-[#c4dfc4] mb-4">$411K</p>
                  <p className="text-xl text-gray-400">
                    Net annual savings from labor efficiency, reduced waste, and prevented violations.
                  </p>
                </div>
              </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
                  Start free. Scale as you grow. Enterprise pricing for large operations.
                </p>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                    <p className="text-gray-400 mb-6">Get started, no credit card</p>
                    <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>1 location</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Unlimited checklists</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Vision & audio capture</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Basic reporting</span>
                      </li>
                    </ul>
                    <Link href="/signup">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Get Started
                      </Button>
                    </Link>
                  </div>

                  {/* Pro Tier */}
                  <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border-2 border-[#c4dfc4] rounded-2xl p-8 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#c4dfc4] text-[#0a0a0a] px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <p className="text-gray-400 mb-6">For growing operations</p>
                    <div className="text-4xl font-bold text-white mb-6">$499<span className="text-lg text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Up to 10 locations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Everything in Free</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>IoT sensor integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Label printing integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Link href="/signup">
                      <Button className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </div>

                  {/* Enterprise Tier */}
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                    <p className="text-gray-400 mb-6">For large operations</p>
                    <div className="text-4xl font-bold text-white mb-6">Custom</div>
                    <ul className="space-y-3 mb-8 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Unlimited locations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Everything in Pro</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Predictive AI insights</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Custom integrations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>White-label options</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c4dfc4]" />
                        <span>Dedicated success manager</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 md:py-32 bg-[#0a0a0a]">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                  Transform Your<br />
                  <span className="text-[#c4dfc4]">Multi-Site Operations</span>
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-12">
                  Join operations leaders who've eliminated paperwork, improved compliance, and saved millions.
                </p>

                <div className="flex gap-4 justify-center mb-12">
                  <Link href="/signup">
                    <Button size="lg" className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold text-lg px-8 py-6">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6">
                      Sign In
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Currently in development</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Early access notification</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>No spam, ever</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
}

function NavItem({ label, section, active, onClick }: {
  label: string;
  section: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`
          w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
          ${active 
            ? 'bg-[#c4dfc4]/20 text-[#c4dfc4] border-l-2 border-[#c4dfc4]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }
        `}
      >
        {label}
      </button>
    </li>
  );
}

function ProblemCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#ff6b6b]/30 rounded-xl p-6 hover:border-[#ff6b6b]/50 transition-all">
      <div className="flex items-start gap-4">
        <div className="bg-[#ff6b6b]/20 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-[#ff6b6b] font-bold">{number}</span>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

