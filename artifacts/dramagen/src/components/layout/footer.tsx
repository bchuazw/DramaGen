import { Link } from "wouter";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-display tracking-wider text-muted-foreground">DRAMAGEN</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Too tired to yell? Let DramaGen do it for you.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
