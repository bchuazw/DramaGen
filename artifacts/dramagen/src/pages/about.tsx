import { Card, CardContent } from "@/components/ui/card";
import { Skull, Flame } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-20 max-w-3xl"
    >
      <div className="space-y-12">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl font-display uppercase tracking-widest text-foreground">
            About{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{ textShadow: ["0 0 15px rgba(255,51,51,0.4)", "0 0 30px rgba(255,51,51,0.6)", "0 0 15px rgba(255,51,51,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              DramaGen
            </motion.span>
          </h1>
          <p className="text-xl text-muted-foreground">
            For when the inner voice needs an outer megaphone.
          </p>
        </motion.div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-h2:font-display prose-h2:text-3xl prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-secondary max-w-none">
          <motion.p {...fadeUp} transition={{ delay: 0.2, duration: 0.5 }} className="text-lg leading-relaxed">
            We've all been there. Someone sends you a text that infuriates you to your core, but societal norms dictate you reply with "No worries! Sounds good." 
          </motion.p>
          
          <motion.p {...fadeUp} transition={{ delay: 0.3, duration: 0.5 }} className="text-lg leading-relaxed">
            DramaGen was built for the moments you wish you could just let it all out. It takes your calm, collected, socially acceptable text and translates it into the unhinged, dramatic rant you actually want to send. And then, it reads it out loud for you.
          </motion.p>

          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 flex items-center gap-3"
          >
            <Flame className="text-primary w-8 h-8" /> How it Works
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
            {[
              { step: 1, title: "Input", desc: "Type your mild, annoying frustration into the box.", bgClass: "bg-primary/20", textClass: "text-primary" },
              { step: 2, title: "Translate", desc: "Choose your drama mode. We rewrite it for maximum impact.", bgClass: "bg-secondary/20", textClass: "text-secondary" },
              { step: 3, title: "Generate", desc: "Our AI voice models scream it out loud. You enjoy the catharsis.", bgClass: "bg-accent/20", textClass: "text-accent" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              >
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card className="glass-card hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className={`w-12 h-12 rounded-full ${item.bgClass} flex items-center justify-center ${item.textClass} font-bold text-lg`}>
                        {item.step}
                      </div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 flex items-center gap-3"
          >
            <Skull className="text-muted-foreground w-8 h-8" /> Disclaimer
          </motion.h2>
          <motion.p {...fadeUp} transition={{ delay: 1.0, duration: 0.5 }}>
            DramaGen is built for entertainment purposes only. Please do not actually send these audio clips to your boss, your partner, or your landlord unless you are prepared for the very real consequences of your dramatic actions.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
