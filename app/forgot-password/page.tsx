"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Mail className="w-8 h-8 text-gray-400" />
          <h1 className="text-3xl font-bold text-white">Checkit V7</h1>
        </div>

        {success ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-[#c4dfc4]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-400">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
            </div>

            <div className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300">
                <strong className="text-[#c4dfc4]">Next steps:</strong>
              </p>
              <ol className="text-sm text-gray-400 mt-2 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the reset link (valid for 1 hour)</li>
                <li>Set your new password</li>
              </ol>
            </div>

            <Link href="/signin">
              <Button 
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
            <p className="text-gray-400 mb-8 text-center">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Link href="/signin">
                <Button 
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

