"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Keep loading state active during redirect
      // Use window.location instead of router.push to ensure middleware runs
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Full-page loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin" />
            <p className="text-white text-lg font-medium">Signing in...</p>
          </div>
        </div>
      )}
      
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-12 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-6">
          <LogIn className="w-8 h-8 text-gray-400" />
          <h1 className="text-3xl font-bold text-white">Checkit V7</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign In</h2>
        <p className="text-gray-400 mb-8 text-center">
          Welcome back! Sign in to your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
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
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <Link href="/">
            <Button 
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-400 text-center">
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
