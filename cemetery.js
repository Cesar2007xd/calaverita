/**
 * Cemetery & Nocturnal Storm Scene for Portada
 * Features:
 * - Dark gothic cemetery hills, silhouetted wrought iron fences and tombstones
 * - Gnarled dead tree with a perched crow/raven with glowing eye and flight animation
 * - Thunder and procedural branching lightning strikes with sky flash
 * - Flickering altar candles (veladoras de Día de Muertos)
 * - 3D fluttering cempasúchil petals and autumn leaves
 * - Interactive clicks on sky (strikes lightning) and crow (triggers flight & caw)
 */

class CemeteryScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.flashEl = document.getElementById('thunderFlash');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.stars = [];
    this.leaves = [];
    this.candles = [];
    this.sparks = [];
    this.bolts = [];
    this.time = 0;
    this.wind = 1.0;

    // Crow state & position
    this.crow = {
      branchX: 0,
      branchY: 0,
      x: 0,
      y: 0,
      state: 'perched', // 'perched' | 'flying'
      flightTime: 0,
      flightDuration: 220,
      wingPhase: 0,
      facing: -1, // looking left towards center
      headAngle: 0,
      scale: 1.0
    };

    this.init();
    this.bindEvents();
  }

  init() {
    this.resize();

    // Stars
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 9000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.6),
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        twinkle: Math.random() * 0.04 + 0.01
      });
    }

    // Leaves & cempasúchil petals
    this.leaves = [];
    for (let i = 0; i < 40; i++) {
      this.leaves.push(this.createLeaf(true));
    }

    // Candles
    this.generateCandles();

    // Ambient thunder timer
    this.scheduleNextAmbientThunder();

    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    const holder = this.canvas.parentElement;
    const hw = holder && holder.clientWidth;
    const hh = holder && holder.clientHeight;
    this.width = hw > 100 ? hw : window.innerWidth;
    this.height = hh > 100 ? hh : Math.max(300, window.innerHeight - 51);
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Place crow on the big gnarled tree branch (top-right side)
    const treeX = this.width * 0.86;
    const treeY = this.height * 0.74;
    const branchX = treeX - 75;
    const branchY = treeY - 110;

    this.crow.branchX = branchX;
    this.crow.branchY = branchY;
    if (this.crow.state === 'perched') {
      this.crow.x = branchX;
      this.crow.y = branchY;
    }

    this.generateCandles();
  }

  generateCandles() {
    this.candles = [
      { x: this.width * 0.12, y: this.height * 0.86, base: 14, flame: 18, intensity: 1 },
      { x: this.width * 0.18, y: this.height * 0.88, base: 11, flame: 15, intensity: 1 },
      { x: this.width * 0.28, y: this.height * 0.82, base: 16, flame: 20, intensity: 1 },
      { x: this.width * 0.70, y: this.height * 0.85, base: 15, flame: 19, intensity: 1 },
      { x: this.width * 0.82, y: this.height * 0.88, base: 13, flame: 16, intensity: 1 }
    ];
  }

  createLeaf(randomY = false) {
    const isPetal = Math.random() > 0.4;
    return {
      x: Math.random() * (this.width + 160) - 80,
      y: randomY ? Math.random() * this.height : -30 - Math.random() * 40,
      size: isPetal ? (8 + Math.random() * 8) : (14 + Math.random() * 12),
      speedY: 1.3 + Math.random() * 1.8,
      speedX: 0.8 + Math.random() * 1.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      swayFreq: 0.02 + Math.random() * 0.02,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 25 + Math.random() * 25,
      type: isPetal ? 'petal' : 'leaf',
      color: isPetal
        ? (Math.random() > 0.5 ? '#FFAA00' : '#FF5500')
        : (Math.random() > 0.5 ? '#9E2A2B' : '#6B1D2F'),
      flip: 0,
      flipSpeed: 0.02 + Math.random() * 0.04
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Clicks on canvas: check if crow or candles or sky clicked
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.width / (rect.width || this.width));
      const y = (e.clientY - rect.top) * (this.height / (rect.height || this.height));

      // 1. Check if clicked on the Crow
      const distToCrow = Math.hypot(x - this.crow.x, y - (this.crow.y - 12));
      if (distToCrow < 45) {
        this.triggerCrowFlight();
        return;
      }

      // 2. Check if clicked near a candle
      let clickedCandle = false;
      this.candles.forEach(c => {
        if (Math.hypot(x - c.x, y - c.y) < 50) {
          clickedCandle = true;
          c.intensity = 2.8;
          if (window.deckAudio) window.deckAudio.playCandleIgnite();
          for (let i = 0; i < 20; i++) {
            this.sparks.push({
              x: c.x,
              y: c.y - c.flame,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 5 - 1,
              size: Math.random() * 3 + 1.5,
              alpha: 1,
              color: '#FFAA00'
            });
          }
        }
      });

      // 3. Otherwise, click on sky summons a lightning strike at that point!
      if (!clickedCandle) {
        this.triggerLightning(x, y);
      }
    });
  }

  scheduleNextAmbientThunder() {
    const delay = 10000 + Math.random() * 12000;
    setTimeout(() => {
      const isPortada = document.getElementById('screen1')?.classList.contains('active');
      if (isPortada && !document.body.classList.contains('silence-paused')) {
        this.triggerLightning();
      }
      this.scheduleNextAmbientThunder();
    }, delay);
  }

  // Thunder strike & flash
  triggerDramaticLightning(targetX = null, targetY = null) {
    const w = this.width;
    const h = this.height;

    if (targetX !== null && targetY !== null) {
      // Direct strike to target point with fork
      this.bolts.push(this.generateBolt(targetX + (Math.random() - 0.5) * 80, 0, targetX, targetY, 4, 38));
      this.bolts.push(this.generateBolt(targetX + (Math.random() - 0.5) * 120, 0, targetX + (Math.random() - 0.5) * 90, targetY * 0.85, 2, 28));
    } else {
      // Screen-wide dramatic apocalyptic thunder strike (3 branching bolts)
      const strikes = [
        { x: w * 0.18, y: h * 0.72 },
        { x: w * 0.50, y: h * 0.65 },
        { x: w * 0.82, y: h * 0.72 }
      ];

      // First bolt strikes immediately on frame 0
      this.bolts.push(this.generateBolt(strikes[1].x, 0, strikes[1].x, strikes[1].y, 4, 40));
      this.bolts.push(this.generateBolt(strikes[1].x - 40, 0, strikes[1].x + 35, strikes[1].y * 0.85, 2, 30));

      // Flanking bolts strike with micro-delays
      setTimeout(() => {
        this.bolts.push(this.generateBolt(strikes[0].x, 0, strikes[0].x, strikes[0].y, 4, 38));
      }, 60);

      setTimeout(() => {
        this.bolts.push(this.generateBolt(strikes[2].x, 0, strikes[2].x, strikes[2].y, 4, 38));
      }, 120);
    }

    // Strobe flash
    if (this.flashEl) {
      this.flashEl.classList.remove('active');
      void this.flashEl.offsetWidth; // retrigger
      this.flashEl.classList.add('active');
      setTimeout(() => this.flashEl.classList.remove('active'), 450);
    }

    if (window.deckAudio) {
      window.deckAudio.playThunder();
    }
  }

  triggerLightning(targetX = null, targetY = null) {
    this.triggerDramaticLightning(targetX, targetY);
  }

  generateBolt(x1, y1, x2, y2, branches = 3, life = 36) {
    const segments = [];
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(10, Math.floor(dist / 18));

    let curX = x1;
    let curY = y1;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const targetX = x1 + (x2 - x1) * t;
      const targetY = y1 + (y2 - y1) * t;
      const jitter = (Math.random() - 0.5) * 36;

      const nextX = targetX + jitter;
      const nextY = targetY;

      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      // Fork sub-branch
      if (branches > 0 && Math.random() > 0.55 && i < steps - 2) {
        const branchEndX = nextX + (Math.random() - 0.5) * 110;
        const branchEndY = nextY + 35 + Math.random() * 65;
        segments.push({ x1: nextX, y1: nextY, x2: branchEndX, y2: branchEndY, sub: true });
      }

      curX = nextX;
      curY = nextY;
    }

    return {
      segments,
      alpha: 1.0,
      life: life,
      maxLife: life
    };
  }

  // Draw procedural arc (for Don Jorge's hover)
  triggerLightningArc(x1, y1, x2, y2) {
    this.bolts.push(this.generateBolt(x1, y1, x2, y2, 0, 20));
  }

  // Crow flight trigger
  triggerCrowFlight() {
    this.crow.state = 'flying';
    this.crow.flightTime = 0;

    if (window.deckAudio) {
      window.deckAudio.playCrowCaw();
    }
  }

  // Light up all candles
  igniteAllCandles() {
    if (window.deckAudio) window.deckAudio.playCandleIgnite();
    this.candles.forEach(c => {
      c.intensity = 5.0;
      for (let i = 0; i < 45; i++) {
        this.sparks.push({
          x: c.x + (Math.random() - 0.5) * 18,
          y: c.y - c.flame * 1.5,
          vx: (Math.random() - 0.5) * 5.5,
          vy: -Math.random() * 6.5 - 2.5,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color: Math.random() > 0.4 ? '#FFAA00' : (Math.random() > 0.5 ? '#FF5500' : '#FFD700')
        });
      }
    });
  }

  animate() {
    this.time += 0.02;

    const isPortada = document.getElementById('screen1')?.classList.contains('active');
    if (isPortada && !document.body.classList.contains('silence-paused')) {
      try {
        this.draw();
      } catch (err) {
        // Un error de dibujo nunca debe congelar la escena ni los botones
        console.error('Cemetery draw error:', err);
        try { this.ctx.restore(); } catch (e2) {}
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Stormy Night Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#050209'); // deep black-purple
    sky.addColorStop(0.55, '#12041D');
    sky.addColorStop(0.85, '#2A093D');
    sky.addColorStop(1, '#0C0312');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars
    this.stars.forEach(s => {
      const a = s.alpha + Math.sin(this.time * 15 * s.twinkle) * 0.15;
      ctx.fillStyle = '#FFF8E7';
      ctx.globalAlpha = Math.max(0.1, Math.min(0.9, a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 3. Moon (Pale Gold Cempasúchil with dark mist)
    this.drawMoon(ctx);

    // 4. Ground Mist
    this.drawMist(ctx);

    // 5. Cemetery Back Ridge & Gnarled Trees
    this.drawCemeteryHills(ctx);

    // 6. Crow on Tree
    this.drawCrow(ctx);

    // 7. Foreground Tombstones & Fences
    this.drawTombstones(ctx);

    // 8. Candles
    this.drawCandles(ctx);

    // 9. Falling Leaves & Petals
    this.drawLeaves(ctx);

    // 10. Sparks
    this.drawSparks(ctx);

    // 11. Lightning Bolts
    this.drawBolts(ctx);
  }

  drawMoon(ctx) {
    const mx = this.width * 0.82;
    const my = this.height * 0.22;
    const mr = Math.min(this.width, this.height) * 0.095;

    // Halo
    const halo = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.5);
    halo.addColorStop(0, 'rgba(255, 170, 0, 0.28)');
    halo.addColorStop(0.5, 'rgba(189, 95, 255, 0.12)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, mr * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Disc
    const disc = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
    disc.addColorStop(0, '#FFF5DB');
    disc.addColorStop(0.7, '#FFAA00');
    disc.addColorStop(1, '#C85A00');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = 'rgba(160, 60, 0, 0.16)';
    ctx.beginPath();
    ctx.arc(mx - mr * 0.25, my - mr * 0.1, mr * 0.22, 0, Math.PI * 2);
    ctx.arc(mx + mr * 0.3, my + mr * 0.15, mr * 0.26, 0, Math.PI * 2);
    ctx.arc(mx + mr * 0.1, my - mr * 0.3, mr * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMist(ctx) {
    const mistY = this.height * 0.72;
    ctx.save();
    ctx.globalAlpha = 0.22;
    const grad = ctx.createLinearGradient(0, mistY - 30, 0, mistY + 120);
    grad.addColorStop(0, 'rgba(189, 95, 255, 0)');
    grad.addColorStop(0.5, 'rgba(189, 95, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 170, 0, 0)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, mistY);
    for (let x = 0; x <= this.width; x += 40) {
      const wave = Math.sin(x * 0.005 + this.time * 1.5) * 20;
      ctx.lineTo(x, mistY + wave);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCemeteryHills(ctx) {
    // Back Hill
    ctx.fillStyle = '#0F0317';
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.76);
    ctx.quadraticCurveTo(this.width * 0.3, this.height * 0.70, this.width * 0.65, this.height * 0.77);
    ctx.quadraticCurveTo(this.width * 0.85, this.height * 0.80, this.width, this.height * 0.73);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // Spooky Bare Trees
    this.drawBareTree(ctx, this.width * 0.18, this.height * 0.74, 55, false);
    // Big Tree where the Crow perches:
    this.drawBareTree(ctx, this.width * 0.86, this.height * 0.74, 90, true);
  }

  drawBareTree(ctx, x, y, size, isCrowTree) {
    ctx.save();
    ctx.strokeStyle = '#07010C';
    ctx.fillStyle = '#07010C';
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Trunk
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 8, y - size * 0.6, x - 12, y - size);
    ctx.stroke();

    // Main Branches
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    // Left branch
    ctx.moveTo(x - 8, y - size * 0.65);
    ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.85, x - size * 0.7, y - size * 1.05);
    // Sub-twigs
    ctx.moveTo(x - size * 0.45, y - size * 0.85);
    ctx.lineTo(x - size * 0.55, y - size * 1.25);
    // Right branch
    ctx.moveTo(x - 10, y - size * 0.75);
    ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.9, x + size * 0.6, y - size * 1.15);
    ctx.stroke();

    if (isCrowTree) {
      // Distinct sturdy perch branch for the crow
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - size * 0.9);
      ctx.quadraticCurveTo(x - 45, y - size * 0.98, x - 85, y - size * 0.94);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Crow / Raven rendering & animation
  drawCrow(ctx) {
    ctx.save();

    let cx, cy, angle = 0;
    const c = this.crow;

    if (c.state === 'perched') {
      cx = c.branchX;
      cy = c.branchY;
      c.x = cx;
      c.y = cy;
      c.headAngle = Math.sin(this.time * 2.5) * 0.1;
    } else {
      // Smooth continuous flight loop starting and returning to branch
      c.flightTime++;
      const progress = c.flightTime / c.flightDuration;

      if (progress >= 1.0) {
        c.state = 'perched';
        c.flightTime = 0;
        cx = c.branchX;
        cy = c.branchY;
        c.x = cx;
        c.y = cy;
      } else {
        const lift = Math.sin(progress * Math.PI); // 0 at start, 1 at peak, 0 at return
        const flightOffsetX = -Math.sin(progress * Math.PI * 2) * (this.width * 0.38);
        const flightOffsetY = -lift * (this.height * 0.48) - Math.sin(progress * Math.PI * 4) * 25;

        cx = c.branchX + flightOffsetX;
        cy = c.branchY + flightOffsetY;

        // Directional flight banking angle
        angle = -Math.cos(progress * Math.PI * 2) * 0.35 + (progress < 0.5 ? -0.15 : 0.15);
        c.x = cx;
        c.y = cy;

        // Mystic soaring feather aura particles
        if (Math.random() > 0.35) {
          this.sparks.push({
            x: cx + (Math.random() - 0.5) * 14,
            y: cy + 6,
            vx: (Math.random() - 0.5) * 2.5,
            vy: Math.random() * 2 + 0.8,
            size: Math.random() * 4 + 2,
            alpha: 1,
            color: Math.random() > 0.5 ? '#BD5FFF' : '#00E5FF'
          });
        }
      }
    }

    ctx.translate(cx, cy);
    const flyScale = c.state === 'flying' ? (1.0 + Math.sin((c.flightTime / c.flightDuration) * Math.PI) * 0.75) : 1.0;
    ctx.scale(flyScale, flyScale);
    ctx.rotate(angle);

    // Crow Silhouette
    ctx.fillStyle = '#050109';
    ctx.strokeStyle = '#050109';

    if (c.state === 'perched') {
      // Body
      ctx.beginPath();
      ctx.ellipse(0, -10, 11, 7, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(18, -2);
      ctx.lineTo(15, -9);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.save();
      ctx.translate(-9, -15);
      ctx.rotate(c.headAngle);
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.lineTo(-12, 1);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.fill();

      // Glowing Eye (Amber / Cyan)
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-2, -1, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Claws grasping the branch
      ctx.strokeStyle = '#180B22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-2, -3); ctx.lineTo(-2, 3);
      ctx.moveTo(2, -3); ctx.lineTo(2, 3);
      ctx.stroke();

    } else {
      // Crow Flying (Wings flapping with Math.sin)
      c.wingPhase += 0.35;
      const wingFlap = Math.sin(c.wingPhase);

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head & Beak
      ctx.beginPath();
      ctx.arc(-13, -1, 4.5, 0, Math.PI * 2);
      ctx.moveTo(-16, -2);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-16, 2);
      ctx.closePath();
      ctx.fill();

      // Glowing eye
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(-14, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Wings (Left & Right flapping)
      ctx.fillStyle = '#050109';
      // Wing up/down
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(0, -22 * wingFlap, 18, -26 * wingFlap);
      ctx.lineTo(8, -2);
      ctx.closePath();
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(12, -2);
      ctx.lineTo(24, 0);
      ctx.lineTo(12, 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawTombstones(ctx) {
    // Front Hill
    ctx.fillStyle = '#07010C';
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.84);
    ctx.quadraticCurveTo(this.width * 0.25, this.height * 0.81, this.width * 0.5, this.height * 0.85);
    ctx.quadraticCurveTo(this.width * 0.75, this.height * 0.88, this.width, this.height * 0.83);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // Wrought Iron Fence
    ctx.strokeStyle = '#12041A';
    ctx.lineWidth = 2;
    for (let fx = 0; fx < this.width; fx += 30) {
      const gy = this.height * 0.83 + Math.sin(fx * 0.003) * 12;
      ctx.beginPath();
      ctx.moveTo(fx, gy);
      ctx.lineTo(fx, gy - 26);
      ctx.moveTo(fx - 3, gy - 20);
      ctx.lineTo(fx, gy - 28);
      ctx.lineTo(fx + 3, gy - 20);
      ctx.stroke();
    }

    // Tombstones
    this.drawStone(ctx, this.width * 0.14, this.height * 0.86, 36, 48, 'cross');
    this.drawStone(ctx, this.width * 0.27, this.height * 0.82, 42, 56, 'round');
    this.drawStone(ctx, this.width * 0.71, this.height * 0.85, 38, 52, 'round');
    this.drawStone(ctx, this.width * 0.84, this.height * 0.88, 32, 45, 'cross');
  }

  drawStone(ctx, x, y, w, h, style) {
    ctx.save();
    ctx.fillStyle = '#0D0315';
    ctx.strokeStyle = '#250838';
    ctx.lineWidth = 1.5;

    if (style === 'round') {
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x - w / 2, y - h + w / 2);
      ctx.arc(x, y - h + w / 2, w / 2, Math.PI, 0);
      ctx.lineTo(x + w / 2, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cross engraving
      ctx.strokeStyle = 'rgba(255, 170, 0, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x, y - h + 15); ctx.lineTo(x, y - h + 35);
      ctx.moveTo(x - 7, y - h + 22); ctx.lineTo(x + 7, y - h + 22);
      ctx.stroke();
    } else {
      // Cross
      const sw = w * 0.32;
      ctx.fillRect(x - sw / 2, y - h, sw, h);
      ctx.fillRect(x - w / 2, y - h * 0.7, w, h * 0.24);
      ctx.strokeRect(x - sw / 2, y - h, sw, h);
      ctx.strokeRect(x - w / 2, y - h * 0.7, w, h * 0.24);
    }

    // Cempasúchil garland base
    ctx.fillStyle = '#FFAA00';
    for (let fx = x - w * 0.55; fx <= x + w * 0.55; fx += 7) {
      ctx.beginPath();
      ctx.arc(fx, y - 2, 3.8 + Math.sin(fx) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCandles(ctx) {
    this.candles.forEach(c => {
      if (c.intensity > 1) c.intensity -= 0.015;

      const flicker = (Math.sin(this.time * 16 + c.x) + Math.cos(this.time * 24 + c.y)) * 1.8;
      const fh = (c.flame + flicker) * c.intensity;

      // Wax body
      ctx.fillStyle = '#FFF8E7';
      ctx.fillRect(c.x - 3, c.y - c.base, 6, c.base);

      // Warm radial glow on the ground
      const glow = ctx.createRadialGradient(c.x, c.y - c.base, 2, c.x, c.y - c.base, 42 * c.intensity);
      glow.addColorStop(0, 'rgba(255, 170, 0, 0.45)');
      glow.addColorStop(0.5, 'rgba(255, 85, 0, 0.15)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(c.x, c.y - c.base, 42 * c.intensity, 0, Math.PI * 2);
      ctx.fill();

      // Flame
      const fy = c.y - c.base - fh;
      const fg = ctx.createRadialGradient(c.x, c.y - c.base - fh * 0.4, 1, c.x, c.y - c.base - fh * 0.4, fh);
      fg.addColorStop(0, '#FFFFFF');
      fg.addColorStop(0.3, '#FFE066');
      fg.addColorStop(0.7, '#FF6600');
      fg.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(c.x - 4, c.y - c.base);
      ctx.quadraticCurveTo(c.x - 6, fy + fh * 0.4, c.x, fy);
      ctx.quadraticCurveTo(c.x + 6, fy + fh * 0.4, c.x + 4, c.y - c.base);
      ctx.closePath();
      ctx.fill();
    });
  }

  drawLeaves(ctx) {
    this.leaves.forEach(leaf => {
      leaf.y += leaf.speedY;
      leaf.x += leaf.speedX * this.wind + Math.sin(this.time * 3 + leaf.swayPhase) * (leaf.swayAmp * 0.05);
      leaf.rotation += leaf.rotationSpeed;
      leaf.flip += leaf.flipSpeed;

      if (leaf.y > this.height + 40) {
        leaf.y = -30;
        leaf.x = Math.random() * (this.width + 160) - 80;
      }

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.scale(1, Math.cos(leaf.flip));

      ctx.fillStyle = leaf.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;

      if (leaf.type === 'petal') {
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.quadraticCurveTo(leaf.size * 0.6, 0, 0, leaf.size);
        ctx.quadraticCurveTo(-leaf.size * 0.6, 0, 0, -leaf.size);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.quadraticCurveTo(leaf.size * 0.8, -leaf.size * 0.3, leaf.size * 0.5, leaf.size * 0.5);
        ctx.lineTo(0, leaf.size);
        ctx.lineTo(-leaf.size * 0.5, leaf.size * 0.5);
        ctx.quadraticCurveTo(-leaf.size * 0.8, -leaf.size * 0.3, 0, -leaf.size);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  drawSparks(ctx) {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.025;

      if (sp.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = sp.alpha;
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawBolts(ctx) {
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const bolt = this.bolts[i];
      bolt.life--;

      if (bolt.life <= 0) {
        this.bolts.splice(i, 1);
        continue;
      }

      const maxLife = bolt.maxLife || 36;
      // Strobe flickering alpha
      const flicker = (Math.sin(bolt.life * 1.5) * 0.15 + 0.85);
      const a = Math.min(1.0, (bolt.life / (maxLife * 0.5))) * flicker;

      ctx.save();
      ctx.globalAlpha = Math.max(0.05, a);

      // Outer violet electric aura
      ctx.strokeStyle = '#BD5FFF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 32;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      bolt.segments.forEach(seg => {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      });
      ctx.stroke();

      // Middle cyan high-voltage arc
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner brilliant white core
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      bolt.segments.forEach(seg => {
        if (!seg.sub) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
      });
      ctx.stroke();

      ctx.restore();
    }
  }
}

function onReadyCemetery(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReadyCemetery(() => {
  window.cemeteryScene = new CemeteryScene('cemeteryCanvas');
});
