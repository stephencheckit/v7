"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap,
  Eye,
  Brain,
  Thermometer,
  Camera,
  Mic,
  Radio,
  ChevronRight,
  Sparkles,
  Activity,
  MapPin,
  Users,
  Shield
} from "lucide-react";

export default function VisionDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"predictions" | "insights" | "monitoring">("predictions");

  return (
    
      <div className="w-full h-full overflow-auto bg-[#0a0a0a] text-white">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="max-w-[1800px] mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">Intelligence Center</h1>
                  <Badge className="bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    PREVIEW
                  </Badge>
                </div>
                <p className="text-gray-400">Predictive compliance & autonomous monitoring across all locations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#c4dfc4]/30 rounded-lg px-4 py-2">
                  <div className="w-2 h-2 bg-[#c4dfc4] rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Live monitoring active</span>
                </div>
              </div>
            </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border-[#c4dfc4]/30 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-[#c4dfc4]/20 rounded-lg p-2">
                <Brain className="w-5 h-5 text-[#c4dfc4]" />
              </div>
              <TrendingUp className="w-4 h-4 text-[#c4dfc4]" />
            </div>
            <div className="text-3xl font-bold mb-1">94.8%</div>
            <div className="text-sm text-gray-400">Predicted Compliance</div>
            <div className="text-xs text-[#c4dfc4] mt-2">+2.3% vs last week</div>
          </Card>

          <Card className="bg-gradient-to-br from-[#c8e0f5]/20 to-transparent border-[#c8e0f5]/30 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-[#c8e0f5]/20 rounded-lg p-2">
                <AlertTriangle className="w-5 h-5 text-[#c8e0f5]" />
              </div>
              <Clock className="w-4 h-4 text-[#c8e0f5]" />
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm text-gray-400">Violations Prevented</div>
            <div className="text-xs text-[#c8e0f5] mt-2">Avg. 51hrs early warning</div>
          </Card>

          <Card className="bg-gradient-to-br from-[#ddc8f5]/20 to-transparent border-[#ddc8f5]/30 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-[#ddc8f5]/20 rounded-lg p-2">
                <Activity className="w-5 h-5 text-[#ddc8f5]" />
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#ddc8f5]" />
            </div>
            <div className="text-3xl font-bold mb-1">1,247</div>
            <div className="text-sm text-gray-400">Auto-Completed Checks</div>
            <div className="text-xs text-[#ddc8f5] mt-2">Today across all locations</div>
          </Card>

          <Card className="bg-gradient-to-br from-[#f5edc8]/20 to-transparent border-[#f5edc8]/30 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-[#f5edc8]/20 rounded-lg p-2">
                <Zap className="w-5 h-5 text-[#f5edc8]" />
              </div>
              <TrendingDown className="w-4 h-4 text-[#f5edc8]" />
            </div>
            <div className="text-3xl font-bold mb-1">97%</div>
            <div className="text-sm text-gray-400">Manual Work Reduced</div>
            <div className="text-xs text-[#f5edc8] mt-2">vs traditional methods</div>
          </Card>
        </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab("predictions")}
                className={`px-6 py-3 font-medium transition-all relative ${
                  activeTab === "predictions"
                    ? "text-[#c4dfc4]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Predictive Insights
                {activeTab === "predictions" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c4dfc4]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-6 py-3 font-medium transition-all relative ${
                  activeTab === "insights"
                    ? "text-[#c8e0f5]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                AI Insights
                {activeTab === "insights" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8e0f5]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={`px-6 py-3 font-medium transition-all relative ${
                  activeTab === "monitoring"
                    ? "text-[#ddc8f5]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Live Monitoring
                {activeTab === "monitoring" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ddc8f5]"></div>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[1800px] mx-auto">
            {activeTab === "predictions" && <PredictionsTab />}
            {activeTab === "insights" && <InsightsTab />}
            {activeTab === "monitoring" && <MonitoringTab />}
          </div>
        </div>
      </div>
    
  );
}

function PredictionsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Predictions */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#c4dfc4]" />
          Upcoming Risk Predictions
        </h2>

        {/* High Risk Prediction */}
        <Card className="bg-[#1a1a1a] border-[#ff6b6b]/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-[#ff6b6b]/20 rounded-lg p-3">
                <AlertTriangle className="w-6 h-6 text-[#ff6b6b]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30">
                    HIGH RISK
                  </Badge>
                  <Badge className="bg-white/5 text-gray-400 border-white/10">
                    <Clock className="w-3 h-3 mr-1" />
                    48 hours
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Cold Storage Violation Likely - Location 7
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  AI predicts 89% probability of temperature violation in Walk-in Cooler #2 by Friday 2:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-white mb-3">Contributing Factors:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff6b6b] rounded-full"></div>
                <span className="text-gray-300">Equipment age: 8.2 years (above fleet average)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff6b6b] rounded-full"></div>
                <span className="text-gray-300">Recent temp fluctuations: +3.2°F variance last week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff6b6b] rounded-full"></div>
                <span className="text-gray-300">Pattern match: Similar conditions preceded 4 past violations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff6b6b] rounded-full"></div>
                <span className="text-gray-300">Increased door cycles: +47% vs typical Thursday</span>
              </div>
            </div>
          </div>

          <div className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c4dfc4]" />
              AI-Recommended Actions:
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Schedule immediate equipment inspection (maintenance dispatch ready)</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Increase monitoring frequency to every 15 minutes until resolved</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Prepare backup cooler space (Location 6 has capacity)</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold">
              Deploy All Actions
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Schedule Maintenance
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              View Details
            </Button>
          </div>
        </Card>

        {/* Medium Risk */}
        <Card className="bg-[#1a1a1a] border-[#f5edc8]/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-[#f5edc8]/20 rounded-lg p-3">
                <Activity className="w-6 h-6 text-[#f5edc8]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#f5edc8]/20 text-[#f5edc8] border-[#f5edc8]/30">
                    MEDIUM RISK
                  </Badge>
                  <Badge className="bg-white/5 text-gray-400 border-white/10">
                    <Clock className="w-3 h-3 mr-1" />
                    72 hours
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Staffing Gap May Impact Compliance - Locations 3, 12
                </h3>
                <p className="text-sm text-gray-400">
                  Weekend shift coverage shows similar patterns to previous compliance dips
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full">
            Review Recommendations <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Low Risk */}
        <Card className="bg-[#1a1a1a] border-[#c8e0f5]/30 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-[#c8e0f5]/20 rounded-lg p-3">
                <CheckCircle2 className="w-6 h-6 text-[#c8e0f5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#c8e0f5]/20 text-[#c8e0f5] border-[#c8e0f5]/30">
                    LOW RISK
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  All Other Locations Optimal
                </h3>
                <p className="text-sm text-gray-400">
                  No predicted risks across remaining 18 locations through next week
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Prediction Performance</h2>

        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Last 30 Days</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Prediction Accuracy</span>
                <span className="text-lg font-bold text-[#c4dfc4]">91.3%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-[#c4dfc4] h-2 rounded-full" style={{ width: '91.3%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Violations Prevented</span>
                <span className="text-lg font-bold text-[#c8e0f5]">23</span>
              </div>
              <p className="text-xs text-gray-500">Estimated $67K in fines avoided</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Avg Warning Time</span>
                <span className="text-lg font-bold text-[#ddc8f5]">51 hrs</span>
              </div>
              <p className="text-xs text-gray-500">Sufficient time for intervention</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">False Positives</span>
                <span className="text-lg font-bold text-[#f5edc8]">8.7%</span>
              </div>
              <p className="text-xs text-gray-500">Below industry benchmark</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Top Risk Factors</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Equipment Age</span>
              <span className="text-xs text-gray-500">32% of risks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Staffing Patterns</span>
              <span className="text-xs text-gray-500">28% of risks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Seasonal Volume</span>
              <span className="text-xs text-gray-500">21% of risks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Historical Patterns</span>
              <span className="text-xs text-gray-500">19% of risks</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border-[#c4dfc4]/30 p-6">
          <Sparkles className="w-8 h-8 text-[#c4dfc4] mb-3" />
          <h3 className="font-semibold text-white mb-2">Model Learning</h3>
          <p className="text-sm text-gray-400 mb-4">
            AI accuracy improves +2.1% per month as it learns your operation's unique patterns.
          </p>
          <Button variant="ghost" className="text-[#c4dfc4] hover:bg-[#c4dfc4]/10 p-0">
            View Training Data <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>
    </div>
  );
}

function InsightsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Insights */}
        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f5edc8]" />
            Efficiency Opportunities
          </h3>
          
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#f5edc8]/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">Checklist Consolidation</h4>
                <Badge className="bg-[#f5edc8]/20 text-[#f5edc8] border-[#f5edc8]/30">$12K/yr</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Locations 4, 9, and 15 have overlapping morning checklists. Consolidating could save 47 minutes daily per location.
              </p>
              <Button size="sm" className="bg-[#f5edc8] hover:bg-[#e5ddb8] text-[#0a0a0a] font-semibold">
                Auto-Consolidate
              </Button>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#c8e0f5]/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">Peak Time Optimization</h4>
                <Badge className="bg-[#c8e0f5]/20 text-[#c8e0f5] border-[#c8e0f5]/30">$8K/yr</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Shift non-critical checks from 11 AM-1 PM lunch rush to 10 AM prep window across all locations.
              </p>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Review Schedule
              </Button>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#ddc8f5]/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">Cross-Location Learning</h4>
                <Badge className="bg-[#ddc8f5]/20 text-[#ddc8f5] border-[#ddc8f5]/30">Best Practice</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Location 12's morning prep workflow is 23% faster. AI recommends deploying their checklist order fleet-wide.
              </p>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Compare Workflows
              </Button>
            </div>
          </div>
        </Card>

        {/* Compliance Insights */}
        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c4dfc4]" />
            Compliance Intelligence
          </h3>
          
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Pattern Detection</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Monday mornings</span> show 34% higher check completion times. Consider adding 15-min buffer to schedules.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Temperature logs</span> at Locations 7 & 19 are consistently submitted at identical times. Verify authenticity.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-[#c4dfc4] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Staff turnover</span> correlates with 15% compliance dip. Automated onboarding checklists recommended.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border border-[#c4dfc4]/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Trend Analysis</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-white">96.2%</span>
                <TrendingUp className="w-5 h-5 text-[#c4dfc4]" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Network-wide compliance score</p>
              <p className="text-xs text-[#c4dfc4]">+4.7% vs 90 days ago</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Training Recommendations
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                3 staff members across 2 locations show repeated allergen checklist errors. Targeted training module deployed.
              </p>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full">
                View Training Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-[#1a1a1a] border-white/10 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ddc8f5]" />
          This Week's AI Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#c4dfc4]/30">
            <div className="text-3xl mb-2">📋</div>
            <h4 className="font-semibold text-white mb-2">New Checklist Suggested</h4>
            <p className="text-sm text-gray-400 mb-3">
              "Seasonal Menu Transition" checklist based on current kitchen activity patterns
            </p>
            <Button size="sm" className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] w-full font-semibold">
              Generate & Preview
            </Button>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#c8e0f5]/30">
            <div className="text-3xl mb-2">⏰</div>
            <h4 className="font-semibold text-white mb-2">Timing Adjustment</h4>
            <p className="text-sm text-gray-400 mb-3">
              Move closing checklists 30 minutes earlier based on actual service end times
            </p>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full">
              Review Changes
            </Button>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#ddc8f5]/30">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="font-semibold text-white mb-2">Recognition Opportunity</h4>
            <p className="text-sm text-gray-400 mb-3">
              Location 8 achieved 30-day perfect compliance. Automated recognition sent.
            </p>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full">
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MonitoringTab() {
  return (
    <div className="space-y-6">
      {/* Live Location Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#ddc8f5]" />
          Live Location Monitoring
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-[#1a1a1a] border-white/10 p-4 hover:border-[#c4dfc4]/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">Location {i + 1}</h4>
                  <p className="text-xs text-gray-500">Senior Living Facility</p>
                </div>
                <div className="w-2 h-2 bg-[#c4dfc4] rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Compliance</span>
                  <span className="text-[#c4dfc4] font-semibold">{94 + Math.floor(Math.random() * 6)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Checks</span>
                  <span className="text-white">{Math.floor(Math.random() * 5)}/12</span>
                </div>
              </div>

              {/* Mini sensor readings */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                <div className="text-center">
                  <Thermometer className="w-3 h-3 text-[#c8e0f5] mx-auto mb-1" />
                  <div className="text-xs text-gray-400">38°F</div>
                </div>
                <div className="text-center">
                  <Camera className="w-3 h-3 text-[#ddc8f5] mx-auto mb-1" />
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <Radio className="w-3 h-3 text-[#f5edc8] mx-auto mb-1" />
                  <div className="text-xs text-gray-400">12 sensors</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Monitoring Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#ddc8f5]" />
            Vision Systems Status
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#c4dfc4] rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-white">Kitchen Camera Array</div>
                  <div className="text-xs text-gray-500">24 cameras active</div>
                </div>
              </div>
              <Badge className="bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#c4dfc4] rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-white">Food Probing Detection</div>
                  <div className="text-xs text-gray-500">Auto-capture enabled</div>
                </div>
              </div>
              <Badge className="bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#c4dfc4] rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-white">Compliance Monitoring</div>
                  <div className="text-xs text-gray-500">Gloves, hairnets, uniforms</div>
                </div>
              </div>
              <Badge className="bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400 mb-2">Today's Captures</div>
            <div className="text-2xl font-bold text-white">1,847 <span className="text-sm font-normal text-gray-500">images</span></div>
          </div>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#f5edc8]" />
            IoT Sensor Network
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Thermometer className="w-4 h-4 text-[#c8e0f5]" />
                <div>
                  <div className="text-sm font-medium text-white">Temperature Sensors</div>
                  <div className="text-xs text-gray-500">147 active across network</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">147/150</div>
                <div className="text-xs text-gray-500">98% uptime</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#ddc8f5]" />
                <div>
                  <div className="text-sm font-medium text-white">Proximity Sensors</div>
                  <div className="text-xs text-gray-500">RFID tracking</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">89/92</div>
                <div className="text-xs text-gray-500">97% uptime</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-[#c4dfc4]" />
                <div>
                  <div className="text-sm font-medium text-white">Audio Capture</div>
                  <div className="text-xs text-gray-500">Voice transcription</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">24/24</div>
                <div className="text-xs text-gray-500">100% uptime</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400 mb-2">Data Points Today</div>
            <div className="text-2xl font-bold text-white">34,291 <span className="text-sm font-normal text-gray-500">readings</span></div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-[#1a1a1a] border-white/10 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#c8e0f5]" />
          Live Activity Feed
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {[
            { time: "2 min ago", location: "Location 7", event: "Temperature check completed automatically", status: "success", icon: Thermometer },
            { time: "4 min ago", location: "Location 3", event: "Vision system detected food probing - data captured", status: "success", icon: Camera },
            { time: "7 min ago", location: "Location 12", event: "Morning checklist 94% complete", status: "progress", icon: CheckCircle2 },
            { time: "9 min ago", location: "Location 5", event: "Voice command: 'Complete allergen check'", status: "success", icon: Mic },
            { time: "12 min ago", location: "Location 19", event: "Predictive alert resolved - no action needed", status: "info", icon: Brain },
            { time: "15 min ago", location: "Location 8", event: "Equipment sensor detected minor variance - monitoring", status: "warning", icon: AlertTriangle },
            { time: "18 min ago", location: "Location 1", event: "All scheduled checks completed for morning shift", status: "success", icon: CheckCircle2 },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#0a0a0a]/70 transition-all">
              <div className={`p-2 rounded-lg ${
                item.status === 'success' ? 'bg-[#c4dfc4]/20' :
                item.status === 'warning' ? 'bg-[#f5edc8]/20' :
                item.status === 'progress' ? 'bg-[#c8e0f5]/20' :
                'bg-white/5'
              }`}>
                <item.icon className={`w-4 h-4 ${
                  item.status === 'success' ? 'text-[#c4dfc4]' :
                  item.status === 'warning' ? 'text-[#f5edc8]' :
                  item.status === 'progress' ? 'text-[#c8e0f5]' :
                  'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{item.location}</span>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
                <p className="text-sm text-gray-400">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

