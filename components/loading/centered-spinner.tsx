import { Loader2 } from "lucide-react";

interface CenteredSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function CenteredSpinner({ 
  message = "Loading...", 
  size = "lg",
  fullScreen = true 
}: CenteredSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const containerClass = fullScreen 
    ? "flex items-center justify-center min-h-screen" 
    : "flex items-center justify-center h-full py-12";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} text-[#c4dfc4] animate-spin mx-auto mb-4`} />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

