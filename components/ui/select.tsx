"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const OPAQUE_OVERLAY_BACKGROUND = "#020617";
const OPAQUE_OVERLAY_FOREGROUND = "#f8fafc";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-popover px-3 py-2 text-popover-foreground text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1",
			className,
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon asChild>
			<ChevronDown className="h-4 w-4 opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollUpButton
		ref={ref}
		className={cn(
			"flex shrink-0 cursor-default items-center justify-center border-border border-b bg-popover py-1 text-muted-foreground",
			className,
		)}
		{...props}
	>
		<ChevronUp className="h-4 w-4" />
	</SelectPrimitive.ScrollUpButton>
));

SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollDownButton
		ref={ref}
		className={cn(
			"flex shrink-0 cursor-default items-center justify-center border-border border-t bg-popover py-1 text-muted-foreground",
			className,
		)}
		{...props}
	>
		<ChevronDown className="h-4 w-4" />
	</SelectPrimitive.ScrollDownButton>
));

SelectScrollDownButton.displayName =
	SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
		portal?: boolean;
	}
>(
	(
		{
			className,
			children,
			position = "popper",
			portal = true,
			style,
			...props
		},
		ref,
	) => {
		const content = (
			<SelectPrimitive.Content
				ref={ref}
				className={cn(
					"!bg-popover !text-popover-foreground !opacity-100 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-[10000] flex max-h-[min(60vh,var(--radix-select-content-available-height))] min-w-[8rem] origin-[--radix-select-content-transform-origin] flex-col overflow-hidden rounded-md border shadow-2xl backdrop-blur-none data-[state=closed]:animate-out data-[state=open]:animate-in",
					position === "popper" &&
						"data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1",
					className,
				)}
				position={position}
				style={{
					...style,
					backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
					color: OPAQUE_OVERLAY_FOREGROUND,
					isolation: "isolate",
					opacity: 1,
				}}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"!bg-popover min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-popover [&::-webkit-scrollbar]:w-2",
						position === "popper" &&
							"w-full min-w-[var(--radix-select-trigger-width)]",
					)}
					style={{
						backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
					}}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		);

		return portal ? (
			<SelectPrimitive.Portal>{content}</SelectPrimitive.Portal>
		) : (
			content
		);
	},
);

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("px-2 py-1.5 font-semibold text-sm", className)}
		{...props}
	/>
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, style, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-popover-foreground text-sm outline-none [--overlay-item-background:#020617] focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 focus:[--overlay-item-background:#1e293b] data-[highlighted]:[--overlay-item-background:#1e293b]",
			className,
		)}
		style={
			{
				...style,
				backgroundColor: "var(--overlay-item-background)",
				color: OPAQUE_OVERLAY_FOREGROUND,
				opacity: 1,
				"--overlay-item-background": OPAQUE_OVERLAY_BACKGROUND,
			} as React.CSSProperties
		}
		{...props}
	>
		<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectPrimitive.ItemIndicator>
				<Check className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));

SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
));

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
};
