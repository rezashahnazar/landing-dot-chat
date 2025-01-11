import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98] active:translate-y-[0.5px]",
    "transform-gpu backface-hidden will-change-transform",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-b from-primary to-primary/95 text-primary-foreground",
          "shadow-[0_2px_8px_-2px] shadow-primary/30",
          "hover:shadow-[0_4px_16px_-4px] hover:shadow-primary/30",
          "hover:bg-gradient-to-b hover:from-primary hover:to-primary/90",
          "hover:scale-[1.02] hover:-translate-y-[1px]",
          "active:shadow-[0_2px_4px_-2px] active:shadow-primary/30",
          "active:bg-gradient-to-b active:from-primary/95 active:to-primary/90",
        ].join(" "),
        destructive: [
          "bg-gradient-to-b from-destructive to-destructive/95 text-destructive-foreground",
          "shadow-[0_2px_8px_-2px] shadow-destructive/30",
          "hover:shadow-[0_4px_16px_-4px] hover:shadow-destructive/30",
          "hover:bg-gradient-to-b hover:from-destructive hover:to-destructive/90",
          "hover:scale-[1.02] hover:-translate-y-[1px]",
          "active:shadow-[0_2px_4px_-2px] active:shadow-destructive/30",
          "active:bg-gradient-to-b active:from-destructive/95 active:to-destructive/90",
        ].join(" "),
        outline: [
          "border border-input bg-background/90",
          "shadow-[0_2px_8px_-2px] shadow-foreground/5",
          "hover:shadow-[0_4px_16px_-4px] hover:shadow-foreground/10",
          "hover:bg-accent/50 hover:text-accent-foreground",
          "hover:scale-[1.02] hover:-translate-y-[1px]",
          "active:shadow-[0_2px_4px_-2px] active:shadow-foreground/5",
          "active:bg-accent/60",
        ].join(" "),
        secondary: [
          "bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground",
          "shadow-[0_2px_8px_-2px] shadow-secondary/20",
          "hover:shadow-[0_4px_16px_-4px] hover:shadow-secondary/20",
          "hover:bg-gradient-to-b hover:from-secondary hover:to-secondary/90",
          "hover:scale-[1.02] hover:-translate-y-[1px]",
          "active:shadow-[0_2px_4px_-2px] active:shadow-secondary/20",
          "active:bg-gradient-to-b active:from-secondary/95 active:to-secondary/90",
        ].join(" "),
        ghost: [
          "hover:bg-accent/50 hover:text-accent-foreground",
          "hover:scale-[1.02]",
          "active:bg-accent/60",
          "transition-all duration-300 ease-out",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:text-primary/80 hover:underline",
          "active:text-primary/90",
          "transition-all duration-300 ease-out",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
