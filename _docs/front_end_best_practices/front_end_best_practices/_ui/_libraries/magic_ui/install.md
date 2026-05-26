Installation

How to install dependencies and structure your app.

Note: We have the exact same installation process as shadcn/ui.
Create project

Run the init command to create a new Next.js project or to setup an existing one:

pnpm dlx shadcn@latest init

Add components

You can now start adding components to your project.

pnpm dlx shadcn@latest add "https://magicui.design/r/globe.json"

Import component

The command above will add the Globe component to your project. You can then import it like this:

import { Globe } from "@/components/ui/globe";
 
export default function Home() {
  return (
    <div>
      <Globe />
    </div>
  );
}