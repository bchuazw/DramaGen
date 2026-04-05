import { Card, CardContent } from "@/components/ui/card";
import { Skull, Zap, Flame } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-display uppercase tracking-widest text-foreground">
            About <span className="text-primary">DramaGen</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            For when the inner voice needs an outer megaphone.
          </p>
        </div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-h2:font-display prose-h2:text-3xl prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-secondary max-w-none">
          <p className="text-lg leading-relaxed">
            We've all been there. Someone sends you a text that infuriates you to your core, but societal norms dictate you reply with "No worries! Sounds good." 
          </p>
          
          <p className="text-lg leading-relaxed">
            DramaGen was built for the moments you wish you could just let it all out. It takes your calm, collected, socially acceptable text and translates it into the unhinged, dramatic rant you actually want to send. And then, it reads it out loud for you.
          </p>

          <h2 className="mt-12 flex items-center gap-3"><Flame className="text-primary w-8 h-8" /> How it Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  1
                </div>
                <h3 className="font-bold text-lg">Input</h3>
                <p className="text-sm text-muted-foreground">Type your mild, annoying frustration into the box.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  2
                </div>
                <h3 className="font-bold text-lg">Translate</h3>
                <p className="text-sm text-muted-foreground">Choose your drama mode. We rewrite it for maximum impact.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  3
                </div>
                <h3 className="font-bold text-lg">Generate</h3>
                <p className="text-sm text-muted-foreground">Our AI voice models scream it out loud. You enjoy the catharsis.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="mt-12 flex items-center gap-3"><Skull className="text-muted-foreground w-8 h-8" /> Disclaimer</h2>
          <p>
            DramaGen is built for entertainment purposes only. Please do not actually send these audio clips to your boss, your partner, or your landlord unless you are prepared for the very real consequences of your dramatic actions.
          </p>
        </div>
      </div>
    </div>
  );
}
