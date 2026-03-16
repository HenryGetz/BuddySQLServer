"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function CommandDialog({
  children,
  ...props
}: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden border-gray-300 p-0">
        <DialogTitle className="sr-only">Global command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search commands and navigate the app using keyboard shortcuts.
        </DialogDescription>
        <Command
          shouldFilter={false}
          className="
            [&_[cmdk-group-heading]]:px-3
            [&_[cmdk-group-heading]]:pb-1
            [&_[cmdk-group-heading]]:pt-2
            [&_[cmdk-group-heading]]:text-xs
            [&_[cmdk-group-heading]]:font-semibold
            [&_[cmdk-group-heading]]:uppercase
            [&_[cmdk-group-heading]]:tracking-wide
            [&_[cmdk-group-heading]]:text-gray-500
            [&_[cmdk-item][data-selected=true]]:bg-blue-600
            [&_[cmdk-item][data-selected=true]]:text-white
            [&_[cmdk-item][data-disabled=true]]:cursor-not-allowed
            [&_[cmdk-item][data-disabled=true]]:opacity-45
            [&_[cmdk-separator]]:mx-2
            [&_[cmdk-separator]]:my-1
            [&_[cmdk-separator]]:h-px
            [&_[cmdk-separator]]:bg-gray-200
          "
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive
      ref={ref}
      className={`flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-gray-900 ${className}`}
      {...props}
    />
  );
});

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className = "", ...props }, ref) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
      <span className="text-base text-gray-500" aria-hidden="true">
        ⌘
      </span>
      <CommandPrimitive.Input
        ref={ref}
        className={`flex h-10 w-full rounded-md bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
        {...props}
      />
    </div>
  );
});

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={`max-h-[28rem] overflow-y-auto overflow-x-hidden p-2 ${className}`}
      {...props}
    />
  );
});

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={`px-4 py-6 text-center text-sm text-gray-600 ${className}`}
      {...props}
    />
  );
});

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={`overflow-hidden py-1 text-gray-700 ${className}`}
      {...props}
    />
  );
});

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={`-mx-1 my-1 h-px bg-gray-200 ${className}`}
      {...props}
    />
  );
});

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function CommandItem({ className = "", ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={`relative flex min-h-10 select-none items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-gray-800 outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    />
  );
});

export const CommandShortcut = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`ml-auto text-xs font-medium tracking-wide text-gray-500 ${className}`}
      {...props}
    />
  );
};
