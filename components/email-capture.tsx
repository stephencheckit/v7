"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

interface EmailCaptureProps {
  size?: "default" | "large";
  placeholder?: string;
  buttonText?: string;
  variant?: "default" | "outline";
  layout?: "auto" | "vertical";
}

export function EmailCapture({ 
  size = "default", 
  placeholder = "Enter your email",
  buttonText = "Get Early Access",
  variant = "default",
  layout = "auto"
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if already submitted on mount
  useEffect(() => {
    const submitted = localStorage.getItem("checkit_waitlist_submitted");
    if (submitted === "true") {
      setIsSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check again if already submitted
    if (isSubmitted || localStorage.getItem("checkit_waitlist_submitted") === "true") {
      setStatus("error");
      setMessage("You've already joined the waitlist!");
      return;
    }
    
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
        // Mark as submitted globally
        localStorage.setItem("checkit_waitlist_submitted", "true");
        setIsSubmitted(true);
        setStatus("success");
        setShowModal(true);
        setEmail("");
        
        // Dispatch custom event to notify all forms
        window.dispatchEvent(new CustomEvent("waitlist-submitted"));
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  // Listen for submissions from other forms
  useEffect(() => {
    const handleWaitlistSubmitted = () => {
      setIsSubmitted(true);
    };

    window.addEventListener("waitlist-submitted", handleWaitlistSubmitted);
    return () => window.removeEventListener("waitlist-submitted", handleWaitlistSubmitted);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setStatus("idle");
  };

  const isLarge = size === "large";
  const inputClasses = isLarge
    ? "flex-1 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-[#c4dfc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    : "flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#c4dfc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const buttonClasses = variant === "outline"
    ? "border-2 border-white/20 hover:border-[#c4dfc4] bg-transparent text-white hover:text-[#c4dfc4]"
    : "bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]";

  return (
    <>
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#c4dfc4] rounded-2xl p-8 md:p-12 max-w-md w-full shadow-2xl animate-scale-in">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              {/* Success icon */}
              <div className="w-20 h-20 bg-[#c4dfc4]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#c4dfc4]" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-4">
                You're on the list!
              </h3>
              
              <p className="text-xl text-gray-300 mb-6">
                CheckitV7 is currently in development. We'll be in touch soon!
              </p>

              <Button
                onClick={closeModal}
                className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] px-8 py-6 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 w-full"
              >
                Back to Site
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`flex ${layout === "vertical" ? "flex-col" : "flex-col sm:flex-row"} gap-3`}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            placeholder={isSubmitted ? "Already joined!" : placeholder}
            className={inputClasses}
            disabled={status === "loading" || isSubmitted}
            required
          />
          <Button
            type="submit"
            disabled={status === "loading" || isSubmitted}
            className={`${buttonClasses} ${isLarge ? 'px-8 py-4 text-lg' : 'px-6 py-3'} ${layout === "vertical" ? "w-full" : ""} font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
          >
            {isSubmitted ? "Joined!" : status === "loading" ? "Submitting..." : buttonText}
            {status !== "loading" && !isSubmitted && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </div>
        {status === "error" && (
          <p className="text-red-400 text-sm mt-2">{message}</p>
        )}
      </form>
    </>
  );
}

