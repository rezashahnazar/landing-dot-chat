import { animate } from "framer-motion";
import { useRef } from "react";

export function useScrollTo() {
  let ref = useRef<HTMLDivElement>(null);

  function scrollTo(options: Parameters<typeof animate>[2] = {}) {
    if (!ref.current) return;

    let defaultOptions = {
      type: "spring",
      bounce: 0,
      duration: 0.6,
    } as const;

    animate(window.scrollY, ref.current.offsetTop, {
      ...defaultOptions,
      ...options,
      onUpdate: (latest) => window.scrollTo({ top: latest }),
    });
  }

  return [ref, scrollTo] as const;
}
