import React from "react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  isConnecting: boolean;
  disabled: boolean;
  onClick: () => void;
}

const StartSessionButton: React.FC<Props> = ({ isConnecting, disabled, onClick }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-md inline-flex">
      {disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex w-full">
                <button
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-full"
                  onClick={onClick}
                  disabled
                >
                  {isConnecting ? "Connecting..." : "Start Session"}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">Set up your agent and settings first</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-full"
          onClick={onClick}
        >
          {isConnecting ? "Connecting..." : "Start Session"}
        </button>
      )}
      <BorderBeam borderWidth={2} duration={8} size={90} />
    </div>
  );
};

export default StartSessionButton;
