"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// Alias primitive components to simple identifiers to avoid JSX member expressions
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipPortal = TooltipPrimitive.Portal;
const TooltipContentPrimitive = TooltipPrimitive.Content;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipContentPrimitive>,
	React.ComponentPropsWithoutRef<typeof TooltipContentPrimitive>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPortal>
		<TooltipContentPrimitive
			ref={ref}
			className={cn(
				"z-50 overflow-hidden rounded-md bg-accent px-3 py-1.5 text-xs text-accent-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
				className,
			)}
			sideOffset={sideOffset}
			{...props}
		/>
	</TooltipPortal>
));

TooltipContent.displayName = TooltipContentPrimitive.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
