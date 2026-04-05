import { Link } from "wouter";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="font-display text-2xl tracking-wider text-foreground">DRAMA<span className="text-primary">GEN</span></span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/generate" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Generate
          </Link>
          <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Gallery
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
