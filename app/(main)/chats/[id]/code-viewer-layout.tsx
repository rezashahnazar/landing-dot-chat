"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function CodeViewerLayout({
  children,
  isShowing,
  onClose,
}: {
  children: ReactNode;
  isShowing: boolean;
  onClose: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <>
      {isMobile ? (
        <Drawer open={isShowing} onClose={onClose}>
          <DrawerContent>
            <VisuallyHidden.Root>
              <DrawerTitle>کد</DrawerTitle>
              <DrawerDescription>نمایش کد</DrawerDescription>
            </VisuallyHidden.Root>

            <div className="flex h-[90vh] flex-col overflow-hidden bg-background pt-14">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          className={cn(
            "h-full overflow-hidden border-r bg-background pt-14 transition-[width] duration-300",
            isShowing ? "w-1/2" : "w-0"
          )}
        >
          {children}
        </div>
      )}
    </>
  );
}
