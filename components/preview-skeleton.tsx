import { cn } from "@/lib/utils";

export default function PreviewSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-start p-8 animate-in">
      {/* Hero Section Skeleton */}
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-24 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-12 w-3/4 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-4 w-2/3 rounded-full bg-muted/40 animate-pulse" />
        </div>

        {/* Content Sections */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "space-y-4 rounded-xl border p-6",
                "bg-gradient-to-b from-muted/30 to-transparent",
                "animate-pulse transition-all duration-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted/60" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-muted/60" />
                  <div className="h-3 w-24 rounded-full bg-muted/40" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-muted/30" />
                <div className="h-3 w-4/5 rounded-full bg-muted/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Elements */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-32 rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-10 w-10 rounded-lg bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
