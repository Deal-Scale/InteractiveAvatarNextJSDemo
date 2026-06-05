import * as SelectPrimitive from "@radix-ui/react-select";
import { useState } from "react";

import { ChevronDownIcon } from "./Icons";

const OPAQUE_OVERLAY_BACKGROUND = "#020617";
const OPAQUE_OVERLAY_FOREGROUND = "#f8fafc";

interface SelectProps<T> {
	options: T[];
	renderOption: (option: T) => React.ReactNode;
	onSelect: (option: T) => void;
	isSelected: (option: T) => boolean;
	value: string | null | undefined;
	placeholder?: string;
	disabled?: boolean;
}

export function Select<T>(props: SelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<SelectPrimitive.Root
			disabled={props.disabled}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectPrimitive.Trigger className="flex min-h-[36px] w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-popover px-4 py-2 text-popover-foreground text-sm shadow-sm disabled:opacity-50">
				<div
					className={`${props.value ? "text-foreground" : "text-muted-foreground"}`}
				>
					{props.value ? props.value : props.placeholder}
				</div>
				<ChevronDownIcon className="h-4 w-4" />
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					align="start"
					avoidCollisions={false}
					className="z-[80] flex max-h-[60vh] w-[var(--radix-select-trigger-width)] min-w-[220px] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground opacity-100 shadow-xl"
					side="bottom"
					position="popper"
					sideOffset={5}
					style={{
						backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
						color: OPAQUE_OVERLAY_FOREGROUND,
						isolation: "isolate",
						opacity: 1,
					}}
				>
					<SelectPrimitive.Viewport
						className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-popover px-0 py-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-popover [&::-webkit-scrollbar]:w-2"
						style={{ backgroundColor: OPAQUE_OVERLAY_BACKGROUND }}
					>
						{props.options.map((option) => {
							const isSelected = props.isSelected(option);
							const optionLabel = props.renderOption(option);

							return (
								<SelectPrimitive.Item
									key={`${props.placeholder ?? "option"}-${props.options.indexOf(option)}`}
									className={`relative flex w-full cursor-pointer select-none items-center px-4 py-2 text-left text-sm outline-none ${
										isSelected
											? "bg-accent text-accent-foreground"
											: "text-popover-foreground"
									}`}
									style={{
										backgroundColor: isSelected
											? undefined
											: OPAQUE_OVERLAY_BACKGROUND,
										color: isSelected ? undefined : OPAQUE_OVERLAY_FOREGROUND,
									}}
									value={`${props.options.indexOf(option)}`}
									onSelect={() => {
										props.onSelect(option);
										setIsOpen(false);
									}}
								>
									<SelectPrimitive.ItemText>
										{optionLabel}
									</SelectPrimitive.ItemText>
								</SelectPrimitive.Item>
							);
						})}
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
