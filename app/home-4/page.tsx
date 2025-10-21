"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Menu as MenuIcon, X, Radio, Smartphone, Layers, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function PlatformHomePage() {
  const [activeSection, setActiveSection] = useState("hero");
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
        "hero", "platform", "sensors", "app", "asset-intelligence", 
        "workflows", "industries", "integration"
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
    <div className="flex min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* LEFT NAVIGATION */}
      <nav className={`
        fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]
        border-r border-white/10 overflow-y-auto z-50
        transition-transform duration-300
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Checkit V7</h1>
            <p className="text-xs text-[#c4dfc4] mt-1">Platform + Sensors + App</p>
          </div>

          <ul className="space-y-1">
            <NavItem label="Overview" section="hero" active={activeSection === "hero"} onClick={() => scrollToSection("hero")} />
            <NavItem label="The Platform" section="platform" active={activeSection === "platform"} onClick={() => scrollToSection("platform")} />
            <NavItem label="High-Grade Sensors" section="sensors" active={activeSection === "sensors"} onClick={() => scrollToSection("sensors")} />
            <NavItem label="Mobile Apps" section="app" active={activeSection === "app"} onClick={() => scrollToSection("app")} />
            <NavItem label="Asset Intelligence" section="asset-intelligence" active={activeSection === "asset-intelligence"} onClick={() => scrollToSection("asset-intelligence")} />
            <NavItem label="Digital Workflows" section="workflows" active={activeSection === "workflows"} onClick={() => scrollToSection("workflows")} />
            <NavItem label="Industries" section="industries" active={activeSection === "industries"} onClick={() => scrollToSection("industries")} />
            <NavItem label="Integration" section="integration" active={activeSection === "integration"} onClick={() => scrollToSection("integration")} />
          </ul>

          <div className="mt-8 pt-8 border-t border-white/10">
            <Link href="/forms/builder">
              <Button className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-bold">
                Start Free
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

          {/* Hero */}
          <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute w-[1000px] h-[1000px] bg-[#c4dfc4]/5 rounded-full blur-3xl top-0 -left-40 animate-blob"></div>
              <div className="absolute w-[800px] h-[800px] bg-[#c8e0f5]/5 rounded-full blur-3xl bottom-0 -right-40 animate-blob animation-delay-2000"></div>
              <div className="absolute w-[600px] h-[600px] bg-[#ddc8f5]/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
              <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-6 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-[#c4dfc4]" />
                <span className="text-[#c4dfc4] text-sm font-medium">Real-Time Visibility & Control</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                Scalable, predictable<br />
                <span className="text-[#c4dfc4]">operations.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Our platform integrates high-grade sensors and mobile apps to automate monitoring, 
                digitize workflows, and unlock predictive insights—reducing waste, ensuring compliance, 
                and improving your bottom line.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Button 
                  onClick={() => scrollToSection("platform")}
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-10 py-7 text-xl font-bold rounded-lg shadow-2xl"
                >
                  See the Platform <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>

              {/* Three Pillars */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-xl p-6 text-left">
                  <Layers className="w-10 h-10 text-[#c4dfc4] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Platform</h3>
                  <p className="text-sm text-gray-400">
                    Real-time visibility into critical assets and operational tasks across all locations
                  </p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#c8e0f5]/30 rounded-xl p-6 text-left">
                  <Radio className="w-10 h-10 text-[#c8e0f5] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Sensors</h3>
                  <p className="text-sm text-gray-400">
                    High-grade sensors capturing temperature, humidity, motion, and comprehensive traceability
                  </p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#ddc8f5]/30 rounded-xl p-6 text-left">
                  <Smartphone className="w-10 h-10 text-[#ddc8f5] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Mobile Apps</h3>
                  <p className="text-sm text-gray-400">
                    Digitized workflows with vision & audio intelligence, guiding workers through standardized practices
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* The Platform */}
          <section id="platform" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-4 py-2 mb-6">
                <Layers className="w-4 h-4 text-[#c4dfc4]" />
                <span className="text-[#c4dfc4] text-sm font-medium">Operational Control</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                The Platform:<br />
                <span className="text-[#c4dfc4]">Real-Time Visibility Across Every Asset</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl leading-relaxed">
                Checkit V7 provides centralized command and control over critical assets and operational 
                tasks. Real-time dashboards, predictive alerts, and automated reporting transform raw data 
                into actionable intelligence.
              </p>

              <div className="mb-16">
                <img
                  src="/1.home.png"
                  alt="Checkit V7 Platform Dashboard - Real-time operational visibility"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Real-Time Monitoring</h3>
                  <p className="text-gray-400 mb-6">
                    Monitor all critical assets across multiple locations from a single dashboard. 
                    Temperature, humidity, equipment status, task completion—everything in real-time.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">✓</span>
                      <span>Live sensor data from all locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">✓</span>
                      <span>Automated alerts when thresholds are exceeded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">✓</span>
                      <span>Historical trend analysis & reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">✓</span>
                      <span>Multi-location compliance scoring</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] border border-[#ddc8f5]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Predictive Intelligence</h3>
                  <p className="text-gray-400 mb-6">
                    AI-powered insights predict equipment failures, compliance gaps, and operational 
                    risks 48-72 hours in advance—giving you time to act before problems occur.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">✓</span>
                      <span>Equipment failure predictions based on sensor data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">✓</span>
                      <span>Compliance risk forecasting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">✓</span>
                      <span>Automated corrective action recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">✓</span>
                      <span>Pattern recognition across all locations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* High-Grade Sensors */}
          <section id="sensors" className="py-24 md:py-32 bg-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-4 py-2 mb-6">
                <Radio className="w-4 h-4 text-[#c8e0f5]" />
                <span className="text-[#c8e0f5] text-sm font-medium">Continuous Monitoring</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                High-Grade Sensors: Comprehensive Data Capture
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Our wireless sensors capture critical environmental data 24/7, ensuring continuous 
                monitoring and comprehensive product traceability. Purpose-built for regulated environments.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-4">🌡️</div>
                  <h4 className="font-semibold text-white mb-2">Temperature Monitoring</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Precision temperature sensors (±0.1°C accuracy) for refrigeration, freezers, 
                    hot-hold units, and ambient storage. Continuous logging, instant alerts.
                  </p>
                  <div className="text-xs text-[#c8e0f5]">
                    • Every 15 minutes, 24/7<br />
                    • 5-year battery life<br />
                    • FDA/HACCP compliant
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-4">💧</div>
                  <h4 className="font-semibold text-white mb-2">Humidity Sensors</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Monitor ambient humidity levels in storage areas, production zones, and cold rooms. 
                    Prevent mold, maintain product quality.
                  </p>
                  <div className="text-xs text-[#c8e0f5]">
                    • ±2% RH accuracy<br />
                    • Wireless, battery-powered<br />
                    • Real-time alerts
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-4">📍</div>
                  <h4 className="font-semibold text-white mb-2">Motion & Proximity</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Track asset movement, door open/close cycles, equipment usage patterns. 
                    Comprehensive traceability from receiving to service.
                  </p>
                  <div className="text-xs text-[#c8e0f5]">
                    • Movement detection<br />
                    • RFID integration<br />
                    • Asset tracking
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#c8e0f5]/10 to-transparent border border-[#c8e0f5]/30 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-white mb-4">Sensor Network Features:</h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
                  <div>
                    <p className="mb-2"><strong className="text-white">Wireless Installation:</strong> No wiring, no electricians. Stick-and-go deployment in minutes.</p>
                    <p className="mb-2"><strong className="text-white">Long Battery Life:</strong> 3-5 year battery life means minimal maintenance.</p>
                    <p><strong className="text-white">Cloud Connectivity:</strong> All sensor data automatically synced to platform in real-time.</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong className="text-white">Automatic Calibration:</strong> Sensors self-calibrate and alert when maintenance needed.</p>
                    <p className="mb-2"><strong className="text-white">Audit-Ready:</strong> All data timestamped, tamper-proof, and stored for regulatory compliance.</p>
                    <p><strong className="text-white">Scalable:</strong> Add unlimited sensors as your operation grows.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Apps */}
          <section id="app" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-full px-4 py-2 mb-6">
                <Smartphone className="w-4 h-4 text-[#ddc8f5]" />
                <span className="text-[#ddc8f5] text-sm font-medium">Digital Workflows</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Mobile Apps: Digitize Workflows, Eliminate Paperwork
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Our mobile apps guide workers through standardized practices, capture essential data 
                with vision and audio intelligence, and transform tasks into actionable datasets—all 
                while ensuring consistent compliance.
              </p>

              <div className="mb-12">
                <img
                  src="/4.vision.png"
                  alt="Mobile app with vision and audio intelligence"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#1a1a1a] border border-[#ddc8f5]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Vision-Based Data Capture</h3>
                  <p className="text-gray-400 mb-6">
                    Point your camera at equipment, speak the reading—the app auto-fills forms with 
                    photo evidence attached. No typing, no clipboards, 94% time reduction.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">→</span>
                      <span>OCR reads temperatures, gauges, meters automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">→</span>
                      <span>Photo evidence attached to every check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">→</span>
                      <span>Timestamped, GPS-verified, tamper-proof</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ddc8f5]">→</span>
                      <span>Works offline, syncs when back online</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Audio Intelligence</h3>
                  <p className="text-gray-400 mb-6">
                    Hands-free data entry using voice-to-text transcription. Speak naturally, system 
                    logs it. Multi-language support, works in noisy environments.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">→</span>
                      <span>Context-aware transcription (understands jargon)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">→</span>
                      <span>Spanish, French, Mandarin, 20+ languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">→</span>
                      <span>Noise-canceling AI isolates voice from background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c4dfc4]">→</span>
                      <span>Instant logging, no manual typing needed</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#ddc8f5]/10 to-transparent border border-[#ddc8f5]/30 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-white mb-4">Guided Workflows & Standardized Practices:</h4>
                <p className="text-gray-400 mb-6">
                  Apps walk workers step-by-step through procedures, ensuring consistent execution 
                  across all shifts and locations. Checklists, SOPs, corrective actions—all digitized.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#ddc8f5] font-semibold mb-2">Step-by-Step</p>
                    <p className="text-gray-400">Guided workflows prevent skipped steps</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#ddc8f5] font-semibold mb-2">Actionable Datasets</p>
                    <p className="text-gray-400">Every task becomes analyzable data</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#ddc8f5] font-semibold mb-2">Real-Time Sync</p>
                    <p className="text-gray-400">Dashboard updates instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Asset Intelligence */}
          <section id="asset-intelligence" className="py-24 md:py-32 bg-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-full px-4 py-2 mb-6">
                <TrendingUp className="w-4 h-4 text-[#f5edc8]" />
                <span className="text-[#f5edc8] text-sm font-medium">Proactive Maintenance</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Asset Intelligence: Predict Failures, Prevent Downtime
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                By analyzing sensor data patterns, our platform predicts equipment failures before they 
                happen—allowing for proactive maintenance that minimizes downtime and safeguards critical assets.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#1a1a1a] border border-[#f5edc8]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Predictive Maintenance</h3>
                  <div className="bg-[#0a0a0a] rounded-lg p-6 mb-4">
                    <p className="text-[#ff6b6b] font-semibold mb-2">⚠️ ASSET ALERT</p>
                    <p className="text-white font-medium mb-3">
                      Walk-in Cooler #2: Compressor degradation detected
                    </p>
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p>• Temperature variance increased 12% over 7 days</p>
                      <p>• Energy consumption up 8%</p>
                      <p>• Pattern matches 89% probability of failure within 72 hours</p>
                    </div>
                    <div className="bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded p-3">
                      <p className="text-xs text-[#f5edc8] font-semibold mb-2">RECOMMENDED ACTION:</p>
                      <p className="text-xs text-gray-300">Schedule immediate HVAC inspection. Maintenance vendor auto-notified.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#c8e0f5]/30 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Benefits</h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#c8e0f5] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white mb-1">Prevent Food Loss</p>
                        <p className="text-sm text-gray-400">Catch equipment issues before $15K+ of inventory spoils</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#c8e0f5] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white mb-1">Minimize Downtime</p>
                        <p className="text-sm text-gray-400">Schedule repairs during off-hours, avoid emergency shutdowns</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#c8e0f5] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white mb-1">Extend Asset Life</p>
                        <p className="text-sm text-gray-400">Proactive maintenance extends equipment lifespan 30-40%</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#c8e0f5] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white mb-1">Lower Energy Costs</p>
                        <p className="text-sm text-gray-400">Optimize equipment performance, reduce energy waste</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Digital Workflows */}
          <section id="workflows" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Digitize Workflows, Eliminate Paper
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Replace clipboards, spreadsheets, and binders with intelligent digital workflows. 
                Checklists, inspections, audits, corrective actions—all automated, guided, and audit-ready.
              </p>

              <div className="mb-12">
                <img
                  src="/1a.convoforms.png"
                  alt="Conversational form builder creating digital workflows"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">💬</div>
                  <h4 className="font-semibold text-white mb-2">Conversational Builder</h4>
                  <p className="text-sm text-gray-400">
                    "Create a 10-question morning food safety checklist, deploy to all locations at 7 AM daily." 
                    Done in 30 seconds. No formatting, no templates.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-semibold text-white mb-2">Task Management</h4>
                  <p className="text-sm text-gray-400">
                    Assign tasks, set deadlines, track completion. Automated escalation when deadlines are missed. 
                    Full accountability chain.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-semibold text-white mb-2">Compliance Reporting</h4>
                  <p className="text-sm text-gray-400">
                    Automated reports for health inspections, internal audits, corporate review. 
                    One-click export to PDF, Excel, or API.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Industries */}
          <section id="industries" className="py-24 md:py-32 bg-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
                Built for Regulated Environments
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
                Whether you're managing food safety, healthcare compliance, or pharmaceutical operations, 
                our platform adapts to your industry's unique requirements.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-xl p-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Food Service & Safety</h3>
                  <p className="text-gray-400 mb-6">
                    Senior living, hospitals, schools, stadiums, corporate dining—comprehensive HACCP compliance, 
                    FDA-ready reporting, allergen management, and automated temperature logging.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-3 py-1 text-xs text-[#c4dfc4]">HACCP</span>
                    <span className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-3 py-1 text-xs text-[#c4dfc4]">FDA</span>
                    <span className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-3 py-1 text-xs text-[#c4dfc4]">Health Dept</span>
                    <span className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-3 py-1 text-xs text-[#c4dfc4]">Allergen Tracking</span>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-8">
                  <div className="text-4xl mb-4">🏥</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Healthcare & Medical</h3>
                  <p className="text-gray-400 mb-6">
                    Skilled nursing, assisted living, hospitals—patient safety protocols, medication verification, 
                    vital signs capture, state survey readiness, and infection control compliance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-3 py-1 text-xs text-[#c8e0f5]">CMS</span>
                    <span className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-3 py-1 text-xs text-[#c8e0f5]">Joint Commission</span>
                    <span className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-3 py-1 text-xs text-[#c8e0f5]">State Survey</span>
                    <span className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-3 py-1 text-xs text-[#c8e0f5]">Infection Control</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integration */}
          <section id="integration" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Seamless Integration</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Integrates With Your Existing Stack
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Checkit doesn't replace your systems—it connects them. POS, inventory, EHR, facility 
                management, label printers—all integrated seamlessly.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <IntegrationCard icon="🍕" title="POS Systems" items={["Toast", "Square", "Clover"]} />
                <IntegrationCard icon="📦" title="Inventory" items={["MarketMan", "BlueCart", "ChefTec"]} />
                <IntegrationCard icon="🏥" title="EHR/EMR" items={["Epic", "Cerner", "Allscripts"]} />
                <IntegrationCard icon="🖨️" title="Label Printers" items={["Zebra", "Brother", "Dymo"]} />
                <IntegrationCard icon="🏢" title="Facilities" items={["ServiceChannel", "Facilio"]} />
                <IntegrationCard icon="👥" title="HR & Scheduling" items={["7shifts", "Homebase", "Deputy"]} />
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center">
                <h4 className="text-2xl font-bold text-white mb-4">Open API + Webhooks</h4>
                <p className="text-lg text-gray-400">
                  REST API, real-time webhooks, and data streams. Build custom integrations with your 
                  proprietary systems, legacy software, or internal tools.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24 md:py-32 bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Transform Your Operations.<br />
                <span className="text-[#c4dfc4]">Start Free Today.</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Platform + Sensors + Apps. Real-time visibility, predictive intelligence, and digitized 
                workflows that reduce waste, ensure compliance, and improve your bottom line.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link href="/forms/builder">
                  <Button className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-12 py-7 text-xl font-bold rounded-lg shadow-2xl">
                    Start Free Now <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>Free tier forever</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>30-second setup</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
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

function IntegrationCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 hover:border-[#c4dfc4]/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h5 className="font-semibold text-white text-sm">{title}</h5>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span key={item} className="text-xs text-gray-500">{item}</span>
        ))}
      </div>
    </div>
  );
}

