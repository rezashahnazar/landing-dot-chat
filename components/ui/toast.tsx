"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      [
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2",
        "p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        "will-change-transform",
      ].join(" "),
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-2",
    "overflow-hidden rounded-lg",
    "border border-border/40",
    "bg-gradient-to-b from-background/98 via-background/95 to-background/98",
    "backdrop-blur-xl backdrop-saturate-150",
    "p-4 pr-7",
    "shadow-[0_8px_24px_-8px] shadow-foreground/20",
    "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "hover:shadow-[0_12px_32px_-8px] hover:shadow-foreground/30",
    "hover:border-border/60",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[state=open]:slide-in-from-top-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
    "will-change-[transform,opacity]",
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-primary/5 before:via-primary/[0.025] before:to-primary/5",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-500",
          "hover:shadow-[0_12px_32px_-8px] hover:shadow-foreground/20",
          "hover:border-border/80",
        ].join(" "),
        destructive: [
          "destructive group",
          "border-destructive/40",
          "bg-gradient-to-b from-destructive/95 via-destructive/90 to-destructive/95",
          "text-destructive-foreground",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-destructive-foreground/5 before:via-destructive-foreground/[0.025] before:to-destructive-foreground/5",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-500",
          "hover:shadow-[0_12px_32px_-8px] hover:shadow-destructive/30",
          "hover:border-destructive/60",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      [
        "inline-flex h-8 shrink-0 items-center justify-center",
        "rounded-md border bg-transparent",
        "px-3 text-sm font-medium",
        "shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:bg-secondary/80 hover:shadow",
        "focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "group-[.destructive]:border-destructive/30",
        "group-[.destructive]:hover:border-destructive/30",
        "group-[.destructive]:hover:bg-destructive",
        "group-[.destructive]:hover:text-destructive-foreground",
        "group-[.destructive]:focus:ring-destructive",
        "active:scale-95",
      ].join(" "),
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      [
        "absolute right-1 top-1",
        "rounded-full w-6 h-6",
        "flex items-center justify-center",
        "text-foreground/40",
        "transition-all duration-300 ease-out",
        "opacity-0 group-hover:opacity-100",
        "hover:text-foreground/90",
        "hover:bg-secondary/80",
        "hover:scale-110",
        "active:scale-90",
        "focus:opacity-100 focus:outline-none",
        "focus:ring-2 focus:ring-ring/70",
        "group-[.destructive]:text-destructive-foreground/40",
        "group-[.destructive]:hover:text-destructive-foreground/90",
        "group-[.destructive]:hover:bg-destructive-foreground/10",
        "group-[.destructive]:focus:ring-destructive-foreground/70",
        "motion-reduce:transition-none",
      ].join(" "),
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3 w-3 transition-transform duration-300 ease-out hover:scale-110 motion-reduce:transition-none" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      [
        "text-sm font-semibold",
        "bg-clip-text text-transparent",
        "bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90",
        "leading-none tracking-tight",
        "group-[.destructive]:from-destructive-foreground",
        "group-[.destructive]:via-destructive-foreground/95",
        "group-[.destructive]:to-destructive-foreground/90",
        "[&+div]:text-xs",
      ].join(" "),
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      [
        "text-sm text-muted-foreground/80",
        "leading-relaxed",
        "group-[.destructive]:text-destructive-foreground/80",
      ].join(" "),
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
