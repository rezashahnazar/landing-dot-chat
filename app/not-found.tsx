"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            404
          </h1>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
            صفحه مورد نظر پیدا نشد
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
            متاسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/">
            <Button size="lg" className="font-medium">
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
