
"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import * as React from "react"

interface FixedToggleGroupProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function FixedToggleGroup({ value, onValueChange, className, children }: FixedToggleGroupProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className={cn("rounded-md bg-muted p-1", className)}
    >
      {children}
    </ToggleGroup>
  )
}

interface FixedToggleGroupItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function FixedToggleGroupItem({ value, className, children }: FixedToggleGroupItemProps) {
  return (
    <ToggleGroupItem
      value={value}
      className={cn(
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        "hover:bg-primary/10 transition-colors",
        className
      )}
    >
      {children}
    </ToggleGroupItem>
  )
}