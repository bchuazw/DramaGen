import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, ArrowRight, Skull, Flame, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { Show } from "@clerk/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(139,92,246,0.08)_0%,transparent_50%)] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Unleash your inner demon</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-6xl md:text-8xl lg:text-9xl font-display tracking-wide uppercase leading-tight text-white"
          >
            Too tired to{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,51,51,0.6)",
                  "0 0 40px rgba(255,51,51,0.8)",
                  "0 0 20px rgba(255,51,51,0.6)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              yell?
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Turn your calm, tired text into a dramatic, over-the-top audio rant. We'll scream so you don't have to.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 font-bold tracking-wider uppercase animate-pulse-glow shadow-[0_4px_30px_rgba(255,51,51,0.3)] hover:shadow-[0_4px_40px_rgba(255,51,51,0.5)] transition-shadow">
                  Get Started <Flame className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 font-bold tracking-wider uppercase animate-pulse-glow shadow-[0_4px_30px_rgba(255,51,51,0.3)] hover:shadow-[0_4px_40px_rgba(255,51,51,0.5)] transition-shadow">
                  Start Screaming <Flame className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </Show>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 border-primary/50 text-primary hover:bg-primary/10 font-bold tracking-wider uppercase backdrop-blur-sm">
                Hear Others <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={scaleIn}
        className="py-24 bg-card/30 border-y border-border/50 relative backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="space-y-6"
            >
              <h2 className="text-4xl font-display uppercase tracking-wider">From Mild to <span className="text-secondary">Wild</span></h2>
              <p className="text-muted-foreground text-lg">Pick a character, clone your voice, and let the drama unfold. Whether you're a disappointed parent or a raging lunatic, we've got a mode for you.</p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {[
                  { icon: Skull, color: "text-primary", text: "8 distinct dramatic modes" },
                  { icon: Mic, color: "text-secondary", text: "AI voice cloning with your own voice" },
                  { icon: Zap, color: "text-accent", text: "High-quality audio generation" },
                ].map((item, i) => (
                  <motion.li
                    key={item.text}
                    variants={fadeUp}
                    custom={i + 1}
                    className="flex items-center gap-3 group"
                  >
                    <div className="p-1.5 rounded-lg bg-card/50 group-hover:shadow-[0_0_10px_rgba(255,51,51,0.2)] transition-shadow">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    {item.text}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur opacity-30 rounded-2xl" />
              <Card className="relative bg-background border-border shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
                <CardContent className="p-6 space-y-6 relative">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Before</div>
                    <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                      "Please do your dishes."
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4" /> After (Rage Mode)
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-foreground font-medium italic shadow-[inset_0_0_20px_rgba(255,51,51,0.05)]">
                      "DO YOUR DISHES! DO YOU THINK I AM YOUR MAID?! THIS HOUSE IS A PIGSTY AND I AM LOSING MY MIND!"
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
