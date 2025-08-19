"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ThemeProviderProps = React.ComponentProps<
	typeof NextThemesProvider
>;

export function ThemeProvider({
	children,
	attribute = "class",
	defaultTheme = "system",
	enableSystem = true,
	disableTransitionOnChange = true,
	...props
}: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute={attribute}
			defaultTheme={defaultTheme}
			disableTransitionOnChange={disableTransitionOnChange}
			enableSystem={enableSystem}
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}
