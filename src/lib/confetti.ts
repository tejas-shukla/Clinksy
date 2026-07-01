// Lightweight confetti — no dependencies, pure canvas + rAF.
// Call fireConfetti() from any client component.

const COLORS = [
  "#C5644A", // accent terracotta
  "#F4D7CB", // accent light
  "#A24D34", // accent dark
  "#0A0A0A", // ink
  "#E6E6E3", // ink light
  "#FAFAF7", // bone
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  w: number;
  h: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
}

export function fireConfetti(opts?: { origin?: { x: number; y: number } }) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }

  const cx = (opts?.origin?.x ?? 0.5) * canvas.width;
  const cy = (opts?.origin?.y ?? 0.38) * canvas.height;

  const particles: Particle[] = Array.from({ length: 160 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 5;
    return {
      x:        cx + (Math.random() - 0.5) * 50,
      y:        cy + (Math.random() - 0.5) * 20,
      vx:       Math.cos(angle) * speed * 0.75,
      vy:       Math.sin(angle) * speed - 5,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      w:        Math.random() * 10 + 5,
      h:        Math.random() * 5  + 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      alpha:    1,
    };
  });

  let frame = 0;

  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let anyVisible = false;

    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.28;     // gravity
      p.vx *= 0.992;    // air resistance
      p.rotation += p.rotSpeed;
      if (frame > 55) p.alpha = Math.max(0, p.alpha - 0.013);

      if (p.alpha > 0.02 && p.y < canvas.height + 30) {
        anyVisible = true;
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }
    }

    frame++;
    if (anyVisible && frame < 220) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(animate);
}
