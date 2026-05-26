import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    // Log the full error internally but never expose the stack trace to users
    console.error("[ErrorBoundary] Caught unhandled error:", error);
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred.",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-lg p-8 text-center">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-8">
              An unexpected error occurred. Please try refreshing the page. If
              the problem persists, contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer transition-opacity",
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
