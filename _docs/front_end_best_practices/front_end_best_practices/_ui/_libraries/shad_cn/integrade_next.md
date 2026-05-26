How to Integrate shadcn into Next.js 14: A Step-by-Step Guide
Love Trivedi
Love Trivedi
3 min read
·
Jan 9, 2025

ShadCN is a popular UI component library that combines utility-first styling with a robust design system. Pairing it with Next.js 14 allows developers to build dynamic and performant web applications with clean and reusable components.

This guide walks you through the process of integrating ShadCN into Next.js 14, complete with step-by-step instructions and detailed coding examples.
Why ShadCN?

Before diving in, let’s understand why ShadCN is worth considering:

    Customizable Components: Prebuilt but highly customizable.
    TypeScript Support: Designed with TypeScript for type safety.
    Tailwind CSS Friendly: Seamlessly integrates with Tailwind for utility-based styling.
    Accessibility: Ensures components are accessible out of the box.

Prerequisites

Before starting, ensure the following:

    Node.js >= 18.x
    Next.js 14 installed in your project
    Tailwind CSS configured (we’ll cover this)
    Basic knowledge of React and TypeScript

Step 1: Set Up a New Next.js 14 Project

If you don’t have a Next.js project yet, create one using the Next.js CLI.

npx create-next-app@latest my-next-app --typescript
cd my-next-app

Step 2: Install Tailwind CSS

ShadCN heavily relies on Tailwind CSS. Follow these steps to set it up:
Install Tailwind Dependencies

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

Configure Tailwind

Update the tailwind.config.js file:

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

Add Tailwind imports in styles/globals.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

Run the development server to verify the setup:

npm run dev

Step 3: Install ShadCN

ShadCN provides a CLI tool to streamline integration. Install it using the command:

npx shadcn-ui init

Follow the interactive CLI prompts to:

    Set the directory for components (e.g., components/ui).
    Choose Tailwind CSS as the styling framework.
    Include the base configuration and default themes.

Step 4: Add Components

ShadCN allows you to add specific components as needed. For example, to add a Button, run:

npx shadcn-ui add button

This generates a button.tsx file in the components/ui directory.
Step 5: Using ShadCN Components in Next.js

Let’s integrate the ShadCN Button component into your Next.js app.
Update the Button Component

The default ShadCN button is customizable. You can update its styling and functionality in components/ui/button.tsx.

Example:

import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded font-medium transition',
          variant === 'outline' && 'border border-gray-300',
          variant === 'ghost' && 'bg-transparent text-gray-600',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;

Using the Button

Now, use the button in a page component like pages/index.tsx:

import React from 'react';
import Button from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to ShadCN in Next.js 14</h1>
      <Button variant="default" className="bg-blue-600 text-white hover:bg-blue-700">
        Click Me
      </Button>
      <Button variant="outline" className="mt-4">
        Outline Button
      </Button>
    </main>
  );
}

Step 6: Adding More Components

You can add additional components like Card, Modal, or Dropdown by running similar commands.

npx shadcn-ui add card
npx shadcn-ui add modal

Customize them as needed and integrate them into your app.
Step 7: Theming ShadCN Components

ShadCN supports theming via Tailwind. To create a custom theme, update your tailwind.config.js:

theme: {
  extend: {
    colors: {
      primary: '#4F46E5', // Indigo
      secondary: '#10B981', // Green
    },
  },
},

Use these theme colors in your components:

<Button className="bg-primary text-white">Primary Button</Button>

Best Practices

    Keep Components Modular: Store reusable components in dedicated directories.
    Optimize for Accessibility: Use semantic HTML and ARIA attributes where necessary.
    Use Utilities Effectively: Leverage Tailwind’s utility classes for rapid styling.
    Test Responsiveness: Ensure components adapt to different screen sizes.

Conclusion

Integrating ShadCN with Next.js 14 offers a powerful combination of prebuilt, accessible components and utility-first styling. By following the steps above, you can quickly set up and customize your project to deliver scalable, maintainable, and visually appealing web applications.

Have you tried ShadCN in your Next.js projects? Share your thoughts and experiences below! 🚀