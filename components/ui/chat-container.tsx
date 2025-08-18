"use client";

import React from "react";

import { cn } from "@/lib/utils";

export type ChatContainerRootProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerScrollAnchorProps = {
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

const ChatContainerRoot = React.forwardRef<HTMLDivElement, ChatContainerRootProps>(
  function ChatContainerRoot({ children, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          // Make root act as the scroll container and fill available space
          "relative flex w-full min-h-0 flex-col overflow-y-auto overflow-x-auto",
          className,
        )}
        role="log"
        {...props}
      >
        {children}
      </div>
    );
  },
);

function ChatContainerContent({ children, className, ...props }: ChatContainerContentProps) {
  return (
    <div
      className={cn("flex w-full flex-1 min-h-0 min-w-0 flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ChatContainerScrollAnchor({ // eslint-disable-line
  className,
  ...props
}: ChatContainerScrollAnchorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      {...props}
    />
  );
}

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor };

