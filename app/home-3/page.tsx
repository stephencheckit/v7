"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Menu as MenuIcon, X, Eye, Mic, Brain, Zap, Network, Shield } from "lucide-react";
import Link from "next/link";

export default function HybridHomePage() {
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
        "hero", "universal", "vision", "audio", "intelligence", 
        "automation", "integration", "products", "future"
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
            <p className="text-xs text-[#c4dfc4] mt-1">The Hybrid Future</p>
          </div>

          <ul className="space-y-1">
            <NavItem label="The Vision" section="hero" active={activeSection === "hero"} onClick={() => scrollToSection("hero")} />
            <NavItem label="Universal Problem" section="universal" active={activeSection === "universal"} onClick={() => scrollToSection("universal")} />
            <NavItem label="Vision Technology" section="vision" active={activeSection === "vision"} onClick={() => scrollToSection("vision")} />
            <NavItem label="Audio Intelligence" section="audio" active={activeSection === "audio"} onClick={() => scrollToSection("audio")} />
            <NavItem label="AI & Automation" section="intelligence" active={activeSection === "intelligence"} onClick={() => scrollToSection("intelligence")} />
            <NavItem label="Predictive Systems" section="automation" active={activeSection === "automation"} onClick={() => scrollToSection("automation")} />
            <NavItem label="Integration Layer" section="integration" active={activeSection === "integration"} onClick={() => scrollToSection("integration")} />
            <NavItem label="Two Products, One Platform" section="products" active={activeSection === "products"} onClick={() => scrollToSection("products")} />
            <NavItem label="The Future" section="future" active={activeSection === "future"} onClick={() => scrollToSection("future")} />
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
                <span className="text-[#c4dfc4] text-sm font-medium">The Next Era of Compliance</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                One platform.<br />
                <span className="text-[#c4dfc4]">Every compliance challenge.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Vision, audio, intelligence, automation. The same technology stack that transforms 
                food safety operations is revolutionizing medical compliance. One unified platform 
                for the future of regulated operations.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Button 
                  onClick={() => scrollToSection("universal")}
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-10 py-7 text-xl font-bold rounded-lg shadow-2xl"
                >
                  See the Vision <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>

              {/* Capability Badges */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#c4dfc4]" />
                  <span className="text-gray-300">Vision-Based Capture</span>
                </div>
                <div className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#c8e0f5]" />
                  <span className="text-gray-300">Audio Intelligence</span>
                </div>
                <div className="bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#ddc8f5]" />
                  <span className="text-gray-300">Predictive AI</span>
                </div>
                <div className="bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#f5edc8]" />
                  <span className="text-gray-300">Autonomous Systems</span>
                </div>
                <div className="bg-white/5 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                  <Network className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Deep Integration</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Universal Problem */}
          <section id="universal" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center">
                The Universal Problem:<br />
                <span className="text-[#c4dfc4]">Compliance Is Broken</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-16 text-center max-w-4xl mx-auto leading-relaxed">
                Whether you're managing food safety or medical protocols, the problem is identical: 
                manual processes, paper trails, falsified data, and compliance gaps that put people at risk.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Food Service */}
                <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-2xl p-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Food Service Operations</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-[#c4dfc4] mt-1">•</span>
                      <span>Temperature logs filled out from memory at end of shift</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c4dfc4] mt-1">•</span>
                      <span>Checklists that take 25 minutes to complete manually</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c4dfc4] mt-1">•</span>
                      <span>No evidence trail when health inspectors arrive</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c4dfc4] mt-1">•</span>
                      <span>Equipment failures discovered too late, food spoils</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c4dfc4] mt-1">•</span>
                      <span>Hand-written labels with allergen mistakes</span>
                    </li>
                  </ul>
                </div>

                {/* Medical */}
                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-2xl p-8">
                  <div className="text-4xl mb-4">🏥</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Medical & Healthcare</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-[#c8e0f5] mt-1">•</span>
                      <span>Patient vitals documented hours after measurement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c8e0f5] mt-1">•</span>
                      <span>Safety protocols that take 20+ minutes per patient</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c8e0f5] mt-1">•</span>
                      <span>No photo evidence of care delivery or conditions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c8e0f5] mt-1">•</span>
                      <span>Medication errors from handwriting illegibility</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#c8e0f5] mt-1">•</span>
                      <span>Compliance gaps discovered only during audits</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-r from-[#c4dfc4]/10 via-[#c8e0f5]/10 to-[#ddc8f5]/10 border border-[#c4dfc4]/30 rounded-2xl p-8 text-center">
                <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Same Problem. Same Solution. Different Industries.
                </p>
                <p className="text-lg text-gray-400">
                  The technology that eliminates manual food safety compliance can eliminate 
                  manual medical compliance. The platform is industry-agnostic. The results are universal.
                </p>
              </div>
            </div>
          </section>

          {/* Vision Technology */}
          <section id="vision" className="py-24 md:py-32 bg-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-4 py-2 mb-6">
                <Eye className="w-4 h-4 text-[#c4dfc4]" />
                <span className="text-[#c4dfc4] text-sm font-medium">Vision Intelligence</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Point Your Camera. Compliance Happens.
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Vision-based data capture that understands what it sees. No typing, no clicking, 
                no manual entry. Just point, capture, done—with photo evidence automatically attached.
              </p>

              <div className="mb-12">
                <img
                  src="/4.vision.png"
                  alt="Vision intelligence capturing data across food service and medical operations"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🍽️</span>
                      Food Service Use Case
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Point camera at walk-in cooler thermometer. System reads 38°F, logs temperature, 
                      captures photo evidence, timestamps entry, updates dashboard. Staff moves to next check. 
                      30-second task becomes a 3-second task.
                    </p>
                    <div className="bg-[#c4dfc4]/10 rounded-lg p-3 text-sm text-gray-300">
                      <strong className="text-[#c4dfc4]">Impact:</strong> 94% time reduction vs manual logging. 
                      Perfect audit trail. Zero falsified data.
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🏥</span>
                      Medical Use Case
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Point camera at patient vitals monitor. System reads BP 120/80, HR 72, logs readings, 
                      captures screen photo, timestamps entry, updates EHR. Nurse continues rounds. 
                      No manual charting. No transcription errors.
                    </p>
                    <div className="bg-[#c8e0f5]/10 rounded-lg p-3 text-sm text-gray-300">
                      <strong className="text-[#c8e0f5]">Impact:</strong> 10x faster documentation. 
                      Photo-verified accuracy. Real-time trend alerts.
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4]/30 rounded-2xl p-8">
                  <h4 className="text-xl font-bold text-white mb-6">What Vision Intelligence Sees:</h4>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="text-[#c4dfc4]">✓</div>
                      <span><strong className="text-white">Temperature displays:</strong> Digital & analog thermometers, gauges, monitors</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-[#c4dfc4]">✓</div>
                      <span><strong className="text-white">Measurement devices:</strong> Scales, meters, diagnostic equipment readings</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-[#c4dfc4]">✓</div>
                      <span><strong className="text-white">Labels & packaging:</strong> Expiration dates, lot numbers, ingredient lists, medication labels</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-[#c4dfc4]">✓</div>
                      <span><strong className="text-white">Condition assessment:</strong> Cleanliness, organization, proper storage, equipment state</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-[#c4dfc4]">✓</div>
                      <span><strong className="text-white">Compliance verification:</strong> PPE worn correctly, signage in place, protocols followed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Audio Intelligence */}
          <section id="audio" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded-full px-4 py-2 mb-6">
                <Mic className="w-4 h-4 text-[#c8e0f5]" />
                <span className="text-[#c8e0f5] text-sm font-medium">Audio Intelligence</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Speak It. System Logs It.
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Voice-to-text transcription with contextual understanding. Hands-free data entry that 
                knows what you mean, not just what you say. Works in noisy environments, multiple languages, 
                technical terminology.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-3">🎤</div>
                  <h4 className="font-semibold text-white mb-2">Context-Aware</h4>
                  <p className="text-sm text-gray-400">
                    "Cooler two, thirty-eight" → System knows you mean Walk-in Cooler #2 = 38°F. 
                    No need for perfect sentences. Natural speech works.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-3">🌍</div>
                  <h4 className="font-semibold text-white mb-2">Multi-Language</h4>
                  <p className="text-sm text-gray-400">
                    Spanish-speaking staff speak in Spanish. System transcribes, translates, logs. 
                    Managers review in English. No language barriers.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <div className="text-3xl mb-3">🔊</div>
                  <h4 className="font-semibold text-white mb-2">Noisy Environments</h4>
                  <p className="text-sm text-gray-400">
                    Works in loud kitchens, busy hospital floors, crowded facilities. 
                    Noise-canceling AI isolates voice from background.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] border border-[#c4dfc4]/30 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    Food Service: Voice-Based Temp Logging
                  </h4>
                  <div className="space-y-3 text-sm text-gray-300 mb-4">
                    <p>"Walk-in one, thirty-seven degrees" → Logged</p>
                    <p>"Freezer, negative two" → Logged</p>
                    <p>"Hot hold station three, one sixty-eight" → Logged</p>
                  </div>
                  <div className="bg-[#c4dfc4]/10 rounded-lg p-3 text-sm text-gray-400">
                    All entries timestamped, GPS-verified, photo-attached. Complete audit trail. Zero typing.
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#c8e0f5]/30 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏥</span>
                    Medical: Voice-Based Patient Notes
                  </h4>
                  <div className="space-y-3 text-sm text-gray-300 mb-4">
                    <p>"Patient ambulating independently, steady gait" → Logged</p>
                    <p>"Dressing changed, wound clean, no drainage" → Logged</p>
                    <p>"Vitals stable, patient resting comfortably" → Logged</p>
                  </div>
                  <div className="bg-[#c8e0f5]/10 rounded-lg p-3 text-sm text-gray-400">
                    Transcribed, formatted, added to chart. Nurse never stops moving. Real-time documentation.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI & Intelligence */}
          <section id="intelligence" className="py-24 md:py-32 bg-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#ddc8f5]/10 border border-[#ddc8f5]/30 rounded-full px-4 py-2 mb-6">
                <Brain className="w-4 h-4 text-[#ddc8f5]" />
                <span className="text-[#ddc8f5] text-sm font-medium">Artificial Intelligence</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Intelligence That Learns Your Operation
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                AI that doesn't just capture data—it understands patterns, predicts problems, 
                suggests solutions. Every interaction makes it smarter. Every location teaches it more.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-[#ddc8f5]/30 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4">Pattern Recognition</h4>
                    <p className="text-gray-400 mb-4">
                      System analyzes months of data across all locations, identifying which conditions 
                      precede violations, equipment failures, or compliance gaps.
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-start gap-2">
                        <span className="text-[#ddc8f5]">→</span>
                        <span>"Location 7 shows temp variance every Thursday afternoon. Pattern match: Staff shortage + increased load."</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#ddc8f5]">→</span>
                        <span>"Patient fall risk increases 34% on night shifts. Recommend enhanced monitoring."</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-[#ddc8f5]/30 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4">Anomaly Detection</h4>
                    <p className="text-gray-400 mb-4">
                      AI flags unusual patterns that humans miss. Identical entries, suspicious timing, 
                      data that doesn't match historical norms.
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-start gap-2">
                        <span className="text-[#ddc8f5]">→</span>
                        <span>"Temperature logs at Location 12 submitted at identical times 8 days in a row. Investigate."</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#ddc8f5]">→</span>
                        <span>"Medication administration timing shows unusual clustering. Verify protocol compliance."</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#ddc8f5]/20 to-transparent border border-[#ddc8f5]/30 rounded-2xl p-8">
                  <h4 className="text-xl font-bold text-white mb-6">Conversational AI Control</h4>
                  <p className="text-gray-400 mb-6">
                    Manage your entire operation by talking to it. Natural language commands that 
                    create forms, deploy checklists, generate reports, schedule tasks.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-4">
                      <p className="text-sm text-[#ddc8f5] mb-1">You say:</p>
                      <p className="text-white italic">"Show me all locations where morning checks weren't completed on time this week"</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-4">
                      <p className="text-sm text-[#ddc8f5] mb-1">You say:</p>
                      <p className="text-white italic">"Create a 15-question patient safety checklist and deploy it to all facilities starting Monday"</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-4">
                      <p className="text-sm text-[#ddc8f5] mb-1">You say:</p>
                      <p className="text-white italic">"Why is compliance dropping at Facility 5? What changed last week?"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Predictive & Automation */}
          <section id="automation" className="py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-[#f5edc8]/10 border border-[#f5edc8]/30 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-[#f5edc8]" />
                <span className="text-[#f5edc8] text-sm font-medium">Predictive Automation</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Fix Problems Before They Happen
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Stop reacting. Start preventing. Predictive AI that forecasts violations 48-72 hours 
                in advance, giving you time to intervene before risk becomes reality.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#0a0a0a] border border-[#f5edc8]/30 rounded-xl p-8">
                  <div className="text-3xl mb-4">🔮</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Food Service Prediction</h3>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 mb-4">
                    <p className="text-[#ff6b6b] font-semibold mb-2">⚠️ HIGH RISK PREDICTION</p>
                    <p className="text-white font-medium mb-3">
                      Location 7: 89% probability of cold storage violation by Friday 2 PM
                    </p>
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p>• Equipment age: 8.2 years (above fleet average)</p>
                      <p>• Recent temp fluctuations: +3.2°F variance</p>
                      <p>• Pattern match: Similar conditions preceded 4 past violations</p>
                    </div>
                    <div className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded p-3">
                      <p className="text-xs text-[#c4dfc4] font-semibold mb-2">AI RECOMMENDATIONS:</p>
                      <p className="text-xs text-gray-300">✓ Schedule equipment inspection<br />✓ Increase monitoring to every 15 min<br />✓ Prepare backup cooler space</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#f5edc8]/30 rounded-xl p-8">
                  <div className="text-3xl mb-4">🔮</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Medical Prediction</h3>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 mb-4">
                    <p className="text-[#ff6b6b] font-semibold mb-2">⚠️ HIGH RISK PREDICTION</p>
                    <p className="text-white font-medium mb-3">
                      Patient 12B: 82% fall risk probability next 48 hours
                    </p>
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p>• Mobility decline: -15% over last 3 days</p>
                      <p>• Medication change: New sleep aid added</p>
                      <p>• Pattern match: Similar profile = 7 previous falls</p>
                    </div>
                    <div className="bg-[#c8e0f5]/10 border border-[#c8e0f5]/30 rounded p-3">
                      <p className="text-xs text-[#c8e0f5] font-semibold mb-2">AI RECOMMENDATIONS:</p>
                      <p className="text-xs text-gray-300">✓ Increase rounding frequency<br />✓ Add bed alarm<br />✓ Flag for physical therapy eval</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#f5edc8]/10 via-[#c4dfc4]/10 to-[#c8e0f5]/10 border border-[#f5edc8]/30 rounded-2xl p-8 text-center">
                <h4 className="text-2xl font-bold text-white mb-4">Autonomous Corrective Actions</h4>
                <p className="text-lg text-gray-400 mb-6">
                  System doesn't just predict—it acts. Automatic scheduling, alerts, resource allocation, 
                  and workflow adjustments happen without human intervention.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#c4dfc4] font-semibold mb-2">Detected</p>
                    <p className="text-gray-400">Equipment temp variance</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#f5edc8] font-semibold mb-2">Automated</p>
                    <p className="text-gray-400">Maintenance ticket created</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-[#c8e0f5] font-semibold mb-2">Resolved</p>
                    <p className="text-gray-400">Issue fixed before violation</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integration Layer */}
          <section id="integration" className="py-24 md:py-32 bg-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Network className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Deep Integration</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The Central Nervous System
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                Checkit doesn't replace your tech stack—it connects it. One platform orchestrating 
                every system in your operation. Data flows automatically. Nothing lives in silos.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Food Service Integrations</h3>
                  <div className="space-y-3">
                    <IntegrationCard icon="🍕" title="POS Systems" description="Toast, Square, Clover—menu sync, sales data, inventory triggers" />
                    <IntegrationCard icon="📦" title="Inventory" description="MarketMan, BlueCart—receiving logs, expiration tracking, reorder automation" />
                    <IntegrationCard icon="👥" title="HR & Scheduling" description="7shifts, Homebase—staff schedules inform task assignments" />
                    <IntegrationCard icon="🖨️" title="Label Printers" description="Zebra, Brother, Dymo—direct print integration from any device" />
                    <IntegrationCard icon="🏢" title="Facility Management" description="ServiceChannel—equipment issues trigger maintenance requests" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Medical Integrations</h3>
                  <div className="space-y-3">
                    <IntegrationCard icon="🏥" title="EHR Systems" description="Epic, Cerner, Allscripts—vitals, notes, medications sync bidirectionally" />
                    <IntegrationCard icon="💊" title="Pharmacy" description="Medication administration records, inventory, controlled substance tracking" />
                    <IntegrationCard icon="📅" title="Scheduling" description="Nurse staffing, patient appointments, procedure calendars" />
                    <IntegrationCard icon="📋" title="Compliance" description="State survey requirements, accreditation standards, audit trails" />
                    <IntegrationCard icon="🚨" title="Alert Systems" description="Critical events, fall alerts, emergency response coordination" />
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 text-center">
                <h4 className="text-2xl font-bold text-white mb-4">Open API for Custom Integrations</h4>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                  REST API, webhooks, and real-time data streams. Integrate with your proprietary 
                  systems, legacy software, or custom-built tools. If it has an API, we can connect to it.
                </p>
              </div>
            </div>
          </section>

          {/* Two Products, One Platform */}
          <section id="products" className="py-24 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center">
                Two Products. One Platform.<br />
                <span className="text-[#c4dfc4]">Built on the Same Foundation.</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 text-center max-w-4xl mx-auto leading-relaxed">
                The same vision, audio, AI, and automation technology powers both products. 
                The intelligence layer is shared. The innovation benefits everyone.
              </p>

              <div className="mb-16">
                <img
                  src="/1.home.png"
                  alt="Unified platform powering both food safety and medical compliance"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Food Product */}
                <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4] rounded-2xl p-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Checkit V7: Food Safety</h3>
                  <p className="text-lg text-gray-400 mb-6">
                    Vision-based compliance for multi-site food service operations. Senior living, 
                    hospitals, stadiums, school districts, corporate cafeterias.
                  </p>
                  <div className="space-y-3 mb-6">
                    <FeatureItem text="Temperature monitoring & logging" />
                    <FeatureItem text="Menu intelligence & label automation" />
                    <FeatureItem text="HACCP & food safety protocols" />
                    <FeatureItem text="Health inspection readiness" />
                    <FeatureItem text="Allergen management" />
                    <FeatureItem text="Equipment maintenance tracking" />
                  </div>
                  <Link href="/forms/builder">
                    <Button className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-bold">
                      Explore Food Safety →
                    </Button>
                  </Link>
                </div>

                {/* Medical Product */}
                <div className="bg-gradient-to-br from-[#c8e0f5]/20 to-transparent border border-[#c8e0f5] rounded-2xl p-8">
                  <div className="text-4xl mb-4">🏥</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Checkit Medical</h3>
                  <p className="text-lg text-gray-400 mb-6">
                    Vision-based documentation for healthcare facilities. Skilled nursing, assisted living, 
                    hospitals, home health, long-term care.
                  </p>
                  <div className="space-y-3 mb-6">
                    <FeatureItem text="Patient vitals capture & charting" />
                    <FeatureItem text="Care protocol compliance tracking" />
                    <FeatureItem text="Medication administration verification" />
                    <FeatureItem text="Safety & fall prevention monitoring" />
                    <FeatureItem text="State survey & accreditation readiness" />
                    <FeatureItem text="Wound care documentation" />
                  </div>
                  <Link href="/forms/builder">
                    <Button className="w-full bg-[#c8e0f5] hover:bg-[#b8d0e5] text-[#0a0a0a] font-bold">
                      Explore Medical →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#c4dfc4]/10 via-[#c8e0f5]/10 to-[#ddc8f5]/10 border border-[#c4dfc4]/30 rounded-2xl p-8 text-center">
                <h4 className="text-2xl font-bold text-white mb-4">Shared Innovation, Multiplied Impact</h4>
                <p className="text-lg text-gray-400 mb-6">
                  When we improve vision intelligence for food safety, medical gets that upgrade too. 
                  When we enhance predictive AI for medical, food safety inherits that capability. 
                  One R&D budget. Two products. Exponential value.
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-gray-300">Shared AI Engine</span>
                  <span className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-gray-300">Unified Vision Stack</span>
                  <span className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-gray-300">Common Audio Intelligence</span>
                  <span className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-gray-300">Same Integration Layer</span>
                  <span className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-gray-300">Cross-Product Learning</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Future */}
          <section id="future" className="py-24 md:py-32 bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-full px-6 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-[#c4dfc4]" />
                <span className="text-[#c4dfc4] text-sm font-medium">The Hybrid Future</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                This Is Just the Beginning
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                We're building toward a future where compliance happens invisibly, autonomously, 
                continuously—across every regulated industry. Food safety and medical are just the start.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h4 className="font-semibold text-white mb-2">Construction Safety</h4>
                  <p className="text-sm text-gray-400">
                    Vision-based site inspections, PPE compliance, equipment verification
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🏭</div>
                  <h4 className="font-semibold text-white mb-2">Manufacturing QA</h4>
                  <p className="text-sm text-gray-400">
                    Automated quality checks, defect detection, production line monitoring
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🏫</div>
                  <h4 className="font-semibold text-white mb-2">Education & Childcare</h4>
                  <p className="text-sm text-gray-400">
                    Safety protocols, attendance verification, incident documentation
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#c4dfc4]/20 via-[#c8e0f5]/20 to-[#ddc8f5]/20 border border-[#c4dfc4]/40 rounded-2xl p-12 mb-12">
                <p className="text-3xl md:text-4xl font-bold text-white mb-6">
                  The platform is industry-agnostic.<br />
                  The technology is universal.<br />
                  <span className="text-[#c4dfc4]">The future is hybrid.</span>
                </p>
                <p className="text-lg text-gray-400">
                  Anywhere there's compliance, there's opportunity. Anywhere there's manual processes, 
                  there's inefficiency. Anywhere there's risk, there's a solution waiting.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/forms/builder">
                  <Button className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-12 py-7 text-xl font-bold rounded-lg shadow-2xl">
                    Start Building the Future <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Free forever tier • Two products, one platform • The hybrid future starts now
              </p>
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

function IntegrationCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 hover:border-[#c4dfc4]/30 transition-all">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h5 className="font-semibold text-white text-sm mb-1">{title}</h5>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-300">
      <div className="w-1.5 h-1.5 rounded-full bg-[#c4dfc4]"></div>
      <span>{text}</span>
    </div>
  );
}

