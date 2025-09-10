"use client";

import { Button } from "@/components/ui/button";
import { Search, Command } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
  onClick: () => void;
  variant?: 'button' | 'input' | 'minimal';
  className?: string;
  showShortcut?: boolean;
}

export default function SearchButton({ 
  onClick, 
  variant = 'button',
  className,
  showShortcut = true
}: SearchButtonProps) {
  const { hapticFeedback } = useHaptics();

  const handleClick = () => {
    hapticFeedback.buttonPress();
    onClick();
  };

  if (variant === 'input') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center w-full h-9 px-3 py-2 text-sm bg-background border border-input rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
          className
        )}
      >
        <Search className="w-4 h-4 mr-2" />
        <span className="flex-1 text-left">Buscar en Ponti...</span>
        {showShortcut && (
          <div className="flex items-center gap-1 text-xs">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="w-3 h-3" />
            </kbd>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              K
            </kbd>
          </div>
        )}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn("p-2", className)}
      >
        <Search className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn("flex items-center gap-2", className)}
    >
      <Search className="w-4 h-4" />
      <span>Buscar</span>
      {showShortcut && (
        <div className="hidden sm:flex items-center gap-1 ml-auto">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </div>
      )}
    </Button>
  );
}
