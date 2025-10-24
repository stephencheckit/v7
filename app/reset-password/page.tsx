"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user came from a valid password reset link
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setIsValidSession(false);
      } else {
        setIsValidSession(true);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin" />
            <p className="text-white text-lg font-medium">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session - expired or invalid link
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800">
          <div className="flex items-center justify-center gap-2 mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Checkit V7</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Link Expired</h2>
            <p className="text-gray-400">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300">
              <strong className="text-red-400">What happened?</strong>
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>Reset links expire after 1 hour</li>
              <li>Links can only be used once</li>
              <li>The link may have been already used</li>
            </ul>
          </div>

          <Link href="/forgot-password">
            <Button 
              className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold mb-3"
            >
              Request New Reset Link
            </Button>
          </Link>

          <Link href="/signin">
            <Button 
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock className="w-8 h-8 text-gray-400" />
          <h1 className="text-3xl font-bold text-white">Checkit V7</h1>
        </div>

        {success ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-[#c4dfc4]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-400">
                Your password has been successfully updated.
              </p>
            </div>

            <div className="bg-[#c4dfc4]/10 border border-[#c4dfc4]/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#c4dfc4] text-center">
                Redirecting to sign in...
              </p>
            </div>

            <Link href="/signin">
              <Button 
                className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900 font-semibold"
              >
                Go to Sign In
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Set New Password</h2>
            <p className="text-gray-400 mb-8 text-center">
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
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

