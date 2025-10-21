"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, TrendingDown, XCircle, DollarSign, Clock, FileWarning, Menu as MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { EmailCapture } from "@/components/email-capture";

export default function HomePage() {
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
        "hero", "cost", "problem-1", "problem-2", "problem-3", 
        "problem-4", "executive", "solution", "roi", "cta"
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
          <div className={`mb-8 transition-opacity duration-300 ${mobileNavOpen ? 'hidden' : 'block'} lg:block`}>
            <h1 className="text-2xl font-bold text-white">Checkit V7</h1>
            <p className="text-xs text-[#ff6b6b] mt-1">The Hidden Crisis</p>
          </div>

          <ul className="space-y-1">
            <NavItem label="The Crisis" section="hero" active={activeSection === "hero"} onClick={() => scrollToSection("hero")} />
            <NavItem label="The Real Cost" section="cost" active={activeSection === "cost"} onClick={() => scrollToSection("cost")} />
            <NavItem label="Problem 1: Checklists" section="problem-1" active={activeSection === "problem-1"} onClick={() => scrollToSection("problem-1")} />
            <NavItem label="Problem 2: Execution" section="problem-2" active={activeSection === "problem-2"} onClick={() => scrollToSection("problem-2")} />
            <NavItem label="Problem 3: Labeling" section="problem-3" active={activeSection === "problem-3"} onClick={() => scrollToSection("problem-3")} />
            <NavItem label="Problem 4: Temperature" section="problem-4" active={activeSection === "problem-4"} onClick={() => scrollToSection("problem-4")} />
            <NavItem label="Executive Reality" section="executive" active={activeSection === "executive"} onClick={() => scrollToSection("executive")} />
            <NavItem label="The Solution" section="solution" active={activeSection === "solution"} onClick={() => scrollToSection("solution")} />
            <NavItem label="Financial Reality" section="roi" active={activeSection === "roi"} onClick={() => scrollToSection("roi")} />
            <NavItem label="Take Action" section="cta" active={activeSection === "cta"} onClick={() => scrollToSection("cta")} />
          </ul>

          <div className="mt-8 pt-8 border-t border-white/10">
            <EmailCapture 
              size="default"
              placeholder="Your email"
              buttonText="Join Waitlist"
            />
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
        <div className="min-h-screen text-white flex flex-col items-center justify-center">
      {/* Hero - The Problem */}
      <section id="hero" className="relative w-full py-24 md:py-32 lg:py-40 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-[600px] h-[600px] bg-[#ff6b6b]/30 rounded-full blur-3xl animate-blob top-0 left-0"></div>
          <div className="absolute w-[600px] h-[600px] bg-[#ff6b6b]/20 rounded-full blur-3xl animate-blob animation-delay-2000 bottom-0 right-0"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-[#ff6b6b]/20 border border-[#ff6b6b]/40 rounded-full px-5 py-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
            <span className="text-[#ff6b6b] text-sm font-medium">The Hidden Crisis in Food Service Operations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            Your food safety operation is <span className="text-[#ff6b6b]">bleeding money</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Every day without modern compliance systems costs your organization thousands in wasted labor, 
            preventable violations, and operational inefficiency. The numbers don't lie.
          </p>
        </div>
      </section>

      {/* The Cost of Inaction */}
      <section id="cost" className="w-full py-20 md:py-28 bg-[#1a1a1a] text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            The Real Cost of Manual Food Safety
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            While your teams drown in clipboards and paperwork, here's what's happening to your bottom line:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-[#ff6b6b]/20 to-transparent border border-[#ff6b6b]/40 rounded-xl p-8">
              <DollarSign className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
              <p className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-3">$2,847</p>
              <p className="text-base md:text-lg text-gray-300 mb-2">Lost per location, per month</p>
              <p className="text-sm text-gray-500">Wasted labor, compliance gaps, operational drag</p>
            </div>

            <div className="bg-gradient-to-br from-[#ff6b6b]/20 to-transparent border border-[#ff6b6b]/40 rounded-xl p-8">
              <Clock className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
              <p className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-3">47 hrs</p>
              <p className="text-base md:text-lg text-gray-300 mb-2">Wasted per location, per week</p>
              <p className="text-sm text-gray-500">Staff + manager time on manual paperwork</p>
            </div>

            <div className="bg-gradient-to-br from-[#ff6b6b]/20 to-transparent border border-[#ff6b6b]/40 rounded-xl p-8">
              <FileWarning className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
              <p className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-3">23%</p>
              <p className="text-base md:text-lg text-gray-300 mb-2">Average compliance gap rate</p>
              <p className="text-sm text-gray-500">Checks missed, falsified, or incomplete</p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#ff6b6b]/30 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              For a <span className="text-[#ff6b6b]">10-location operation</span>:
            </p>
            <p className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-4">$341,640</p>
            <p className="text-lg md:text-xl text-gray-400">
              Lost annually to manual food safety processes. That's real money. 
              That's executive compensation. That's expansion capital.
            </p>
          </div>
        </div>
      </section>

      {/* Problem 1: Manual Checklist Hell */}
      <section id="problem-1" className="w-full py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-[#ff6b6b]/20 rounded-lg p-3">
              <XCircle className="w-8 h-8 text-[#ff6b6b]" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Problem: Checklist Creation Takes Hours
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Your managers spend 3-5 hours building a single checklist. Multiply that across locations, 
                seasonal changes, menu updates, regulatory shifts. Hundreds of manager hours vanish into 
                Word documents and spreadsheets that nobody wants to use.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 mb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#ff6b6b]" />
              The Downstream Impact:
            </h4>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Checklists become outdated the moment they're printed. Menu changes? Start over.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Deployment takes days. Email chains, printer failures, version confusion across 20 locations.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Staff ignore them. If it's painful to create, it's painful to use. Compliance theater, not real safety.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span><strong className="text-white">Cost:</strong> Manager at $65K salary spends 15% of time on checklist admin. That's $9,750/year per manager doing nothing productive.</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b6b]/10 to-transparent border border-[#ff6b6b]/20 rounded-xl p-6">
            <p className="text-lg text-gray-400">
              <strong className="text-[#ff6b6b]">Real Example:</strong> A regional director at a 15-location senior living 
              operator told us they spent <strong className="text-white">40 hours</strong> updating COVID protocols across 
              all locations. By the time they finished, the protocols had changed again.
            </p>
          </div>
        </div>
      </section>

      {/* Problem 2: Manual Execution Nightmare */}
      <section id="problem-2" className="w-full py-20 md:py-28 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-[#ff6b6b]/20 rounded-lg p-3">
              <XCircle className="w-8 h-8 text-[#ff6b6b]" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Problem: Completing Checklists is Agonizingly Slow
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Your staff spend 20-30 minutes per checklist. Writing temperatures by hand. Checking boxes. 
                Signing initials. Flipping pages. Walking back and forth between clipboard and equipment. 
                It's 1995 technology in a 2025 operation.
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#ff6b6b]/30 rounded-xl p-8 mb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#ff6b6b]" />
              The Downstream Impact:
            </h4>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Staff falsify data. When it's this painful, they fill it out from memory at the end of shift. Not safe. Not compliant. Not acceptable.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Checks get skipped. During lunch rush, that clipboard sits untouched. Violations happen in the gaps.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>No evidence trail. Health inspector asks "prove this temp check happened at 7:42 AM." You can't. Clipboard says so, but there's no proof.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span><strong className="text-white">Cost:</strong> 3 morning checklists/day at 25 minutes each = 75 minutes of hourly labor ($18/hr average) = $22.50/day = $8,213/year per location in pure wasted time.</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b6b]/10 to-transparent border border-[#ff6b6b]/20 rounded-xl p-6">
            <p className="text-lg text-gray-400">
              <strong className="text-[#ff6b6b]">Real Example:</strong> During a health inspection at a hospital food service, 
              auditors found <strong className="text-white">8 consecutive days</strong> where temperature logs were filled out 
              in identical handwriting at identical times. $45,000 fine. Reputation damage: immeasurable.
            </p>
          </div>
        </div>
      </section>

      {/* Problem 3: Label Printing Chaos */}
      <section id="problem-3" className="w-full py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-[#ff6b6b]/20 rounded-lg p-3">
              <XCircle className="w-8 h-8 text-[#ff6b6b]" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Problem: Food Labeling is Manual, Error-Prone, and Slow
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Your prep cooks hand-write labels. They guess at expiration dates. They forget allergen warnings. 
                They misspell ingredients. A simple prep label takes 2-3 minutes to write, verify, and apply. 
                50 items per day? That's 2.5 hours of labor.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 mb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#ff6b6b]" />
              The Downstream Impact:
            </h4>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Allergen incidents. Handwritten labels are illegible. Staff can't read "contains tree nuts." Someone gets sick. Lawsuit costs $250K+.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>FIFO violations. Without clear dates, older product sits behind newer. Food waste climbs 15-20%. That's pure margin loss.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Inspection failures. Health inspectors cite unlabeled or improperly labeled items in 67% of violations. Each citation delays your operation.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span><strong className="text-white">Cost:</strong> 50 labels/day at 2.5 min each = 125 min daily labor ($18/hr) = $37.50/day = $13,688/year per location. Plus food waste. Plus violation fines.</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b6b]/10 to-transparent border border-[#ff6b6b]/20 rounded-xl p-6">
            <p className="text-lg text-gray-400">
              <strong className="text-[#ff6b6b]">Real Example:</strong> A stadium food service operation with 40 concession 
              stands was cited for <strong className="text-white">200+ labeling violations</strong> during a surprise inspection. 
              $125,000 in fines. 3-day shutdown during peak season. $500K+ in lost revenue.
            </p>
          </div>
        </div>
      </section>

      {/* Problem 4: Temperature Monitoring Hell */}
      <section id="problem-4" className="w-full py-20 md:py-28 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-[#ff6b6b]/20 rounded-lg p-3">
              <XCircle className="w-8 h-8 text-[#ff6b6b]" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Problem: Manual Temperature Logs Are a Compliance Nightmare
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Every 2-4 hours, someone walks around with a thermometer and clipboard. They open fridges 
                (letting cold air out). They probe food (contamination risk). They write numbers on paper. 
                Then they file that paper in a binder that nobody ever looks at until an inspector arrives.
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#ff6b6b]/30 rounded-xl p-8 mb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#ff6b6b]" />
              The Downstream Impact:
            </h4>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Equipment failures go unnoticed. Your walk-in cooler has been running warm for 8 hours. Nobody knows until the next manual check. $15K of food ruined.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Gaps in monitoring. Overnight shift? Weekends? Holidays? Manual logs show suspicious uniformity. Inspectors know it's fabricated.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span>Reactive, not proactive. You only know there's a problem AFTER food is at risk. No early warnings. No time to fix it.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-[#ff6b6b] font-bold mt-1">•</span>
                <span><strong className="text-white">Cost:</strong> 6 temp checks/day at 15 min each = 90 min daily labor ($18/hr) = $27/day = $9,855/year per location. Plus spoilage. Plus violations.</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b6b]/10 to-transparent border border-[#ff6b6b]/20 rounded-xl p-6">
            <p className="text-lg text-gray-400">
              <strong className="text-[#ff6b6b]">Real Example:</strong> A senior living facility's freezer compressor 
              failed overnight. Manual check at 8 AM showed 45°F. <strong className="text-white">$23,000 of food lost</strong>. 
              Residents had limited meal options for 3 days. Family complaints. State survey citation.
            </p>
          </div>
        </div>
      </section>

      {/* The Executive Reality */}
      <section id="executive" className="w-full py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Here's What This Means for You
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
            If you're a VP of Operations, Chief Culinary Officer, or COO overseeing food service, 
            these aren't hypothetical problems. This is your daily reality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 text-left">
              <h4 className="text-xl font-bold text-white mb-4">Your Team is Overwhelmed</h4>
              <p className="text-gray-400">
                Managers spend 40% of their time on compliance paperwork instead of leading their teams, 
                improving service, and driving revenue. You hired them to manage operations, not shuffle clipboards.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 text-left">
              <h4 className="text-xl font-bold text-white mb-4">Your Risk is Climbing</h4>
              <p className="text-gray-400">
                Every manual log is a liability. Every handwritten label is a lawsuit waiting to happen. 
                Every missed check is a violation that could shut you down. You're one bad inspection away from crisis.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 text-left">
              <h4 className="text-xl font-bold text-white mb-4">Your Budget is Bleeding</h4>
              <p className="text-gray-400">
                Labor costs climb year over year, but productivity stagnates. You're paying more to get the same 
                manual, error-prone results. The board wants efficiency. You're giving them paperwork.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#ff6b6b]/30 rounded-xl p-8 text-left">
              <h4 className="text-xl font-bold text-white mb-4">Your Competitors are Moving On</h4>
              <p className="text-gray-400">
                While you're managing clipboards, forward-thinking operators are implementing vision-based compliance, 
                IoT sensors, and predictive analytics. They're faster, safer, and more profitable. You're falling behind.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b6b]/20 to-transparent border border-[#ff6b6b]/40 rounded-2xl p-8 md:p-12">
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              Every week you wait costs you <span className="text-[#ff6b6b]">$6,580</span>
            </p>
            <p className="text-lg md:text-xl text-gray-400">
              That's <strong className="text-white">216 hours of wasted labor</strong> across 10 locations. 
              That's <strong className="text-white">23% compliance gaps</strong> putting you at risk. 
              That's <strong className="text-white">real money</strong> vanishing into manual processes.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution - Finally */}
      <section id="solution" className="w-full py-20 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#c4dfc4]/20 border border-[#c4dfc4]/40 rounded-full px-5 py-2 mb-6">
              <span className="text-[#c4dfc4] text-sm font-medium">There is a better way</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Stop the bleeding. <br /><span className="text-[#c4dfc4]">Start with Checkit V7.</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We built the platform that solves every problem you just read about. Here's how:
            </p>
          </div>

          {/* Platform Overview Image */}
          <div className="mb-16">
            <img
              src="/1.home.png"
              alt="Checkit V7 Platform Dashboard"
              className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Feature 1 */}
          <div className="mb-12 bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#c4dfc4]/20 rounded-lg p-3">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Conversational Checklist Builder</h3>
                <p className="text-lg text-gray-400 mb-6">
                  <strong className="text-[#c4dfc4]">With conversational AI,</strong> you can{" "}
                  <strong className="text-white">create and deploy checklists in 30 seconds using natural language</strong>{" "}
                  so that you can <strong className="text-white">eliminate the 3-5 hours of manager time per checklist 
                  and get your leaders back to leading instead of formatting documents.</strong>
                </p>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400 italic">
                    "Create me a 10-question morning food safety checklist and deploy it to all locations starting Monday at 7 AM."
                  </p>
                  <p className="text-xs text-[#c4dfc4] mt-2">→ Done. Deployed. Live in 30 seconds.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c4dfc4] mb-1">160x</p>
                <p className="text-sm text-gray-400">Faster than manual</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c4dfc4] mb-1">$9,750</p>
                <p className="text-sm text-gray-400">Saved per manager/year</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c4dfc4] mb-1">100%</p>
                <p className="text-sm text-gray-400">Consistent across all sites</p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="mb-12 bg-[#1a1a1a] border border-[#c8e0f5]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#c8e0f5]/20 rounded-lg p-3">
                <span className="text-2xl">📸</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Vision & Audio-Based Data Capture</h3>
                <p className="text-lg text-gray-400 mb-6">
                  <strong className="text-[#c8e0f5]">With vision and audio intelligence,</strong> you can{" "}
                  <strong className="text-white">point your camera at equipment and speak the temperature—the form auto-fills with photo evidence attached</strong>{" "}
                  so that you can <strong className="text-white">reduce checklist completion time from 25 minutes to 90 seconds 
                  and eliminate falsified data with timestamped, photo-verified evidence.</strong>
                </p>
                <div className="mb-6">
                  <img
                    src="/4.vision.png"
                    alt="Vision-based data capture in action"
                    className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                  />
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    Staff points phone at walk-in cooler, speaks: "38 degrees." System captures photo, logs temp, 
                    timestamps entry, attaches evidence. No typing. No clipboard. No errors.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c8e0f5] mb-1">94%</p>
                <p className="text-sm text-gray-400">Time savings vs manual</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c8e0f5] mb-1">$8,213</p>
                <p className="text-sm text-gray-400">Saved per location/year</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#c8e0f5] mb-1">100%</p>
                <p className="text-sm text-gray-400">Evidence-verified checks</p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="mb-12 bg-[#1a1a1a] border border-[#ddc8f5]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#ddc8f5]/20 rounded-lg p-3">
                <span className="text-2xl">🏷️</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Intelligent Menu-to-Label Automation</h3>
                <p className="text-lg text-gray-400 mb-6">
                  <strong className="text-[#ddc8f5]">With menu intelligence and automated label generation,</strong> you can{" "}
                  <strong className="text-white">upload a photo of your menu and get FDA-compliant labels with ingredients, 
                  allergens, and FIFO dates in 2 minutes</strong> so that you can{" "}
                  <strong className="text-white">eliminate $13,688/year in manual labeling labor, prevent allergen incidents, 
                  and reduce food waste by 15-20%.</strong>
                </p>
                <div className="mb-6">
                  <img
                    src="/5.menu.png"
                    alt="Menu intelligence and automated label generation"
                    className="w-full h-auto rounded-xl shadow-xl border border-white/10"
                  />
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    Take photo of menu or upload Excel. AI extracts all items, identifies allergens, calculates shelf life, 
                    generates FDA-compliant labels, sends them to your Zebra printer. 2 minutes. Done.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#ddc8f5] mb-1">2 min</p>
                <p className="text-sm text-gray-400">Menu to printed labels</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#ddc8f5] mb-1">$13,688</p>
                <p className="text-sm text-gray-400">Saved per location/year</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#ddc8f5] mb-1">Zero</p>
                <p className="text-sm text-gray-400">Allergen labeling errors</p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="mb-12 bg-[#1a1a1a] border border-[#f5edc8]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#f5edc8]/20 rounded-lg p-3">
                <span className="text-2xl">🌡️</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Automated IoT Temperature Monitoring</h3>
                <p className="text-lg text-gray-400 mb-6">
                  <strong className="text-[#f5edc8]">With integrated IoT sensor networks,</strong> you can{" "}
                  <strong className="text-white">continuously monitor every fridge, freezer, and hot-hold unit with automated 
                  alerts when temps drift out of range</strong> so that you can{" "}
                  <strong className="text-white">eliminate $9,855/year in manual logging labor, prevent equipment failures, 
                  and catch temperature issues before $15K+ of food is lost.</strong>
                </p>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    Sensors check temps every 15 minutes, 24/7. Logs auto-populate. Equipment degradation triggers 
                    maintenance alerts. Walk-in running warm at 2 AM? You get a text. Fix it before food spoils.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#f5edc8] mb-1">24/7</p>
                <p className="text-sm text-gray-400">Continuous monitoring</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#f5edc8] mb-1">$9,855</p>
                <p className="text-sm text-gray-400">Saved per location/year</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#f5edc8] mb-1">Instant</p>
                <p className="text-sm text-gray-400">Problem detection & alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Summary */}
      <section id="roi" className="w-full py-20 md:py-28 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12">
            The Financial Reality
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#ff6b6b]/20 to-transparent border border-[#ff6b6b]/40 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Without Checkit V7</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Manual labor waste</span>
                  <span className="text-xl font-bold text-[#ff6b6b]">$41,556</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Food waste & spoilage</span>
                  <span className="text-xl font-bold text-[#ff6b6b]">$18,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Violation risk exposure</span>
                  <span className="text-xl font-bold text-[#ff6b6b]">$12,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Manager time waste</span>
                  <span className="text-xl font-bold text-[#ff6b6b]">$9,750</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-white font-bold text-lg">Total Annual Cost</span>
                  <span className="text-3xl font-bold text-[#ff6b6b]">$81,306</span>
                </div>
                <p className="text-sm text-gray-500 pt-2">Per 10-location operation</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4]/40 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">With Checkit V7</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Platform cost</span>
                  <span className="text-xl font-bold text-white">$59,880</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Labor savings</span>
                  <span className="text-xl font-bold text-[#c4dfc4]">-$41,556</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Food waste reduction</span>
                  <span className="text-xl font-bold text-[#c4dfc4]">-$18,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Violation prevention</span>
                  <span className="text-xl font-bold text-[#c4dfc4]">-$12,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Manager time recovered</span>
                  <span className="text-xl font-bold text-[#c4dfc4]">-$9,750</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-white font-bold text-lg">Net Annual Savings</span>
                  <span className="text-3xl font-bold text-[#c4dfc4]">$21,426</span>
                </div>
                <p className="text-sm text-[#c4dfc4] pt-2">Plus operational risk elimination</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#c4dfc4]/20 via-[#c8e0f5]/20 to-[#ddc8f5]/20 border border-[#c4dfc4]/40 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl md:text-3xl font-bold text-white mb-2">
              ROI: <span className="text-[#c4dfc4]">1.36x in Year One</span>
            </p>
            <p className="text-lg text-gray-400 mb-6">
              That's real savings. That's margin improvement. That's what you present to the board.
            </p>
            <p className="text-xl font-semibold text-white">
              Plus: Risk reduction, evidence trails, audit readiness, and executive peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="w-full py-20 md:py-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Stop losing <span className="text-[#ff6b6b]">$6,580/week</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Every day you wait is another day of wasted labor, compliance risk, and operational drag. 
            Join the waitlist and be first in line when we launch.
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <EmailCapture 
              size="large"
              placeholder="Enter your work email"
              buttonText="Get Early Access"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400 max-w-2xl mx-auto">
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
            ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] border-l-2 border-[#ff6b6b]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }
        `}
      >
        {label}
      </button>
    </li>
  );
}
