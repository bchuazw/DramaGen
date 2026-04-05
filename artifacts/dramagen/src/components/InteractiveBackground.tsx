import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type: "ember" | "spark" | "smoke" | "flame" | "emoji";
  emoji?: string;
  rotation?: number;
  rotationSpeed?: number;
}

const EMOJIS = ["😤", "🔥", "💢", "⚡", "😡", "💥", "🤬", "👹"];

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
  const animFrame = useRef<number>(0);
  const lastTime = useRef(0);
  const gradientPhase = useRef(0);
  const { theme } = useTheme();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const maxParticles = isMobile ? 100 : 300;
  const initialCount = isMobile ? 20 : 50;

  const emberColors = ["#ff3333", "#ff6644", "#ff4400", "#ff8800", "#ffaa00", "#cc2222"];
  const flameColors = ["#ff2200", "#ff4400", "#ff6600", "#ff8800", "#ffaa33", "#ffcc44"];

  const createParticle = useCallback(
    (x: number, y: number, type: Particle["type"] = "ember"): Particle => {
      const angle = Math.random() * Math.PI * 2;
      let speed: number, maxLife: number, size: number, alpha: number, color: string;

      switch (type) {
        case "flame":
          speed = 0.3 + Math.random() * 1.2;
          maxLife = 60 + Math.random() * 100;
          size = 8 + Math.random() * 20;
          alpha = 0.15 + Math.random() * 0.25;
          color = flameColors[Math.floor(Math.random() * flameColors.length)];
          break;
        case "spark":
          speed = 1.5 + Math.random() * 4;
          maxLife = 20 + Math.random() * 40;
          size = 1 + Math.random() * 2.5;
          alpha = 0.5 + Math.random() * 0.5;
          color = emberColors[Math.floor(Math.random() * emberColors.length)];
          break;
        case "smoke":
          speed = 0.1 + Math.random() * 0.4;
          maxLife = 150 + Math.random() * 100;
          size = 15 + Math.random() * 30;
          alpha = 0.03 + Math.random() * 0.06;
          color = Math.random() > 0.5 ? "#8b5cf6" : "#6d28d9";
          break;
        case "emoji":
          speed = 0.2 + Math.random() * 0.5;
          maxLife = 200 + Math.random() * 150;
          size = isMobile ? 14 + Math.random() * 10 : 18 + Math.random() * 16;
          alpha = 0.15 + Math.random() * 0.2;
          color = "";
          break;
        default:
          speed = 0.2 + Math.random() * 0.8;
          maxLife = 50 + Math.random() * 80;
          size = 2 + Math.random() * 4;
          alpha = 0.3 + Math.random() * 0.7;
          color = emberColors[Math.floor(Math.random() * emberColors.length)];
          break;
      }

      return {
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed * (type === "flame" ? 0.3 : 1),
        vy:
          type === "ember" || type === "flame"
            ? -(0.5 + Math.random() * speed)
            : type === "emoji"
              ? -(0.3 + Math.random() * 0.4)
              : Math.sin(angle) * speed,
        size,
        alpha,
        color,
        life: 0,
        maxLife,
        type,
        emoji: type === "emoji" ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
        rotation: type === "emoji" ? Math.random() * Math.PI * 2 : 0,
        rotationSpeed: type === "emoji" ? (Math.random() - 0.5) * 0.02 : 0,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < initialCount; i++) {
      particles.current.push(
        createParticle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, "ember")
      );
    }
    for (let i = 0; i < (isMobile ? 3 : 8); i++) {
      particles.current.push(
        createParticle(Math.random() * window.innerWidth, window.innerHeight * 0.7 + Math.random() * window.innerHeight * 0.3, "flame")
      );
    }
    for (let i = 0; i < (isMobile ? 2 : 5); i++) {
      particles.current.push(
        createParticle(Math.random() * window.innerWidth, window.innerHeight + 20, "emoji")
      );
    }

    const canAdd = (n: number) => particles.current.length + n < maxParticles;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.prevX = mouse.current.x;
      mouse.current.prevY = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!canAdd(1)) return;
      const dx = mouse.current.x - mouse.current.prevX;
      const dy = mouse.current.y - mouse.current.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      const count = Math.min(Math.floor(speed / 4), 5);
      for (let i = 0; i < count && canAdd(1); i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "spark"));
      }
      if (speed > 15 && canAdd(1)) {
        particles.current.push(createParticle(e.clientX, e.clientY, "smoke"));
      }
    };

    const handleClick = (e: MouseEvent) => {
      const sparkCount = Math.min(15, maxParticles - particles.current.length);
      for (let i = 0; i < sparkCount; i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "spark"));
      }
      for (let i = 0; i < 4 && canAdd(1); i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "smoke"));
      }
      if (canAdd(1)) particles.current.push(createParticle(e.clientX, e.clientY, "emoji"));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime.current) / 16, 3);
      lastTime.current = time;
      gradientPhase.current += 0.003 * dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gp = gradientPhase.current;
      const gradH = canvas.height;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, gradH);
      const r1 = Math.sin(gp) * 8 + 12;
      const g1 = Math.sin(gp * 0.7) * 3 + 5;
      const b1 = Math.sin(gp * 1.3) * 10 + 25;
      const r2 = Math.sin(gp * 0.5 + 1) * 15 + 20;
      const g2 = Math.sin(gp * 0.3 + 2) * 5 + 5;
      const b2 = Math.sin(gp * 0.8 + 1) * 5 + 10;
      const r3 = Math.sin(gp * 0.4 + 2) * 20 + 35;
      const g3 = Math.sin(gp * 0.6 + 3) * 8 + 8;
      const b3 = 5;

      bgGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
      bgGrad.addColorStop(0.5, `rgb(${r2}, ${g2}, ${b2})`);
      bgGrad.addColorStop(0.85, `rgb(${r3}, ${g3}, ${b3})`);
      bgGrad.addColorStop(1, `rgb(${Math.min(r3 + 15, 70)}, ${Math.min(g3 + 5, 20)}, 0)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const heatGrad = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(gp * 0.7) * canvas.width * 0.15,
        canvas.height * 0.85,
        0,
        canvas.width * 0.5,
        canvas.height * 0.85,
        canvas.height * 0.6
      );
      heatGrad.addColorStop(0, `rgba(255, 60, 0, ${0.06 + Math.sin(gp * 2) * 0.03})`);
      heatGrad.addColorStop(0.4, `rgba(180, 30, 0, ${0.03 + Math.sin(gp * 1.5) * 0.02})`);
      heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = heatGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const vigGrad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.2,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      );
      vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pLen = particles.current.length;
      if (pLen < maxParticles && Math.random() < (isMobile ? 0.12 : 0.2)) {
        particles.current.push(createParticle(Math.random() * canvas.width, canvas.height + 10, "ember"));
      }
      if (pLen < maxParticles && Math.random() < (isMobile ? 0.03 : 0.06)) {
        particles.current.push(createParticle(Math.random() * canvas.width, canvas.height * 0.8 + Math.random() * canvas.height * 0.2, "flame"));
      }
      if (pLen < maxParticles && Math.random() < (isMobile ? 0.005 : 0.012)) {
        particles.current.push(createParticle(Math.random() * canvas.width, canvas.height + 30, "emoji"));
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;

        if (p.type === "ember" || p.type === "flame") {
          p.vy -= 0.015 * dt;
          p.vx += Math.sin(p.life * 0.03 + p.x * 0.01) * 0.04 * dt;
        }
        if (p.type === "emoji") {
          p.vx += Math.sin(p.life * 0.02 + p.x * 0.005) * 0.03 * dt;
          p.rotation! += p.rotationSpeed! * dt;
        }

        const mx = mouse.current.x;
        const my = mouse.current.y;
        const ddx = p.x - mx;
        const ddy = p.y - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 180 && dist > 0) {
          const force = ((180 - dist) / 180) * 0.4;
          p.vx += (ddx / dist) * force * dt;
          p.vy += (ddy / dist) * force * dt;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.99;
        p.vy *= 0.99;

        const fadeIn = Math.min(lifeRatio * 4, 1);
        const fadeOut = 1 - Math.max((lifeRatio - 0.6) / 0.4, 0);
        const currentAlpha = p.alpha * fadeIn * fadeOut;

        if (currentAlpha <= 0.001) continue;

        if (p.type === "emoji") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation!);
          ctx.globalAlpha = currentAlpha;
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji!, 0, 0);
          ctx.restore();
        } else if (p.type === "flame") {
          const radius = p.size * (1 + lifeRatio * 1.5);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          const innerColor = lifeRatio < 0.3 ? "rgba(255, 200, 50, 0.4)" : "rgba(255, 80, 0, 0.3)";
          gradient.addColorStop(0, innerColor);
          gradient.addColorStop(0.4, p.color);
          gradient.addColorStop(1, "transparent");
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spark") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "smoke") {
          const radius = p.size * (1 + lifeRatio * 3);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "transparent");
          ctx.globalAlpha = currentAlpha * 0.4;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const eSize = p.size * (1 - lifeRatio * 0.3);
          ctx.beginPath();
          ctx.arc(p.x, p.y, eSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha * 0.7;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;

      if (particles.current.length > maxParticles) {
        particles.current.splice(0, particles.current.length - maxParticles);
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: theme === "light" ? 0.3 : 1,
      }}
    />
  );
}
