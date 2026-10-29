/**
 * Matrix Rain Canvas with Skull Glyphs & Hex Codes
 * Spec requirement: "Falling Matrix-style binary stream in the background composed of skull glyphs (☠) and standard hex values."
 */
class MatrixRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.columns = 0;
    this.drops = [];
    this.characters = [
      '☠', '💀', '🪦', '0', '1', 'A', 'B', 'C', 'D', 'E', 'F',
      '0xDEAD', '0xCAFE', '0x1337', '0x666', 'M', 'I', 'C', 'T', 'L', 'A', 'N'
    ];
    this.fontSize = 14;
    this.isRunning = false;
    this.intensity = 0.15; // Ambient default, ramps up on Slide 3

    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  init() {
    this.resize();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.random() * -100;
    }
  }

  setIntensity(level) {
    this.intensity = level;
    if (this.canvas) {
      this.canvas.style.opacity = level;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  loop() {
    if (!this.isRunning || !this.ctx) return;

    // Translucent black fade to create trails
    this.ctx.fillStyle = 'rgba(10, 14, 20, 0.08)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.drops.length; i++) {
      const char = this.characters[Math.floor(Math.random() * this.characters.length)];
      const isSkull = (char === '☠' || char === '💀' || char === '🪦');

      if (isSkull) {
        this.ctx.fillStyle = (Math.random() > 0.4) ? '#FF0055' : '#BD5FFF';
        this.ctx.font = `bold ${this.fontSize + 4}px 'Fira Code', monospace`;
      } else {
        this.ctx.fillStyle = (Math.random() > 0.85) ? '#FFFFFF' : '#00FF66';
        this.ctx.font = `${this.fontSize}px 'Fira Code', monospace`;
      }

      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      this.ctx.fillText(char, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.matrixRain = new MatrixRain('matrixCanvas');
