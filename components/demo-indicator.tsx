import { FlaskRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoIndicatorProps {
  tooltip?: string;
  size?: "sm" | "md";
  className?: string;
}

export function DemoIndicator({ 
  tooltip = "Demo Data", 
  size = "sm",
  className = "" 
}: DemoIndicatorProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            <FlaskRound className={`${iconSize} text-amber-500/70`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#1a1a1a] border-amber-500/30 text-xs">
          <p className="flex items-center gap-1.5">
            <FlaskRound className="h-3 w-3 text-amber-500" />
            <span>{tooltip}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

