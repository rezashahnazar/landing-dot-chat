import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      [
        "peer group inline-flex shrink-0 cursor-pointer",
        "h-[24px] w-[44px]",
        "items-center rounded-full",
        "border-[1.5px] border-transparent",
        "bg-gradient-to-r from-muted/90 via-muted/80 to-muted/90",
        "shadow-[0_2px_10px_-3px] shadow-foreground/10",
        "transition-all duration-500",
        "ease-&lsqb;cubic-bezier(0.34,1.56,0.64,1)&rsqb;",
        "hover:shadow-[0_4px_14px_-5px] hover:shadow-foreground/20",
        "hover:from-muted/95 hover:via-muted/85 hover:to-muted/95",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring/70 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-gradient-to-r",
        "data-[state=checked]:from-primary/90",
        "data-[state=checked]:via-primary",
        "data-[state=checked]:to-primary/90",
        "data-[state=checked]:shadow-primary/30",
        "data-[state=checked]:hover:from-primary/95",
        "data-[state=checked]:hover:via-primary/90",
        "data-[state=checked]:hover:to-primary/95",
        "will-change-[background-color,box-shadow,transform]",
        "motion-reduce:transition-none",
      ].join(" "),
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        [
          "pointer-events-none block",
          "size-[20px]",
          "rounded-full",
          "bg-gradient-to-b from-background via-background to-background/90",
          "shadow-lg shadow-foreground/10",
          "ring-[1px] ring-border/20",
          "transition-all duration-500",
          "ease-&lsqb;cubic-bezier(0.34,1.56,0.64,1)&rsqb;",
          "group-hover:shadow-xl group-hover:shadow-foreground/20",
          "group-data-[state=checked]:bg-gradient-to-b",
          "group-data-[state=checked]:from-background",
          "group-data-[state=checked]:via-background",
          "group-data-[state=checked]:to-background/95",
          "group-data-[state=checked]:translate-x-6",
          "group-data-[state=unchecked]:translate-x-0",
          "rtl:group-data-[state=checked]:-translate-x-6",
          "rtl:group-data-[state=unchecked]:translate-x-0",
          "group-data-[state=checked]:shadow-primary/20",
          "will-change-[transform,background-color,box-shadow]",
          "group-hover:scale-105",
          "group-active:scale-95",
          "motion-reduce:transition-none",
        ].join(" ")
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
