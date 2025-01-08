import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      [
        "fixed inset-0 z-50",
        "bg-background/5 backdrop-blur-[8px] backdrop-saturate-150",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-300 ease-out",
      ].join(" "),
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        [
          "fixed left-[50%] top-[50%] z-50",
          "w-full max-w-lg",
          "translate-x-[-50%] translate-y-[-50%]",
          "grid gap-4",
          "bg-background/95 backdrop-blur-xl backdrop-saturate-150",
          "p-6 shadow-[0_8px_32px_-8px] shadow-foreground/20",
          "border border-border/50",
          "duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg",
        ].join(" "),
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          [
            "absolute right-4 top-4",
            "rounded-full w-8 h-8",
            "flex items-center justify-center",
            "opacity-70 ring-offset-background",
            "transition-all duration-200 ease-out",
            "hover:opacity-100 hover:bg-secondary/80",
            "focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2",
            "disabled:pointer-events-none",
            "active:scale-95",
          ].join(" ")
        )}
      >
        <X className="h-4 w-4 transition-transform duration-200 ease-out hover:scale-110" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      ["flex flex-col space-y-1.5", "text-center sm:text-left"].join(" "),
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        "mt-2",
      ].join(" "),
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      [
        "text-lg font-semibold",
        "leading-none tracking-tight",
        "bg-clip-text text-transparent",
        "bg-gradient-to-r from-foreground to-foreground/90",
      ].join(" "),
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      ["text-sm text-muted-foreground/90", "leading-relaxed"].join(" "),
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
