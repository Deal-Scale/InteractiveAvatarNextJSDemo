"use client";

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type FileUploadContextValue = {
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  multiple?: boolean;
  disabled?: boolean;
};

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export type FileUploadProps = {
  onFilesAdded: (files: File[]) => void;
  children: React.ReactNode;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
};

function FileUpload({
  onFilesAdded,
  children,
  multiple = true,
  accept,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles = Array.from(files);

      if (multiple) {
        onFilesAdded(newFiles);
      } else {
        onFilesAdded(newFiles.slice(0, 1));
      }
    },
    [multiple, onFilesAdded],
  );

  useEffect(() => {
    const isCustomAssetDrag = (e: DragEvent) => {
      try {
        const types = Array.from(e.dataTransfer?.types || []);
        return types.includes("application/x-asset");
      } catch {
        return false;
      }
    };

    const handleDrag = (e: DragEvent) => {
      if (isCustomAssetDrag(e)) {
        // Do not interfere with custom asset drags from sidebar
        // This prevents the full-screen overlay flicker
        // console.debug("[FileUpload] ignore dragover for custom asset");
        return;
      }
      console.debug("[FileUpload] dragover window");
      e.preventDefault();
      e.stopPropagation();
      // Keep overlay active while dragging over window for normal file drags
      if (!isDragging) setIsDragging(true);
    };

    const handleDragIn = (e: DragEvent) => {
      if (isCustomAssetDrag(e)) {
        // console.debug("[FileUpload] ignore dragenter for custom asset");
        return;
      }
      handleDrag(e);
      dragCounter.current++;
      // Some browsers may not populate items until later; show overlay on any non-custom drag
      setIsDragging(true);
      const types = Array.from(e.dataTransfer?.types || []);
      console.debug("[FileUpload] dragenter window", { dragCounter: dragCounter.current, types });
    };

    const handleDragOut = (e: DragEvent) => {
      if (isCustomAssetDrag(e)) {
        // console.debug("[FileUpload] ignore dragleave for custom asset");
        return;
      }
      handleDrag(e);
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
      console.debug("[FileUpload] dragleave window", { dragCounter: dragCounter.current });
    };

    const handleDrop = (e: DragEvent) => {
      if (isCustomAssetDrag(e)) {
        // Do not consume this drop; ChatInput handles it
        // console.debug("[FileUpload] ignore drop for custom asset");
        return;
      }
      handleDrag(e);
      setIsDragging(false);
      dragCounter.current = 0;
      console.debug("[FileUpload] drop window");
      if (e.dataTransfer?.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener("dragenter", handleDragIn);
    window.addEventListener("dragleave", handleDragOut);
    window.addEventListener("dragover", handleDrag);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragIn);
      window.removeEventListener("dragleave", handleDragOut);
      window.removeEventListener("dragover", handleDrag);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFiles, onFilesAdded, multiple]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <FileUploadContext.Provider
      value={{ isDragging, inputRef, multiple, disabled }}
    >
      <input
        ref={inputRef}
        aria-hidden
        accept={accept}
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        type="file"
        onChange={handleFileSelect}
      />
      {children}
    </FileUploadContext.Provider>
  );
}

export type FileUploadTriggerProps =
  React.ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean;
  };

function FileUploadTrigger({
  asChild = false,
  className,
  children,
  ...props
}: FileUploadTriggerProps) {
  const context = useContext(FileUploadContext);
  const handleClick = () => context?.inputRef.current?.click();

  if (asChild) {
    const child = Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement>
    >;

    return cloneElement(child, {
      ...props,
      role: "button",
      className: cn(className, child.props.className),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        handleClick();
        child.props.onClick?.(e as React.MouseEvent<HTMLElement>);
      },
    });
  }

  return (
    <button
      className={className}
      type="button"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

type FileUploadContentProps = React.HTMLAttributes<HTMLDivElement>;

function FileUploadContent({ className, ...props }: FileUploadContentProps) {
  const context = useContext(FileUploadContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  if (!context?.isDragging || !mounted || context?.disabled) {
    return null;
  }

  const content = (
    <div
      className={cn(
        "bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
        "animate-in fade-in-0 slide-in-from-bottom-10 zoom-in-90 duration-150",
        className,
      )}
      {...props}
    />
  );

  const target = typeof document !== "undefined" ? document.body : null;

  if (!target) return null;

  return createPortal(content, target);
}

export { FileUpload, FileUploadTrigger, FileUploadContent };
