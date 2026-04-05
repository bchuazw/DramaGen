import { useEffect, useRef, useCallback } from "react";

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
  type: "ember" | "spark" | "smoke";
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
  const animFrame = useRef<number>(0);
  const lastTime = useRef(0);

  const colors = ["#ff3333", "#ff6644", "#cc2222", "#8b5cf6", "#a855f7", "#ff4466"];

  const createParticle = useCallback((x: number, y: number, type: Particle["type"] = "ember"): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === "spark" ? 1 + Math.random() * 3 : 0.2 + Math.random() * 0.8;
    const maxLife = type === "smoke" ? 120 + Math.random() * 80 : 40 + Math.random() * 60;
    return {
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === "ember" ? 0.5 : 0),
      size: type === "spark" ? 1 + Math.random() * 2 : type === "smoke" ? 3 + Math.random() * 6 : 2 + Math.random() * 3,
      alpha: type === "smoke" ? 0.05 : 0.3 + Math.random() * 0.7,
      color: type === "smoke" ? "#8b5cf6" : colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife,
      type,
    };
  }, []);

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

    for (let i = 0; i < 30; i++) {
      particles.current.push(
        createParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          "ember"
        )
      );
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.prevX = mouse.current.x;
      mouse.current.prevY = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      const dx = mouse.current.x - mouse.current.prevX;
      const dy = mouse.current.y - mouse.current.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      const count = Math.min(Math.floor(speed / 5), 4);
      for (let i = 0; i < count; i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "spark"));
      }
      if (speed > 10) {
        particles.current.push(createParticle(e.clientX, e.clientY, "smoke"));
      }
    };

    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 12; i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "spark"));
      }
      for (let i = 0; i < 3; i++) {
        particles.current.push(createParticle(e.clientX, e.clientY, "smoke"));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime.current) / 16, 3);
      lastTime.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.1) {
        particles.current.push(
          createParticle(
            Math.random() * canvas.width,
            canvas.height + 10,
            "ember"
          )
        );
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;

        if (p.type === "ember") {
          p.vy -= 0.02 * dt;
          p.vx += (Math.sin(p.life * 0.05) * 0.02) * dt;
        }

        const mx = mouse.current.x;
        const my = mouse.current.y;
        const ddx = p.x - mx;
        const ddy = p.y - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.3;
          p.vx += (ddx / dist) * force * dt;
          p.vy += (ddy / dist) * force * dt;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.99;
        p.vy *= 0.99;

        const fadeIn = Math.min(lifeRatio * 5, 1);
        const fadeOut = 1 - Math.max((lifeRatio - 0.7) / 0.3, 0);
        const currentAlpha = p.alpha * fadeIn * fadeOut;

        if (p.type === "spark") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.fill();
          ctx.globalAlpha = currentAlpha * 0.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "smoke") {
          const radius = p.size * (1 + lifeRatio * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "transparent");
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha * 0.6;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;

      if (particles.current.length > 200) {
        particles.current.splice(0, particles.current.length - 200);
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
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
