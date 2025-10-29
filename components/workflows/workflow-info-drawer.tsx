"use client";

import { X, Zap, Bell, Calendar, Thermometer, FileText, Mail, MessageSquare, CheckSquare, ArrowRight, Sparkles, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface WorkflowInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowInfoDrawer({ isOpen, onClose }: WorkflowInfoDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0a0a0a] shadow-2xl z-50 overflow-y-auto border-l border-[#2a2a2a]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#c4dfc4]/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#c4dfc4]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Workflow Automation</h2>
              <p className="text-sm text-gray-400">Build powerful if-this-then-that automations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* What Are Workflows */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">What are Workflows?</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Workflows automate your operations by connecting triggers to actions. When something happens 
              (a form is submitted, a sensor alerts, a deadline is missed), workflows automatically take action 
              (send notifications, create tasks, update records).
            </p>
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="px-3 py-1 bg-blue-500/20 rounded-lg font-medium text-blue-300">
                  IF trigger happens
                </div>
                <ArrowRight className="h-4 w-4 text-gray-500" />
                <div className="px-3 py-1 bg-purple-500/20 rounded-lg font-medium text-purple-300">
                  THEN do action(s)
                </div>
              </div>
            </Card>
          </section>

          {/* Available Triggers */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">Triggers</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Live Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 border-l-4 border-l-blue-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <Thermometer className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Sensor Alerts</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Temp exceeds/drops below thresholds
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Form Events</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted, overdue, or missed
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Scheduled</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Time-based (daily at 9am, Mon-Fri)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500 bg-[#1a1a1a] border-[#2a2a2a] opacity-60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Custom Events</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Coming soon: Webhooks, API calls
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Available Actions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">Actions</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Live Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 border-l-4 border-l-blue-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Send Email</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Notify team members or roles
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Send SMS</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Text alerts for urgent issues
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Create Task</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Auto-assign follow-up work
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500 bg-[#1a1a1a] border-[#2a2a2a] opacity-60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Update Records</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Coming soon: Modify form data
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Real-World Examples */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">Real-World Examples</h3>
            </div>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <h4 className="font-semibold text-sm text-blue-300 mb-2">🌡️ Temperature Monitoring</h4>
                <p className="text-xs text-gray-300">
                  <strong>IF</strong> freezer temp exceeds -15°C for 10 minutes → 
                  <strong> THEN</strong> email kitchen manager + send SMS + create urgent task
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
                <h4 className="font-semibold text-sm text-green-300 mb-2">📋 Safety Compliance</h4>
                <p className="text-xs text-gray-300">
                  <strong>IF</strong> safety inspection submitted with critical issue → 
                  <strong> THEN</strong> email regional manager + create follow-up task
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <h4 className="font-semibold text-sm text-purple-300 mb-2">⏰ Daily Reminders</h4>
                <p className="text-xs text-gray-300">
                  <strong>IF</strong> 8:30am Monday-Friday → 
                  <strong> THEN</strong> email team with today's checklist assignments
                </p>
              </Card>
            </div>
          </section>

          {/* Future Vision */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">What's Coming</h3>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Roadmap
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-400">Q1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Conditional Logic</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Multi-step workflows with IF/ELSE branches and complex conditions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-400">Q2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Integrations</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Connect to Slack, Teams, webhooks, and external APIs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-400">Q3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">AI-Powered Actions</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Auto-summarize responses, generate reports, intelligent routing
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] border-0 p-6 text-center">
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">
              Ready to automate your operations?
            </h3>
            <p className="text-sm text-[#0a0a0a]/70 mb-4">
              Use the AI Operator to describe your workflow in plain English, and we'll build it for you.
            </p>
            <Button 
              onClick={onClose}
              className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}

