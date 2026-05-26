Rainbow Button

An animated button with a rainbow effect.

import { RainbowButton } from "@/registry/magicui/rainbow-button";
 
export function RainbowButtonDemo() {
  return <RainbowButton>Get Unlimited Access</RainbowButton>;
}

Installation

pnpm dlx shadcn@latest add "https://magicui.design/r/rainbow-button"

Usage

import { RainbowButton } from "@/components/magicui/rainbow-button";

<RainbowButton>Rainbow Button</RainbowButton>

Props
Prop	Type	Default	Description
children	React.ReactNode	-	The content to be displayed inside the button.
className	string	-	Additional CSS classes to be applied to the button.