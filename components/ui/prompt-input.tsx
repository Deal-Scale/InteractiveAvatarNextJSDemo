"use client";

import React, {
	createContext,
	useLayoutEffect,
	useContext,
	useEffect,
	useRef,
	useMemo,
	useState,
} from "react";

import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PromptInputContextType = {
	isLoading: boolean;
	value: string;
	setValue: (value: string) => void;
	maxHeight: number | string;
	onSubmit?: () => void;
	disabled?: boolean;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

const PromptInputContext = createContext<PromptInputContextType>({
	isLoading: false,
	value: "",
	setValue: () => {},
	maxHeight: 240,
	onSubmit: undefined,
	disabled: false,
	textareaRef: React.createRef<HTMLTextAreaElement>(),
});

function usePromptInput() {
	const context = useContext(PromptInputContext);

	if (!context) {
		throw new Error("usePromptInput must be used within a PromptInput");
	}

	return context;
}

type PromptInputProps = React.HTMLAttributes<HTMLDivElement> & {
	isLoading?: boolean;
	value?: string;
	onValueChange?: (value: string) => void;
	maxHeight?: number | string;
	onSubmit?: () => void;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

function PromptInput({
	className,
	isLoading = false,
	maxHeight = 240,
	value,
	onValueChange,
	onSubmit,
	children,
	disabled = false,
	textareaRef: externalTextareaRef,
	...props
}: PromptInputProps) {
	const [internalValue, setInternalValue] = useState(value || "");
	const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
	const textareaRef = externalTextareaRef ?? internalTextareaRef;

	const handleChange = (newValue: string) => {
		setInternalValue(newValue);
		onValueChange?.(newValue);
	};

	return (
		<TooltipProvider>
			<PromptInputContext.Provider
				value={useMemo(
					() => ({
						isLoading,
						value: value ?? internalValue,
						setValue: onValueChange ?? handleChange,
						maxHeight,
						onSubmit,
						disabled,
						textareaRef,
					}),
					[
						disabled,
						handleChange,
						internalValue,
						isLoading,
						maxHeight,
						onSubmit,
						onValueChange,
						textareaRef,
						value,
					],
				)}
			>
				<div
					{...props}
					className={cn(
						"border-input bg-background cursor-text rounded-3xl border p-2 shadow-xs",
						className,
					)}
					role="button"
					tabIndex={0}
					onClick={() => textareaRef.current?.focus()}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							textareaRef.current?.focus();
							return;
						}
						if (e.key === " ") {
							// Space pressed while wrapper has focus: focus textarea and insert a space
							e.preventDefault();
							const t = textareaRef.current;
							if (t) {
								t.focus();
								const start = t.selectionStart ?? t.value.length;
								const end = t.selectionEnd ?? t.value.length;
								t.setRangeText(" ", start, end, "end");
								// Notify React controlled input
								t.dispatchEvent(new Event("input", { bubbles: true }));
							}
						}
					}}
				>
					{children}
				</div>
			</PromptInputContext.Provider>
		</TooltipProvider>
	);
}

export type PromptInputTextareaProps = {
	disableAutosize?: boolean;
} & React.ComponentProps<typeof Textarea>;

function PromptInputTextarea({
	className,
	onKeyDown,
	disableAutosize = false,
	...props
}: PromptInputTextareaProps) {
	const { value, setValue, maxHeight, onSubmit, disabled, textareaRef } =
		usePromptInput();
	const lastHeightRef = useRef<string | null>(null);

	useLayoutEffect(() => {
		if (disableAutosize) return;

		if (!textareaRef.current) return;
		textareaRef.current.style.height = "auto";
		const nextHeight =
			typeof maxHeight === "number"
				? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
				: `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
		if (lastHeightRef.current !== nextHeight) {
			textareaRef.current.style.height = nextHeight;
			lastHeightRef.current = nextHeight;
		}
	}, [value, maxHeight, disableAutosize, textareaRef]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;

		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSubmit?.();
		}
	};

	return (
		<Textarea
			ref={textareaRef}
			className={cn(
				"text-primary min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
				className,
			)}
			disabled={disabled}
			rows={1}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={handleKeyDown}
			{...props}
		/>
	);
}

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActions({
	children,
	className,
	...props
}: PromptInputActionsProps) {
	return (
		<div className={cn("flex items-center gap-2", className)} {...props}>
			{children}
		</div>
	);
}

type PromptInputActionProps = {
	className?: string;
	tooltip: React.ReactNode;
	children: React.ReactNode;
	side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<typeof Tooltip>;

function PromptInputAction({
	tooltip,
	children,
	className,
	side = "top",
	...props
}: PromptInputActionProps) {
	const { disabled } = usePromptInput();

	return (
		<Tooltip {...props}>
			<TooltipTrigger
				asChild
				disabled={disabled}
				onClick={(event) => event.stopPropagation()}
			>
				{children}
			</TooltipTrigger>
			<TooltipContent className={className} side={side}>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);
}

export {
	PromptInput,
	PromptInputTextarea,
	PromptInputActions,
	PromptInputAction,
};
