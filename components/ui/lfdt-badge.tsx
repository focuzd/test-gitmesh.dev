"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface LFDTBadgeProps {
  className?: string
}

export function LFDTBadge({ className }: LFDTBadgeProps) {
  const disclaimerText = "LF Decentralized Trust governs the GitMesh CE GitHub repository. This website is hosted by Alveoli for community welfare and is not hosted or operated by LFDT."

  return (
    <span className={cn("inline-flex items-start gap-0.5", className)}>
      <span>LFDT</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="inline-flex items-center justify-center w-3 h-3 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help hover:bg-blue-200 transition-colors -mt-0.5"
            style={{ fontSize: '8px' }}
            aria-label="LFDT governance information"
          >
            i
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-xs text-sm"
          side="top"
          sideOffset={4}
        >
          <p>{disclaimerText}</p>
        </TooltipContent>
      </Tooltip>
    </span>
  )
}