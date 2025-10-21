"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Menu as MenuIcon, X } from "lucide-react";
import Link from "next/link";

export default function VisionHome() {
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
        "hero", "vision", "predictive", "vision-everywhere", 
        "voice-native", "iot-mesh", "connected-ecosystem", 
        "ambient-intelligence", "timeline"
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
            <p className="text-xs text-[#c4dfc4] mt-1">The Future Vision</p>
          </div>

          <ul className="space-y-1">
            <NavItem label="Vision" section="vision" active={activeSection === "vision"} onClick={() => scrollToSection("vision")} />
            <NavItem label="Predictive Compliance" section="predictive" active={activeSection === "predictive"} onClick={() => scrollToSection("predictive")} />
            <NavItem label="Vision Everywhere" section="vision-everywhere" active={activeSection === "vision-everywhere"} onClick={() => scrollToSection("vision-everywhere")} />
            <NavItem label="Voice-Native Interface" section="voice-native" active={activeSection === "voice-native"} onClick={() => scrollToSection("voice-native")} />
            <NavItem label="IoT Sensor Mesh" section="iot-mesh" active={activeSection === "iot-mesh"} onClick={() => scrollToSection("iot-mesh")} />
            <NavItem label="Connected Ecosystem" section="connected-ecosystem" active={activeSection === "connected-ecosystem"} onClick={() => scrollToSection("connected-ecosystem")} />
            <NavItem label="Ambient Intelligence" section="ambient-intelligence" active={activeSection === "ambient-intelligence"} onClick={() => scrollToSection("ambient-intelligence")} />
            <NavItem label="Timeline" section="timeline" active={activeSection === "timeline"} onClick={() => scrollToSection("timeline")} />
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
        {/* HERO */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute w-[1000px] h-[1000px] bg-[#c4dfc4]/5 rounded-full blur-3xl top-0 -left-40 animate-blob"></div>
            <div className="absolute w-[800px] h-[800px] bg-[#c8e0f5]/5 rounded-full blur-3xl bottom-0 -right-40 animate-blob animation-delay-2000"></div>
            <div className="absolute w-[600px] h-[600px] bg-[#ddc8f5]/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-6 py-2 mb-8">
              <div className="w-2 h-2 bg-[#c4dfc4] rounded-full animate-pulse"></div>
              <span className="text-[#c4dfc4] text-sm font-medium">The Future of Food Safety</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
              Imagine food safety<br />
              that <span className="text-[#c4dfc4]">just happens</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              No checklists. No clipboards. No manual logs. Just continuous, intelligent, 
              autonomous compliance that predicts violations before they occur.
            </p>

            <Button 
              onClick={() => scrollToSection("vision")}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-10 py-7 text-xl font-bold rounded-lg shadow-2xl"
            >
              See What's Possible <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </section>

        {/* THE VISION */}
        <section id="vision" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              The vision: <span className="text-[#c4dfc4]">Zero-touch compliance</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              We're building toward a future where food safety operations run themselves. 
              Where sensors, vision systems, and AI work together to monitor, document, 
              and optimize every aspect of compliance—continuously, autonomously, invisibly.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#0a0a0a]/60 border border-[#c4dfc4]/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Today (2025)</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span>Vision + voice capture reduces manual work 94%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span>Conversational form builder deploys in 30 seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span>Menu intelligence auto-generates FDA labels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span>Real-time dashboards across all locations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-[#c8e0f5]/20 border border-[#c4dfc4] rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Tomorrow (2026-2027)</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0">✨</div>
                    <span><strong className="text-white">Predictive compliance:</strong> AI forecasts violations 48 hours early</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0">👁️</div>
                    <span><strong className="text-white">Ambient vision:</strong> Ceiling cameras monitor continuously</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0">🌡️</div>
                    <span><strong className="text-white">IoT sensor mesh:</strong> Every surface, every fridge, always watching</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0">🤖</div>
                    <span><strong className="text-white">Autonomous corrections:</strong> System fixes problems before humans notice</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PREDICTIVE COMPLIANCE */}
        <section id="predictive" className="py-24 md:py-32 bg-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#ddc8f5] text-sm font-medium">Coming 2026</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Predictive Compliance AI
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl">
              Stop reacting to violations. Start preventing them. Machine learning models analyze 
              historical patterns, seasonal trends, and real-time data to predict compliance risks 
              48-72 hours before they materialize.
            </p>

            <div className="bg-[#0a0a0a] border border-[#ddc8f5]/30 rounded-2xl p-8 md:p-12 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">How it works:</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#ddc8f5]/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Pattern Recognition</h4>
                    <p className="text-gray-400">
                      AI analyzes months of compliance data across all your locations, learning which 
                      conditions precede violations. Staff shortages on Mondays? Temp spikes before holidays? 
                      The system sees patterns humans miss.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#ddc8f5]/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Early Warning System</h4>
                    <p className="text-gray-400">
                      When conditions align with historical violation patterns, you get alerts 48+ hours 
                      in advance. "Location 7: High risk of cold storage violation this Friday based on 
                      equipment age, recent temp fluctuations, and staffing patterns."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#ddc8f5]/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Suggested Interventions</h4>
                    <p className="text-gray-400">
                      System doesn't just warn—it prescribes. "Schedule equipment inspection, add checklist 
                      for Friday opening shift, increase monitoring frequency for cold storage unit #3." 
                      One-click deployment of preventive measures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#ddc8f5] mb-2">87%</div>
                <p className="text-sm text-gray-400">Reduction in surprise violations (pilot data)</p>
              </div>
              <div className="bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#ddc8f5] mb-2">48hrs</div>
                <p className="text-sm text-gray-400">Average prediction lead time</p>
              </div>
              <div className="bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#ddc8f5] mb-2">$340K</div>
                <p className="text-sm text-gray-400">Avg. annual savings from prevented violations</p>
              </div>
            </div>
          </div>
        </section>

          {/* VISION EVERYWHERE */}
          <section id="vision-everywhere" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-4 py-2 mb-6">
                <span className="text-[#c8e0f5] text-sm font-medium">Hardware + AI</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ambient Vision Systems
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Imagine walking into your kitchen and compliance just... happens. Ceiling-mounted cameras 
                with edge AI watch everything, document everything, catch everything—without anyone thinking about it.
              </p>

              <div className="mb-12">
                <img
                  src="/4.vision.png"
                  alt="Vision-based ambient monitoring system"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">What it sees:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">👨‍🍳</div>
                    <span><strong className="text-white">Staff compliance:</strong> Hairnets, gloves, handwashing, proper uniform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🧹</div>
                    <span><strong className="text-white">Cleanliness:</strong> Surface sanitization, spill response time, cleanup protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🥘</div>
                    <span><strong className="text-white">Food handling:</strong> Temperature probing, cross-contamination, proper storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">⏱️</div>
                    <span><strong className="text-white">Time tracking:</strong> How long food sits out, prep-to-serve timing, FIFO rotation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🚪</div>
                    <span><strong className="text-white">Traffic patterns:</strong> Peak times, workflow bottlenecks, efficiency opportunities</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">What it does:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">📹</div>
                    <span><strong className="text-white">Continuous documentation:</strong> Every checklist item auto-verified with timestamped video evidence</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🔔</div>
                    <span><strong className="text-white">Real-time alerts:</strong> Immediate notification if staff forgets gloves, food sits too long, spill goes unaddressed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">📊</div>
                    <span><strong className="text-white">Automatic reporting:</strong> Daily compliance summaries, trend analysis, violation predictions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🎓</div>
                    <span><strong className="text-white">Training insights:</strong> Identifies which staff need retraining on which protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="text-[#c8e0f5] mt-1">🏆</div>
                    <span><strong className="text-white">Performance benchmarks:</strong> Compare locations, reward best performers, identify improvement opportunities</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-xl p-6 text-center">
              <p className="text-lg text-white">
                <strong>Privacy-first design:</strong> <span className="text-gray-400">On-device processing, no cloud storage of video, 
                compliance-focused triggers only, full staff transparency</span>
              </p>
            </div>
          </div>
        </section>

        {/* VOICE-NATIVE INTERFACE */}
        <section id="voice-native" className="py-24 md:py-32 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#c4dfc4] text-sm font-medium">Natural Language Everything</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Voice-Native Operations
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl">
              Forget interfaces. Just talk. Voice AI that understands context, intent, and industry nuance. 
              Manage your entire operation conversationally—while driving, while cooking, while walking the floor.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-2xl p-8">
                <div className="text-3xl mb-4">🎤</div>
                <h3 className="text-xl font-bold text-white mb-4">You say:</h3>
                <div className="space-y-4">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <p className="text-gray-300 italic">
                      "Show me all locations where morning checklists weren't completed on time this week"
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <p className="text-gray-300 italic">
                      "Create a new allergen training checklist and deploy it to locations 3, 7, and 12 starting Monday"
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <p className="text-gray-300 italic">
                      "Why is Location 5's compliance score dropping? What happened last Tuesday?"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-2xl p-8">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-white mb-4">It does:</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Understands context:</strong> Knows your locations, your schedules, your team, your history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Takes action:</strong> Creates forms, schedules checks, sends alerts, generates reports—instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Explains insights:</strong> "Score dropped because 3 temp checks were missed on Tuesday due to equipment downtime"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c4dfc4] mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Suggests solutions:</strong> "Should I schedule maintenance and add backup equipment checks?"</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-[#c4dfc4]/20 to-[#c8e0f5]/20 border border-[#c4dfc4]/30 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-white mb-4">Beyond English:</h4>
              <p className="text-gray-300 mb-4">
                Real-time translation for multilingual teams. Spanish-speaking staff can complete checklists 
                in Spanish, managers review in English, reports generate in any language. No barriers.
              </p>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'Mandarin', 'Japanese', 'Korean', 'Vietnamese', 'Portuguese'].map(lang => (
                  <span key={lang} className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-3 py-1 text-sm text-[#c4dfc4]">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* IOT SENSOR MESH */}
        <section id="iot-mesh" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#f5edc8] text-sm font-medium">IoT + Edge Computing</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Intelligent Sensor Mesh
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl">
              Hundreds of tiny, wireless sensors create a living map of your kitchen. Temperature, humidity, 
              proximity, motion, pressure—everything measured, everything connected, everything learning.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#0a0a0a] border border-[#f5edc8]/30 rounded-xl p-6">
                <div className="text-3xl mb-3">🌡️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Climate Sensors</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Every fridge, freezer, prep surface, storage area continuously monitored. 
                  AI predicts equipment failures before they happen.
                </p>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>• Temperature (±0.1°C accuracy)</li>
                  <li>• Humidity levels</li>
                  <li>• Door open/close cycles</li>
                  <li>• Compressor performance</li>
                </ul>
              </div>

              <div className="bg-[#0a0a0a] border border-[#f5edc8]/30 rounded-xl p-6">
                <div className="text-3xl mb-3">📍</div>
                <h4 className="text-lg font-semibold text-white mb-2">Proximity Sensors</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Track food movement from receiving to service. Know exactly where every 
                  item is, how long it's been there, when it expires.
                </p>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>• RFID-enabled containers</li>
                  <li>• Automatic FIFO rotation</li>
                  <li>• Expiration alerts</li>
                  <li>• Usage pattern analysis</li>
                </ul>
              </div>

              <div className="bg-[#0a0a0a] border border-[#f5edc8]/30 rounded-xl p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="text-lg font-semibold text-white mb-2">Smart Surfaces</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Prep tables, cutting boards, and storage shelves that sense weight, 
                  detect contamination, and verify sanitization.
                </p>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>• Weight sensors for inventory</li>
                  <li>• Contamination detection</li>
                  <li>• Sanitization verification</li>
                  <li>• Usage time tracking</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">The Self-Healing Kitchen</h3>
              <p className="text-lg text-gray-300 mb-6">
                When sensors detect issues, the system doesn't just alert—it acts:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">🔴 <strong className="text-white">Problem detected:</strong> Freezer temp rising</p>
                  <p className="text-gray-400">✅ <strong className="text-[#c4dfc4]">System response:</strong> Alerts staff, schedules emergency maintenance, redirects new storage to backup unit, tracks affected inventory</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">🔴 <strong className="text-white">Problem detected:</strong> Food sitting out too long</p>
                  <p className="text-gray-400">✅ <strong className="text-[#c4dfc4]">System response:</strong> Alerts kitchen manager, starts countdown timer on display, auto-logs for compliance, suggests corrective action</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTED ECOSYSTEM */}
        <section id="connected-ecosystem" className="py-24 md:py-32 bg-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The Connected Ecosystem
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl">
              Checkit becomes the central nervous system, integrating with every tool in your tech stack. 
              One platform orchestrating your entire operation.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">🍕</div>
                <h4 className="font-semibold text-white mb-2">POS Integration</h4>
                <p className="text-sm text-gray-400">
                  Toast, Square, Clover—menu changes sync automatically. New dish on POS? 
                  Prep labels generate instantly.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">📦</div>
                <h4 className="font-semibold text-white mb-2">Inventory Systems</h4>
                <p className="text-sm text-gray-400">
                  MarketMan, BlueCart—receiving logs auto-populate. Expiration tracking syncs 
                  with inventory counts.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">👥</div>
                <h4 className="font-semibold text-white mb-2">HR & Scheduling</h4>
                <p className="text-sm text-gray-400">
                  7shifts, Homebase—staff schedules inform checklist assignments. 
                  Training records sync for compliance verification.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">🏢</div>
                <h4 className="font-semibold text-white mb-2">Facility Management</h4>
                <p className="text-sm text-gray-400">
                  ServiceChannel, Facilio—equipment issues trigger maintenance requests automatically. 
                  Work orders close checklists.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">🖨️</div>
                <h4 className="font-semibold text-white mb-2">Label Printers</h4>
                <p className="text-sm text-gray-400">
                  Zebra, Brother, Dymo—direct integration. Voice command to printed label in seconds.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">📊</div>
                <h4 className="font-semibold text-white mb-2">BI & Analytics</h4>
                <p className="text-sm text-gray-400">
                  Tableau, Power BI—compliance data feeds executive dashboards. 
                  Real-time visibility for C-suite.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">💬</div>
                <h4 className="font-semibold text-white mb-2">Communication</h4>
                <p className="text-sm text-gray-400">
                  Slack, Teams—alerts, reports, and updates delivered where teams already work.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">📱</div>
                <h4 className="font-semibold text-white mb-2">SMS & Push</h4>
                <p className="text-sm text-gray-400">
                  Twilio—critical alerts via text. No app required for emergency notifications.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
                <div className="text-2xl mb-3">🔌</div>
                <h4 className="font-semibold text-white mb-2">Open API</h4>
                <p className="text-sm text-gray-400">
                  Your custom systems? Integrate anything via REST API and webhooks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AMBIENT INTELLIGENCE */}
        <section id="ambient-intelligence" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ambient Intelligence: <span className="text-[#c4dfc4]">The Invisible Layer</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl">
              The ultimate vision: compliance that happens in the background. No forms, no apps, 
              no interruptions. Just intelligent systems watching, learning, optimizing—invisibly.
            </p>

            <div className="mb-12">
              <img
                src="/1.home.png"
                alt="Ambient intelligence dashboard showing real-time compliance"
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-[#c8e0f5]/20 border border-[#c4dfc4] rounded-2xl p-8 md:p-12 mb-12">
              <h3 className="text-3xl font-bold text-white mb-8">A Day in 2027:</h3>
              
              <div className="space-y-6 text-gray-300">
                <div className="flex items-start gap-4">
                  <div className="bg-[#c4dfc4] text-[#0a0a0a] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    6AM
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Pre-Opening</p>
                    <p>Vision systems verify all equipment operational before staff arrives. Temperature logs already complete. 
                    Any anomalies flagged and resolved by automated protocols. Staff walk into a kitchen that's already compliant.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#c4dfc4] text-[#0a0a0a] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    8AM
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Service Prep</p>
                    <p>Chef asks, "Show me what needs prepping for lunch." Voice AI lists items, flags expiring inventory, 
                    suggests using Wednesday's produce before Friday's. Smart surfaces track prep progress automatically.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#c4dfc4] text-[#0a0a0a] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    12PM
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Peak Service</p>
                    <p>Ambient sensors detect lunch rush patterns. System automatically adjusts monitoring frequency, 
                    prioritizes critical checks, reduces non-essential alerts. Compliance stays perfect while staff focuses on service.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#c4dfc4] text-[#0a0a0a] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    3PM
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Predictive Alert</p>
                    <p>"Walk-in cooler #2 showing early signs of compressor stress. Maintenance scheduled for tomorrow 7AM. 
                    Backup cooler allocated. Affected inventory moved automatically." Problem solved before it happens.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#c4dfc4] text-[#0a0a0a] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    10PM
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Closing</p>
                    <p>Manager asks, "How'd we do today?" Voice AI: "Perfect compliance across all 47 checks. 
                    3 efficiency improvements identified. Tomorrow's prep list updated based on today's service patterns." 
                    Manager drives home. Report already emailed to corporate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl text-white font-bold mb-4">
                Zero manual logs. Zero clipboards. Zero missed checks.
              </p>
              <p className="text-xl text-gray-400">
                Just <span className="text-[#c4dfc4]">perfect compliance</span>, continuously.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section id="timeline" className="py-24 md:py-32 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              The Roadmap
            </h2>

            <div className="space-y-12">
              <div className="relative pl-8 border-l-2 border-[#c4dfc4]">
                <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-[#c4dfc4]"></div>
                <div className="mb-2">
                  <span className="bg-[#c4dfc4]/20 text-[#c4dfc4] px-3 py-1 rounded-full text-sm font-semibold">Now - Q2 2025</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Foundation</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✅ Vision + voice capture (94% manual work reduction)</li>
                  <li>✅ Conversational form builder</li>
                  <li>✅ Menu intelligence for label printing</li>
                  <li>✅ Real-time multi-location dashboards</li>
                </ul>
              </div>

              <div className="relative pl-8 border-l-2 border-[#c8e0f5]">
                <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-[#c8e0f5]"></div>
                <div className="mb-2">
                  <span className="bg-[#c8e0f5]/20 text-[#c8e0f5] px-3 py-1 rounded-full text-sm font-semibold">Q3-Q4 2025</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Intelligence Layer</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>🔄 Predictive compliance AI (beta)</li>
                  <li>🔄 Advanced voice assistant (full conversational context)</li>
                  <li>🔄 IoT sensor integration (temperature, humidity)</li>
                  <li>🔄 Core POS integrations (Toast, Square)</li>
                </ul>
              </div>

              <div className="relative pl-8 border-l-2 border-[#ddc8f5]">
                <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-[#ddc8f5]"></div>
                <div className="mb-2">
                  <span className="bg-[#ddc8f5]/20 text-[#ddc8f5] px-3 py-1 rounded-full text-sm font-semibold">2026</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Autonomous Systems</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>⏳ Ambient vision systems (ceiling cameras, edge AI)</li>
                  <li>⏳ Smart sensor mesh (full kitchen coverage)</li>
                  <li>⏳ Automated corrective actions</li>
                  <li>⏳ Multi-language real-time translation</li>
                  <li>⏳ Advanced ecosystem integrations</li>
                </ul>
              </div>

              <div className="relative pl-8 border-l-2 border-[#f5edc8]">
                <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-[#f5edc8]"></div>
                <div className="mb-2">
                  <span className="bg-[#f5edc8]/20 text-[#f5edc8] px-3 py-1 rounded-full text-sm font-semibold">2027+</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Zero-Touch Compliance</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>🔮 Fully ambient intelligence</li>
                  <li>🔮 Self-healing kitchen systems</li>
                  <li>🔮 Predictive equipment maintenance</li>
                  <li>🔮 Complete workflow automation</li>
                  <li>🔮 Industry-wide compliance network</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The future is being built. <br />
              <span className="text-[#c4dfc4]">Be part of it.</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12">
              Early adopters shape the roadmap. Your feedback drives development. 
              Free forever tier. Lifetime preferred pricing.
            </p>

            <Link href="/forms/builder">
              <Button className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-12 py-7 text-xl font-bold rounded-lg shadow-2xl">
                Start Building the Future <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-6">
              No credit card • 30-second setup • Cancel anytime
            </p>
          </div>
        </section>
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


