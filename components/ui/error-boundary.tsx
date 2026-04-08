"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <div>
            <p className="font-medium text-red-700">{"오류가 발생했습니다"}</p>
            <p className="mt-1 text-sm text-red-500">
              {this.state.error?.message ?? "잠시 후 다시 시도해주세요."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-100"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            {"다시 시도"}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
