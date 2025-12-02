"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description 
}: ErrorStateProps) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : 'An unexpected error occurred';

  const isAuthError = errorMessage.includes('401') || errorMessage.includes('403');
  const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-red-600/80">
          {description || "We encountered an issue while processing your request"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              {isAuthError 
                ? "Authentication Error"
                : isNetworkError
                ? "Network Error"
                : errorMessage}
            </p>
            <p className="text-sm text-gray-500">
              {isAuthError
                ? "Your session may have expired. Please log in again."
                : isNetworkError
                ? "Please check your internet connection and try again"
                : "Please try again or contact support if the problem persists"}
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
            {isAuthError && (
              <Button asChild variant="outline">
                <Link href="/login">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Login
                </Link>
              </Button>
            )}
          </div>

          {isAuthError && (
            <p className="text-sm text-red-600 pt-2">
              Your session may have expired. Please{' '}
              <Link href="/login" className="underline font-medium hover:text-red-700">
                log in again
              </Link>
              .
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

