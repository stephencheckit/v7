"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <LogIn className="w-8 h-8 text-gray-400" />
          <h1 className="text-3xl font-bold text-white">Checkit V7</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Sign In</h2>
        <p className="text-gray-400 mb-8">
          Authentication coming soon! We're currently in development.
        </p>

        <div className="space-y-4">
          <Link href="/">
            <Button 
              className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#c4dfc4] hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

