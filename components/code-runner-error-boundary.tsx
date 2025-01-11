"use client";

import { Component, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  onError?: (error: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CodeRunnerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    const errorMessage = error.message;

    // Notify parent about the error
    if (this.props.onError) {
      this.props.onError(errorMessage);
    }

    // Show error in toast
    toast({
      title: "خطا در اجرای کد",
      description: (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-destructive font-mono whitespace-pre-wrap">
            {errorMessage}
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (this.props.onError) {
                this.props.onError(errorMessage);
              }
            }}
          >
            کپی خطا و درخواست رفع مشکل
          </Button>
        </div>
      ),
      variant: "destructive",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[100dvh] p-4 text-center bg-destructive/5">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              خطا در اجرای کد
            </h3>
            <p className="text-sm text-destructive/90 font-mono whitespace-pre-wrap">
              {this.state.error?.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
              }}
            >
              تلاش مجدد
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
