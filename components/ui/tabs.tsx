"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
	value?: string;
	setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
	value,
	defaultValue,
	onValueChange,
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}) {
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const currentValue = value ?? internalValue;
	const setValue = React.useCallback(
		(nextValue: string) => {
			setInternalValue(nextValue);
			onValueChange?.(nextValue);
		},
		[onValueChange],
	);

	return (
		<TabsContext.Provider value={{ value: currentValue, setValue }}>
			<div className={cn("w-full", className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	);
}

function useTabsContext(component: string) {
	const context = React.useContext(TabsContext);
	if (!context) throw new Error(`${component} must be used within Tabs`);
	return context;
}

const TabsList = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		role="tablist"
		className={cn(
			"inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
			className,
		)}
		{...props}
	/>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, type = "button", ...props }, ref) => {
	const context = useTabsContext("TabsTrigger");
	const selected = context.value === value;

	return (
		<button
			ref={ref}
			type={type}
			role="tab"
			aria-selected={selected}
			data-state={selected ? "active" : "inactive"}
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
				className,
			)}
			onClick={(event) => {
				props.onClick?.(event);
				if (!event.defaultPrevented) context.setValue(value);
			}}
			{...props}
		/>
	);
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
	const context = useTabsContext("TabsContent");
	const selected = context.value === value;

	if (!selected) return null;

	return (
		<div
			ref={ref}
			role="tabpanel"
			data-state="active"
			className={cn(
				"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		/>
	);
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
