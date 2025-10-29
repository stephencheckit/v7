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
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/90 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0a0a0a]">Workflow Automation</h2>
              <p className="text-sm text-gray-700">Build powerful if-this-then-that automations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* What Are Workflows */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-[#0a0a0a]" />
              <h3 className="text-xl font-semibold text-[#0a0a0a]">What are Workflows?</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Workflows automate your operations by connecting triggers to actions. When something happens 
              (a form is submitted, a sensor alerts, a deadline is missed), workflows automatically take action 
              (send notifications, create tasks, update records).
            </p>
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 p-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="px-3 py-1 bg-white rounded-lg font-medium text-blue-700">
                  IF trigger happens
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="px-3 py-1 bg-white rounded-lg font-medium text-purple-700">
                  THEN do action(s)
                </div>
              </div>
            </Card>
          </section>

          {/* Available Triggers */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-[#0a0a0a]" />
              <h3 className="text-xl font-semibold text-[#0a0a0a]">Triggers</h3>
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                Live Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <Thermometer className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Sensor Alerts</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Temp exceeds/drops below thresholds
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Form Events</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Submitted, overdue, or missed
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Scheduled</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Time-based (daily at 9am, Mon-Fri)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500 opacity-60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Custom Events</h4>
                    <p className="text-xs text-gray-600 mt-1">
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
              <Zap className="h-5 w-5 text-[#0a0a0a]" />
              <h3 className="text-xl font-semibold text-[#0a0a0a]">Actions</h3>
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                Live Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Send Email</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Notify team members or roles
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Send SMS</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Text alerts for urgent issues
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Create Task</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-assign follow-up work
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500 opacity-60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Update Records</h4>
                    <p className="text-xs text-gray-600 mt-1">
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
              <Sparkles className="h-5 w-5 text-[#0a0a0a]" />
              <h3 className="text-xl font-semibold text-[#0a0a0a]">Real-World Examples</h3>
            </div>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">🌡️ Temperature Monitoring</h4>
                <p className="text-xs text-blue-800">
                  <strong>IF</strong> freezer temp exceeds -15°C for 10 minutes → 
                  <strong> THEN</strong> email kitchen manager + send SMS + create urgent task
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <h4 className="font-semibold text-sm text-green-900 mb-2">📋 Safety Compliance</h4>
                <p className="text-xs text-green-800">
                  <strong>IF</strong> safety inspection submitted with critical issue → 
                  <strong> THEN</strong> email regional manager + create follow-up task
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">⏰ Daily Reminders</h4>
                <p className="text-xs text-purple-800">
                  <strong>IF</strong> 8:30am Monday-Friday → 
                  <strong> THEN</strong> email team with today's checklist assignments
                </p>
              </Card>
            </div>
          </section>

          {/* Future Vision */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-[#0a0a0a]" />
              <h3 className="text-xl font-semibold text-[#0a0a0a]">What's Coming</h3>
              <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
                Roadmap
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-700">Q1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Conditional Logic</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Multi-step workflows with IF/ELSE branches and complex conditions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-700">Q2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Integrations</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Connect to Slack, Teams, webhooks, and external APIs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-700">Q3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">AI-Powered Actions</h4>
                  <p className="text-xs text-gray-600 mt-1">
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
            <p className="text-sm text-gray-700 mb-4">
              Use the AI Operator to describe your workflow in plain English, and we'll build it for you.
            </p>
            <Button 
              onClick={onClose}
              className="bg-[#0a0a0a] text-white hover:bg-gray-800"
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

