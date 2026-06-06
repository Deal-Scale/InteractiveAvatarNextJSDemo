"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
	setForwardedRef,
	useOutsidePointerClose,
} from "./use-overlay-outside-close";

const OPAQUE_OVERLAY_BACKGROUND = "#020617";
const OPAQUE_OVERLAY_FOREGROUND = "#f8fafc";

const DropdownMenuCloseContext = React.createContext<{
	close: () => void;
	triggerRef: React.RefObject<HTMLElement | null>;
} | null>(null);

const DropdownMenu = ({
	open,
	defaultOpen,
	onOpenChange,
	modal = false,
	...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) => {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
		defaultOpen ?? false,
	);
	const isControlled = open !== undefined;
	const currentOpen = isControlled ? open : uncontrolledOpen;

	const setOpen = React.useCallback(
		(nextOpen: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
		},
		[isControlled, onOpenChange],
	);

	const close = React.useCallback(() => {
		setOpen(false);
	}, [setOpen]);
	const triggerRef = React.useRef<HTMLElement | null>(null);
	const contextValue = React.useMemo(() => ({ close, triggerRef }), [close]);

	return (
		<DropdownMenuCloseContext.Provider value={contextValue}>
			<DropdownMenuPrimitive.Root
				open={currentOpen}
				onOpenChange={setOpen}
				modal={modal}
				{...props}
			/>
		</DropdownMenuCloseContext.Provider>
	);
};
const DropdownMenuTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>((props, ref) => {
	const closeContext = React.useContext(DropdownMenuCloseContext);

	return (
		<DropdownMenuPrimitive.Trigger
			ref={(node) => {
				if (closeContext) {
					closeContext.triggerRef.current = node;
				}
				setForwardedRef(ref, node);
			}}
			{...props}
		/>
	);
});
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ className, inset, children, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
			inset && "pl-8",
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRight className="ml-auto h-4 w-4" />
	</DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
	DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, style, ...props }, ref) => (
	<DropdownMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"!bg-popover !text-popover-foreground !opacity-100 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg backdrop-blur-none",
			className,
		)}
		style={{
			...style,
			backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
			color: OPAQUE_OVERLAY_FOREGROUND,
			isolation: "isolate",
			opacity: 1,
		}}
		{...props}
	/>
));
DropdownMenuSubContent.displayName =
	DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(
	(
		{ className, sideOffset = 4, style, onPointerDownOutside, ...props },
		ref,
	) => {
		const closeContext = React.useContext(DropdownMenuCloseContext);
		const ignoredRefs = React.useMemo(
			() => (closeContext ? [closeContext.triggerRef] : []),
			[closeContext],
		);
		const contentRef = useOutsidePointerClose<
			React.ElementRef<typeof DropdownMenuPrimitive.Content>
		>(closeContext?.close ?? null, ignoredRefs);

		return (
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					ref={(node) => {
						contentRef.current = node;
						setForwardedRef(ref, node);
					}}
					sideOffset={sideOffset}
					className={cn(
						"!bg-popover !text-popover-foreground !opacity-100 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md backdrop-blur-none",
						className,
					)}
					style={{
						...style,
						backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
						color: OPAQUE_OVERLAY_FOREGROUND,
						isolation: "isolate",
						opacity: 1,
					}}
					onPointerDownOutside={(event) => {
						const target = event.target;

						if (
							target instanceof Node &&
							closeContext?.triggerRef.current?.contains(target)
						) {
							event.preventDefault();
						}
						onPointerDownOutside?.(event);
					}}
					{...props}
				/>
			</DropdownMenuPrimitive.Portal>
		);
	},
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const dropdownMenuItemStyle = {
	backgroundColor: "var(--overlay-item-background)",
	color: OPAQUE_OVERLAY_FOREGROUND,
	opacity: 1,
	"--overlay-item-background": OPAQUE_OVERLAY_BACKGROUND,
} as React.CSSProperties;

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({ className, inset, style, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={cn(
			"!text-popover-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors [--overlay-item-background:#020617] focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 focus:[--overlay-item-background:#1e293b] data-[highlighted]:[--overlay-item-background:#1e293b]",
			inset && "pl-8",
			className,
		)}
		style={{ ...style, ...dropdownMenuItemStyle }}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, style, ...props }, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"!text-popover-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors [--overlay-item-background:#020617] focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 focus:[--overlay-item-background:#1e293b] data-[highlighted]:[--overlay-item-background:#1e293b]",
			className,
		)}
		checked={checked}
		style={{ ...style, ...dropdownMenuItemStyle }}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<Check className="h-4 w-4" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, style, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"!text-popover-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors [--overlay-item-background:#020617] focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 focus:[--overlay-item-background:#1e293b] data-[highlighted]:[--overlay-item-background:#1e293b]",
			className,
		)}
		style={{ ...style, ...dropdownMenuItemStyle }}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<Circle className="h-2 w-2 fill-current" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-2 py-1.5 font-semibold text-sm",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
	<span
		className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
		{...props}
	/>
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
