"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface EmailCaptureProps {
  size?: "default" | "large";
  placeholder?: string;
  buttonText?: string;
  variant?: "default" | "outline";
}

export function EmailCapture({ 
  size = "default", 
  placeholder = "Enter your email",
  buttonText = "Get Early Access",
  variant = "default"
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you! CheckitV7 is currently in development. We'll be in touch soon!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-[#c4dfc4]/20 border border-[#c4dfc4]/40 rounded-lg p-6 animate-fade-in">
        <CheckCircle2 className="w-6 h-6 text-[#c4dfc4] flex-shrink-0" />
        <div>
          <p className="text-white font-semibold mb-1">Success!</p>
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  const isLarge = size === "large";
  const inputClasses = isLarge
    ? "flex-1 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-[#c4dfc4] transition-colors"
    : "flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#c4dfc4] transition-colors";

  const buttonClasses = variant === "outline"
    ? "border-2 border-white/20 hover:border-[#c4dfc4] bg-transparent text-white hover:text-[#c4dfc4]"
    : "bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder={placeholder}
          className={inputClasses}
          disabled={status === "loading"}
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className={`${buttonClasses} ${isLarge ? 'px-8 py-4 text-lg' : 'px-6 py-3'} font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
        >
          {status === "loading" ? "Submitting..." : buttonText}
          {status !== "loading" && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-sm mt-2">{message}</p>
      )}
    </form>
  );
}

