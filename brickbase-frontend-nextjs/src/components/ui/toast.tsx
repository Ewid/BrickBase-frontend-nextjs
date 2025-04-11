// Placeholder file for Shadcn UI Toast components
import * as React from "react"
// Assume ToastPrimitives exists for type checking
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

// Use div for Viewport as it receives className
const ToastViewport = React.forwardRef<
  HTMLDivElement, // Use div element
  React.HTMLAttributes<HTMLDivElement> // Use div attributes
>(({ className, ...props }, ref) => (
  <div // Use div instead of React.Fragment
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport" // Use custom display name or Radix if available

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Use li for Toast Root as per Radix recommendation
const Toast = React.forwardRef<
  HTMLLIElement, // Use li element
  React.LiHTMLAttributes<HTMLLIElement> & VariantProps<typeof toastVariants> // Use li attributes
>(({ className, variant, ...props }, ref) => {
  return (
    <li // Use li instead of React.Fragment
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = "Toast" // Use custom display name or Radix if available

type ToastActionElement = React.ReactElement<typeof ToastAction>

// Use button for ToastAction
const ToastAction = React.forwardRef<
  HTMLButtonElement, // Use button element
  React.ButtonHTMLAttributes<HTMLButtonElement> // Use button attributes
>(({ className, ...props }, ref) => (
  <button // Use button instead of React.Fragment
    ref={ref}
    type="button" // Explicitly set type
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction" // Use custom display name or Radix if available

// Use button for ToastClose
const ToastClose = React.forwardRef<
  HTMLButtonElement, // Use button element
  React.ButtonHTMLAttributes<HTMLButtonElement> // Use button attributes
>(({ className, ...props }, ref) => (
  <button // Use button instead of React.Fragment
    ref={ref}
    type="button" // Explicitly set type
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </button> // Close button tag
))
ToastClose.displayName = "ToastClose" // Use custom display name or Radix if available

// Use div for ToastTitle
const ToastTitle = React.forwardRef<
  HTMLDivElement, // Use div element
  React.HTMLAttributes<HTMLDivElement> // Use div attributes
>(({ className, ...props }, ref) => (
  <div // Use div instead of React.Fragment
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle" // Use custom display name or Radix if available

// Use div for ToastDescription
const ToastDescription = React.forwardRef<
  HTMLDivElement, // Use div element
  React.HTMLAttributes<HTMLDivElement> // Use div attributes
>(({ className, ...props }, ref) => (
  <div // Use div instead of React.Fragment
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription" // Use custom display name or Radix if available

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElementProps = React.ComponentPropsWithoutRef<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  type ToastActionElementProps as ToastActionProps,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} 