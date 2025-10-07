Interactive Hover Button

A visually engaging button component that responds to hover with dynamic transitions, adapting smoothly between light and dark modes for enhanced user interactivity.

import { InteractiveHoverButton } from "@/registry/magicui/interactive-hover-button";
 
export function InteractiveHoverButtonDemo() {
  return <InteractiveHoverButton>Hover Me</InteractiveHoverButton>;
}

Installation

pnpm dlx shadcn@latest add "https://magicui.design/r/interactive-hover-button"

Usage

import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

<InteractiveHoverButton>Interactive Hover Button</InteractiveHoverButton>

Props
Prop	Type	Default	Description
text	string	Button	The text to be displayed inside the button
className	string	-	Additional class names to style the component
Credits