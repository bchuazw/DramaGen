import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, ArrowRight, Skull, Flame, Mic, Volume2, Sparkles, MessageSquare } from "lucide-react";
import { motion, useMotionValue, useTransform, useInView } from "framer-motion";
import { Show } from "@clerk/react";
import { useRef, useEffect, useState } from "react";

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

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const DRAMA_MODES_PREVIEW = [
  { emoji: "🔥", name: "Rage Mode", color: "from-red-500/20 to-orange-500/20 border-red-500/30" },
  { emoji: "😒", name: "Passive Aggressive", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
  { emoji: "😢", name: "Disappointed Parent", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
  { emoji: "🎭", name: "Telenovela", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30" },
  { emoji: "📱", name: "TikTok Fight", color: "from-pink-500/20 to-rose-500/20 border-pink-500/30" },
  { emoji: "🎤", name: "Drill Sergeant", color: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
  { emoji: "👔", name: "Corporate Fury", color: "from-slate-500/20 to-zinc-500/20 border-slate-500/30" },
  { emoji: "🧊", name: "Ice Cold", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30" },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Type Something Mild",
    description: "Write a calm, polite message — the kind you'd normally send when you're secretly furious.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    step: 2,
    icon: Sparkles,
    title: "Pick Your Drama",
    description: "Choose from 8 dramatic modes — rage, passive aggressive, telenovela, and more unhinged options.",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/20",
  },
  {
    step: 3,
    icon: Volume2,
    title: "Hear the Chaos",
    description: "AI transforms your text into a dramatic rant and reads it out loud. Clone your own voice for extra chaos.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
];

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="text-center"
    >
      <div className="text-3xl sm:text-5xl font-display text-primary">{count.toLocaleString()}+</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />

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
            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display tracking-wide uppercase leading-tight text-white"
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

          <motion.p variants={fadeUp} custom={2} className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground/50 text-sm flex flex-col items-center gap-1"
          >
            <span>Scroll down</span>
            <ArrowRight className="w-4 h-4 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20 sm:py-28 relative"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-white">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Three steps to dramatic glory</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i + 1}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative glass-card border-border/30 h-full">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.bg} border`}>
                      <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <div className="absolute top-3 right-3 text-xs font-display text-muted-foreground/30 text-2xl">{item.step}</div>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={scaleIn}
        className="py-20 sm:py-24 bg-card/20 border-y border-border/30 relative backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider">From Mild to <span className="text-secondary">Wild</span></h2>
              <p className="text-muted-foreground text-lg">Pick a character, clone your voice, and let the drama unfold. Whether you're a disappointed parent or a raging lunatic, we've got a mode for you.</p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {[
                  { icon: Skull, color: "text-primary", text: "8 distinct dramatic modes" },
                  { icon: Mic, color: "text-secondary", text: "AI voice cloning with your own voice" },
                  { icon: Zap, color: "text-accent", text: "Powered by ElevenLabs + OpenAI" },
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
              <Card className="relative bg-background/80 border-border shadow-2xl overflow-hidden backdrop-blur-sm">
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

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20 sm:py-28 relative"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-white">
              8 Modes of <span className="text-secondary">Chaos</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Each one more unhinged than the last</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {DRAMA_MODES_PREVIEW.map((mode, i) => (
              <motion.div
                key={mode.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.05, y: -3 }}
                className={`rounded-xl p-4 bg-gradient-to-br ${mode.color} border backdrop-blur-sm text-center cursor-default`}
              >
                <div className="text-3xl mb-2">{mode.emoji}</div>
                <div className="text-xs sm:text-sm font-bold text-foreground">{mode.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 sm:py-20 bg-card/20 border-y border-border/30"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8">
            <AnimatedCounter target={500} label="Rants Generated" />
            <AnimatedCounter target={8} label="Drama Modes" />
            <AnimatedCounter target={6} label="AI Voices" />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        custom={0}
        className="py-20 sm:py-28 relative"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-white mb-4">
            Ready to <span className="text-primary">Yell</span>?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">Stop being polite. Start being dramatic.</p>
          <Show when="signed-out">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-10 font-bold tracking-wider uppercase animate-pulse-glow shadow-[0_4px_30px_rgba(255,51,51,0.3)]">
                Get Started Free <Flame className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/generate">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-10 font-bold tracking-wider uppercase animate-pulse-glow shadow-[0_4px_30px_rgba(255,51,51,0.3)]">
                Generate Now <Flame className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Show>
        </div>
      </motion.section>
    </div>
  );
}
