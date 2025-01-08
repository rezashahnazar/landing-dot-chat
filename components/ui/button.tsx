import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98] active:translate-y-[0.5px]",
    "transform-gpu backface-hidden",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm hover:shadow",
          "hover:bg-primary/90",
          "hover:scale-[1.02]",
          "active:bg-primary/95",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm hover:shadow",
          "hover:bg-destructive/90",
          "hover:scale-[1.02]",
          "active:bg-destructive/95",
        ].join(" "),
        outline: [
          "border border-input bg-background",
          "shadow-sm hover:shadow",
          "hover:bg-accent/50 hover:text-accent-foreground",
          "hover:scale-[1.02]",
          "active:bg-accent/60",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm hover:shadow-sm",
          "hover:bg-secondary/80",
          "hover:scale-[1.02]",
          "active:bg-secondary/90",
        ].join(" "),
        ghost: [
          "hover:bg-accent/50 hover:text-accent-foreground",
          "active:bg-accent/60",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:text-primary/80 hover:underline",
          "active:text-primary/90",
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
