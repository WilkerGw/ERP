import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Documentação:
// - Substituímos todas as variantes de estilo anteriores pela nova estilização que você solicitou.
// - "bg-blue-300/10": Fundo azul com 10% de opacidade.
// - "text-white": Texto branco.
// - "rounded-lg": Bordas mais arredondadas.
// - "hover:bg-destructive/90": Efeito hover (você pode ajustar para outra cor se desejar, como hover:bg-blue-300/20).
// - "backdrop-blur-sm": Mantém o efeito de vidro.
// - "border border-blue-300/90": Adiciona a borda azul semitransparente.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-300/10 text-white rounded-lg hover:bg-blue-300/20 transition-colors backdrop-blur-sm border border-blue-300/90",
        // Mantive a variante 'ghost' para botões de ícone que não devem ter fundo
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground dark:hover:bg-accent/50",
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

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }