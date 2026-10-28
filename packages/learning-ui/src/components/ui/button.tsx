import { ButtonClient, type ButtonClientProps } from "./button-client"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border-2 border-transparent text-base font-bold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-foreground bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent aria-expanded:bg-secondary",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "border-destructive bg-transparent text-destructive hover:bg-destructive/10 focus-visible:outline-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-9 gap-1.5 px-3 text-sm in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        sm: "h-11 gap-2 px-4 text-[0.9375rem] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        lg: "h-14 gap-2 px-7 text-[1.0625rem]",
        icon: "size-12",
        "icon-xs": "size-9 in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-11 in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonClientProps & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonClient
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
