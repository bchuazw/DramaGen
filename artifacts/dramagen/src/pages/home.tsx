import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, ArrowRight, Skull, Flame, Mic } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Unleash your inner demon</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display tracking-wide uppercase leading-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Too tired to <span className="text-primary drop-shadow-[0_0_20px_rgba(255,51,51,0.6)]">yell?</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Turn your calm, tired text into a dramatic, over-the-top audio rant. We'll scream so you don't have to.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/generate" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 font-bold tracking-wider uppercase animate-pulse-glow">
                Start Screaming <Flame className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 border-primary/50 text-primary hover:bg-primary/10 font-bold tracking-wider uppercase">
                Hear Others <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-card/30 border-y border-border/50 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-display uppercase tracking-wider">From Mild to <span className="text-secondary">Wild</span></h2>
              <p className="text-muted-foreground text-lg">Pick a character, clone your voice, and let the drama unfold. Whether you're a disappointed parent or a raging lunatic, we've got a mode for you.</p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3"><Skull className="w-5 h-5 text-primary" /> 8 distinct dramatic modes</li>
                <li className="flex items-center gap-3"><Mic className="w-5 h-5 text-secondary" /> AI voice cloning</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-accent" /> High-quality audio generation</li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur opacity-30 rounded-2xl"></div>
              <Card className="relative bg-background border-border shadow-2xl">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Before</div>
                    <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                      "Please do your dishes."
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="w-6 h-6 text-primary rotate-90 md:rotate-0" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4" /> After (Rage Mode)
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-foreground font-medium italic">
                      "DO YOUR DISHES! DO YOU THINK I AM YOUR MAID?! THIS HOUSE IS A PIGSTY AND I AM LOSING MY MIND!"
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
