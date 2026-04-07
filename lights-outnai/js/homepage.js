const sizeButtons = Array.from(document.querySelectorAll(".sizeChoice"));
const howToToggle = document.getElementById("howToToggle");
const howToContent = document.getElementById("howToContent");
const backdrop = document.getElementById("menuBackdrop");

sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = Number(btn.dataset.size);
    window.location.href = `./index.html?size=${size}`;
  });
});

if (howToToggle && howToContent) {
  howToToggle.addEventListener("click", () => {
    const isExpanded = howToToggle.getAttribute("aria-expanded") === "true";
    howToToggle.setAttribute("aria-expanded", String(!isExpanded));
    howToContent.hidden = isExpanded;
  });
}

if (backdrop) {
  const context = backdrop.getContext("2d");
  const particles = [];
  const metrics = { width: 0, height: 0 };
  let animationFrame = 0;
  let lastTime = 0;

  const resize = () => {
    const scale = window.devicePixelRatio || 1;
    metrics.width = window.innerWidth;
    metrics.height = window.innerHeight;
    backdrop.width = Math.floor(metrics.width * scale);
    backdrop.height = Math.floor(metrics.height * scale);
    backdrop.style.width = `${metrics.width}px`;
    backdrop.style.height = `${metrics.height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const targetCount = Math.max(42, Math.floor((metrics.width * metrics.height) / 24000));

    if (particles.length === 0) {
      for (let i = 0; i < targetCount; i += 1) {
        particles.push(createParticle());
      }
    } else {
      while (particles.length < targetCount) {
        particles.push(createParticle());
      }
      if (particles.length > targetCount) {
        particles.length = targetCount;
      }
    }
  };

  const createParticle = () => ({
    x: Math.random() * metrics.width,
    y: Math.random() * metrics.height,
    vx: (Math.random() - 0.5) * 0.16,
    vy: -(0.14 + Math.random() * 0.28),
    radius: 1.8 + Math.random() * 3,
    glow: 0.4 + Math.random() * 0.7,
    drift: Math.random() * Math.PI * 2,
  });

  const draw = (time) => {
    const elapsed = (time - lastTime) * 0.001;
    lastTime = time;
    context.clearRect(0, 0, metrics.width, metrics.height);
    context.fillStyle = "rgba(11,15,23,.08)";
    context.fillRect(0, 0, metrics.width, metrics.height);

    for (const particle of particles) {
      particle.drift += elapsed * 0.7;
      particle.x += particle.vx + Math.sin(particle.drift) * 0.05;
      particle.y += particle.vy;

      if (particle.y < -20) {
        particle.y = metrics.height + 20;
        particle.x = Math.random() * metrics.width;
      }
      if (particle.x < -20) particle.x = metrics.width + 20;
      if (particle.x > metrics.width + 20) particle.x = -20;

      const pulse = 0.55 + Math.sin(time * 0.0014 + particle.drift) * 0.25;
      const alpha = 0.07 + particle.glow * 0.2 + pulse * 0.09;
      const radius = particle.radius * (0.88 + pulse * 0.16);

      context.beginPath();
      context.fillStyle = `rgba(45,226,230,${alpha * 0.5})`;
      context.shadowColor = `rgba(45,226,230,${alpha})`;
      context.shadowBlur = 14 * particle.glow;
      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.shadowBlur = 0;
      context.fillStyle = `rgba(124,92,255,${0.04 + particle.glow * 0.09})`;
      context.arc(particle.x + 0.7, particle.y + 0.7, Math.max(0.7, radius * 0.38), 0, Math.PI * 2);
      context.fill();
    }

    animationFrame = window.requestAnimationFrame(draw);
  };

  resize();
  animationFrame = window.requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => window.cancelAnimationFrame(animationFrame));
}
