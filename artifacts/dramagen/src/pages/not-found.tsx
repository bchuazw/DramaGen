import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Flame, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        className="text-8xl sm:text-9xl mb-6"
      >
        😤
      </motion.div>

      <h1 className="text-5xl sm:text-7xl font-display uppercase tracking-wider text-white mb-4">
        4<motion.span
          className="text-primary inline-block"
          animate={{ textShadow: ["0 0 20px rgba(255,51,51,0.6)", "0 0 40px rgba(255,51,51,0.8)", "0 0 20px rgba(255,51,51,0.6)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >0</motion.span>4
      </h1>

      <p className="text-xl sm:text-2xl text-muted-foreground mb-2 font-display uppercase tracking-wider">
        You've Yelled Into the Void
      </p>
      <p className="text-sm text-muted-foreground/70 mb-8 max-w-md">
        This page doesn't exist — and even DramaGen can't make it more dramatic than that.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold uppercase tracking-wider">
            <Home className="w-5 h-5" /> Go Home
          </Button>
        </Link>
        <Link href="/generate">
          <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 gap-2 font-bold uppercase tracking-wider">
            <Flame className="w-5 h-5" /> Generate Drama
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
