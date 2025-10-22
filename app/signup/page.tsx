"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4dfc4] via-[#ddc8f5] to-[#c8e0f5] flex items-center justify-center p-4">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      {/* Glass-morphism card */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-10 h-10 text-[#c4dfc4]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2a2a2a] to-[#4a4a4a] bg-clip-text text-transparent">
            Checkit V7
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>
        <p className="text-gray-600 mb-8">
          Authentication coming soon! We're currently in development.
        </p>

        <div className="space-y-4">
          <Link href="/">
            <Button 
              className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] hover:from-[#b5d0b5] hover:to-[#a5c0a5] text-gray-900 font-semibold shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#c4dfc4] hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

