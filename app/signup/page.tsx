"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, firstName, lastName);
      setSuccess(true);
      // Don't auto-redirect, user needs to confirm email first
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4dfc4] via-[#ddc8f5] to-[#c8e0f5] flex items-center justify-center p-4">
      {/* Full-page loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin" />
            <p className="text-white text-lg font-medium">Creating your account...</p>
          </div>
        </div>
      )}
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      {/* Glass-morphism card */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-10 h-10 text-[#c4dfc4]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2a2a2a] to-[#4a4a4a] bg-clip-text text-transparent">
            Checkit V7
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
        <p className="text-gray-600 mb-8 text-center">
          Get started with your free workspace.
        </p>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <p className="text-green-700 font-semibold mb-2">✅ Account created successfully!</p>
              <p className="text-gray-600 text-sm mb-4">
                Please check your email to confirm your account.
              </p>
            </div>
            <Link href="/signin">
              <Button className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] hover:from-[#b5d0b5] hover:to-[#a5c0a5] text-gray-900 font-semibold">
                Go to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] hover:from-[#b5d0b5] hover:to-[#a5c0a5] text-gray-900 font-semibold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 space-y-4">
          <Link href="/">
            <Button 
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#2a2a2a] hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
