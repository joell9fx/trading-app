import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-300",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
        outline:
          "border border-gray-700 bg-transparent hover:bg-gray-800/50 hover:border-yellow-500/50 text-gray-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl",
        secondary:
          "bg-gray-800/80 text-gray-100 hover:bg-gray-700/80 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
        ghost: "hover:bg-gray-800/50 text-gray-300 hover:text-yellow-500 transition-all duration-300",
        link: "text-yellow-500 underline-offset-4 hover:underline hover:text-yellow-400 transition-all duration-300",
        gradient: "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-500 font-semibold shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
