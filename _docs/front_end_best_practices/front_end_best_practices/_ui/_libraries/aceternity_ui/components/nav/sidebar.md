Sidebar

Expandable sidebar that expands on hover, mobile responsive and dark mode support
sidebar
special
utilities
dashboard
Open in
Avatar
Installation
Install util dependencies

npm i motion clsx tailwind-merge @tabler/icons-react

Add util file
lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

Copy the source code

components/ui/sidebar.tsx

"use client";
import { cn } from "@/lib/_utils";

import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
 
interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}
 
interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}
 
const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);
 
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
 
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
 
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
 
  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};
 
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};
 
export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};
 
export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};
 
export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
 
export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
 
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

Example
Default sidebar open

use the prop animate={false} to disable the animation
Open in
Acet Labs
Dashboard
Profile
Settings
Logout
AvatarManu Arora
Props
SidebarProvider Props
Prop Name	Type	Default	Description
children	React.ReactNode	-	The content to be rendered inside the provider.
open	boolean	false	Controls the open state of the sidebar.
setOpen	React.Dispatch<React.SetStateAction<boolean>>	-	Function to set the open state of the sidebar.
Sidebar Props
Prop Name	Type	Default	Description
children	React.ReactNode	-	The content to be rendered inside the sidebar.
open	boolean	false	Controls the open state of the sidebar.
setOpen	React.Dispatch<React.SetStateAction<boolean>>	-	Function to set the open state of the sidebar.
animate	boolean	true	Controls the animation of the sidebar. Put false if you want to disable animation
SidebarBody Props
Prop Name	Type	Default	Description
props	React.ComponentProps<typeof motion.div>	-	Props to be passed to the motion.div component.
DesktopSidebar Props
Prop Name	Type	Default	Description
className	string	-	Additional class names for styling.
children	React.ReactNode	-	The content to be rendered inside the desktop sidebar.
props	React.ComponentProps<typeof motion.div>	-	Props to be passed to the motion.div component.
MobileSidebar Props
Prop Name	Type	Default	Description
className	string	-	Additional class names for styling.
children	React.ReactNode	-	The content to be rendered inside the mobile sidebar.
props	React.ComponentProps<"div">	-	Props to be passed to the div component.
SidebarLink Props
Prop Name	Type	Default	Description
link	Links	-	The link object containing label, href, and icon.
className	string	-	Additional class names for styling.
props	LinkProps	-	Props to be passed to the Link component.
Links Interface
Property	Type	Description
label	string	The text label for the link.
href	string	The URL the link points to.
icon	React.JSX.Element | React.ReactNode	The icon to be displayed alongside the link.
SidebarContextProps Interface
Property	Type	Description
open	boolean	Indicates whether the sidebar is open.
setOpen	React.Dispatch<React.SetStateAction<boolean>>	Function to set the open state of the sidebar.