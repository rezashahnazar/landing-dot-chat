"use client";

import ShareIcon from "@/components/icons/share-icon";
import { toast } from "@/hooks/use-toast";
import { Message } from "@prisma/client";
import { usePathname } from "next/navigation";

export function Share({ message }: { message?: Message }) {
  const pathname = usePathname();

  async function shareAction() {
    if (!message) return;

    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || window?.location?.origin}${pathname}`;
    const shareUrl = new URL(`/share/${message.id}`, baseUrl);

    toast({
      title: "App Published!",
      description: `App URL copied to clipboard: ${shareUrl.href}`,
      variant: "default",
    });

    await navigator.clipboard.writeText(shareUrl.href);
  }

  return (
    <form action={shareAction} className="flex">
      <button
        type="submit"
        disabled={!message}
        className="inline-flex items-center gap-1 rounded border border-gray-300 px-1.5 py-0.5 text-sm text-gray-600 enabled:hover:bg-white disabled:opacity-50"
      >
        <ShareIcon className="size-3" />
        Share
      </button>
    </form>
  );
}
