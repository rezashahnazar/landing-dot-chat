"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      [
        "fixed inset-0 z-50",
        "bg-gradient-to-t from-background/10 to-background/5",
        "backdrop-blur-[12px] backdrop-saturate-150",
        "transition-all duration-500 ease-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "motion-reduce:transition-none",
      ].join(" "),
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        [
          "fixed inset-x-0 bottom-0 z-50",
          "mt-24 flex h-auto flex-col",
          "rounded-t-2xl",
          "border-t border-l border-r border-border/40",
          "bg-gradient-to-b from-background/98 via-background/95 to-background/98",
          "backdrop-blur-xl backdrop-saturate-150",
          "shadow-[0_-8px_32px_-8px] shadow-foreground/20",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-primary/[0.025] before:via-primary/[0.05] before:to-primary/[0.025]",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-700",
          "will-change-[transform,opacity]",
          "motion-reduce:transition-none",
        ].join(" "),
        className
      )}
      {...props}
    >
      <div
        className={cn(
          [
            "group",
            "relative mx-auto mt-4",
            "h-1.5 w-[100px]",
            "overflow-hidden rounded-full",
            "bg-gradient-to-r from-border/40 via-border/50 to-border/40",
            "transition-all duration-500",
            "hover:from-border/50 hover:via-border/60 hover:to-border/50",
            "before:absolute before:inset-0",
            "before:bg-gradient-to-r before:from-primary/20 before:via-primary/30 before:to-primary/20",
            "before:opacity-0 group-hover:before:opacity-100",
            "before:transition-opacity before:duration-500",
          ].join(" ")
        )}
      />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        "grid gap-1.5 p-6",
        "text-center sm:text-left",
        "bg-gradient-to-b from-background/40 to-transparent",
      ].join(" "),
      className
    )}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        "mt-auto flex flex-col gap-2 p-6",
        "border-t border-border/40",
        "bg-gradient-to-t from-background/40 to-transparent",
      ].join(" "),
      className
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      [
        "text-lg font-semibold",
        "leading-none tracking-tight",
        "bg-clip-text text-transparent",
        "bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90",
        "transition-all duration-500",
        "group-hover:from-foreground/95 group-hover:via-foreground/90 group-hover:to-foreground/85",
      ].join(" "),
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn(
      [
        "text-sm text-muted-foreground/80",
        "leading-relaxed",
        "transition-colors duration-500",
        "group-hover:text-muted-foreground/90",
      ].join(" "),
      className
    )}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
