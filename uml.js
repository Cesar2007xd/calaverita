/**
 * Interactive UML Class Board for Pantalla 3 (POO)
 * - Draggable UML class nodes with real-time recalculation of SVG relationship connectors
 * - Visual links: Inheritance (Muerte extends Alumno), Dependency (Profesor -> ChatGPT),
 *   Association (Profesor -> Muerte), Aggregation (SalonDeClases <>-- Alumno)
 * - Executable methods with audio, memory gauge, and console feedback
 * - Integrates with ChatGPT response generation & Estrofa 2 typewriter
 */

class UmlBoard {
  constructor() {
    this.board = document.getElementById('umlBoard');
    this.linkLayer = document.getElementById('umlLinkLayer');
    this.statusEl = document.getElementById('pooStatusText');
    if (!this.board) return;

    this.nodes = {};
    this.links = [
      { from: 'classMuerteNode', to: 'nodeAlumno', type: 'inherit', label: 'extends' },
      { from: 'nodeProfesor', to: 'nodeChatGPT', type: 'depend', label: '«call»' },
      { from: 'nodeProfesor', to: 'classMuerteNode', type: 'assoc', label: 'evalúa' },
      { from: 'nodeSalon', to: 'nodeAlumno', type: 'aggr', label: '1..*' },
      { from: 'nodeSalon', to: 'classMuerteNode', type: 'depend', label: 'observa' }
    ];

    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };

    this.init();
  }

  init() {
    const nodeEls = this.board.querySelectorAll('.uml-node');
    nodeEls.forEach(el => {
      this.nodes[el.id] = {
        el,
        x: 0,
        y: 0,
        w: 0,
        h: 0
      };
      this.bindNodeDrag(el);
    });

    this.bindMethods();
    this.resetLayout();

    window.addEventListener('resize', () => {
      this.updateLinks();
    });

    const btnLayout = document.getElementById('btnUmlLayout');
    if (btnLayout) {
      btnLayout.addEventListener('click', () => {
        this.resetLayout();
        this.logConsole('Diseño de clases reordenado a posiciones de plantilla.');
      });
    }
  }

  // Set default responsive positions for classes with generous breathing room
  resetLayout() {
    const bw = this.board.clientWidth || this.board.offsetWidth || window.innerWidth || 1100;
    const bh = this.board.clientHeight || this.board.offsetHeight || 600;

    const nodeW = 220;
    const muerteW = Math.min(370, Math.max(320, bw * 0.28));

    const defaults = {
      nodeAlumno:      { x: Math.max(20, Math.round(bw * 0.02)), y: Math.max(16, Math.round(bh * 0.03)) },
      nodeSalon:       { x: Math.max(20, Math.round(bw * 0.02)), y: Math.max(Math.round(bh * 0.58), bh - 200) },
      classMuerteNode: { x: Math.max(260, Math.round((bw - muerteW) / 2 - 25)), y: Math.max(45, Math.round((bh - 330) / 2)) },
      nodeProfesor:    { x: Math.min(bw - nodeW - 20, bw - 245), y: Math.max(16, Math.round(bh * 0.03)) },
      nodeChatGPT:     { x: Math.min(bw - nodeW - 20, bw - 245), y: Math.max(Math.round(bh * 0.58), bh - 200) }
    };

    Object.keys(defaults).forEach(id => {
      const n = this.nodes[id];
      if (n) {
        n.x = defaults[id].x;
        n.y = defaults[id].y;
        n.el.style.left = `${n.x}px`;
        n.el.style.top = `${n.y}px`;
        n.el.classList.remove('is-hidden');
      }
    });

    setTimeout(() => this.updateLinks(), 40);
  }

  bindNodeDrag(el) {
    const header = el.querySelector('.uml-node-header');
    if (!header) return;

    header.style.cursor = 'grab';

    const onStart = (clientX, clientY) => {
      if (document.body.classList.contains('silence-paused')) return;
      this.dragTarget = el;
      header.style.cursor = 'grabbing';
      el.style.zIndex = '30';

      const rect = el.getBoundingClientRect();
      const boardRect = this.board.getBoundingClientRect();

      this.dragOffset.x = clientX - rect.left;
      this.dragOffset.y = clientY - rect.top;

      if (window.deckAudio) window.deckAudio.playTypeClick();
    };

    const onMove = (clientX, clientY) => {
      if (!this.dragTarget) return;
      const boardRect = this.board.getBoundingClientRect();

      let x = clientX - boardRect.left - this.dragOffset.x;
      let y = clientY - boardRect.top - this.dragOffset.y;

      // Constraints
      x = Math.max(10, Math.min(x, boardRect.width - this.dragTarget.offsetWidth - 10));
      y = Math.max(10, Math.min(y, boardRect.height - this.dragTarget.offsetHeight - 10));

      this.dragTarget.style.left = `${x}px`;
      this.dragTarget.style.top = `${y}px`;

      const n = this.nodes[this.dragTarget.id];
      if (n) {
        n.x = x;
        n.y = y;
      }

      this.updateLinks();
    };

    const onEnd = () => {
      if (this.dragTarget) {
        const h = this.dragTarget.querySelector('.uml-node-header');
        if (h) h.style.cursor = 'grab';
        this.dragTarget.style.zIndex = this.dragTarget.id === 'classMuerteNode' ? '15' : '10';
        this.dragTarget = null;
      }
    };

    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      onStart(e.clientX, e.clientY);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.dragTarget) onMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', onEnd);

    // Touch support
    header.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.dragTarget && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onEnd);
  }

  // Update dynamic SVG connectors
  updateLinks() {
    if (!this.linkLayer || !this.board) return;
    this.linkLayer.innerHTML = '';

    const boardRect = this.board.getBoundingClientRect();
    if (boardRect.width < 10) return; // Not visible yet

    this.links.forEach(link => {
      const fromEl = document.getElementById(link.from);
      const toEl = document.getElementById(link.to);
      if (!fromEl || !toEl) return;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();
      if (fRect.width < 10 || tRect.width < 10) return;

      // Relative coordinates
      const fx = (fRect.left + fRect.width / 2) - boardRect.left;
      const fy = (fRect.top + fRect.height / 2) - boardRect.top;
      const tx = (tRect.left + tRect.width / 2) - boardRect.left;
      const ty = (tRect.top + tRect.height / 2) - boardRect.top;

      // Find intersection points with borders for crisp connection
      const start = this.getRectBorderPoint(fx, fy, fRect.width, fRect.height, tx, ty);
      const end = this.getRectBorderPoint(tx, ty, tRect.width, tRect.height, fx, fy);

      if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y)) return;

      // Natural smooth curve control points with graceful exit and entry
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      let cx1, cy1, cx2, cy2;
      if (Math.abs(dx) >= Math.abs(dy) * 0.5) {
        // Horizontal emphasis: smooth S-curve
        const offsetX = Math.max(40, Math.abs(dx) * 0.45);
        cx1 = start.x + (dx > 0 ? offsetX : -offsetX);
        cy1 = start.y;
        cx2 = end.x - (dx > 0 ? offsetX : -offsetX);
        cy2 = end.y;
      } else {
        // Vertical emphasis
        const offsetY = Math.max(30, Math.abs(dy) * 0.45);
        cx1 = start.x;
        cy1 = start.y + (dy > 0 ? offsetY : -offsetY);
        cx2 = end.x;
        cy2 = end.y - (dy > 0 ? offsetY : -offsetY);
      }

      const pathData = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathData);
      pathEl.setAttribute('class', `uml-link-path ${link.type}`);

      if (link.type === 'inherit') {
        pathEl.setAttribute('marker-end', 'url(#mInherit)');
      } else if (link.type === 'depend') {
        pathEl.setAttribute('marker-end', 'url(#mArrow)');
      } else if (link.type === 'aggr') {
        pathEl.setAttribute('marker-start', 'url(#mDiamond)');
      } else if (link.type === 'assoc') {
        pathEl.setAttribute('marker-end', 'url(#mArrowGreen)');
      }

      this.linkLayer.appendChild(pathEl);

      // True Bezier curve midpoint at t = 0.5 for perfect label placement
      if (link.label) {
        const midX = 0.125 * start.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * end.x;
        const midY = 0.125 * start.y + 0.375 * cy1 + 0.375 * cy2 + 0.125 * end.y;

        const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeGroup.setAttribute('class', 'uml-label-badge-group');

        const labelText = link.label;
        const labelWidth = Math.max(54, labelText.length * 8.5 + 16);
        const labelHeight = 22;

        const rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectEl.setAttribute('x', (midX - labelWidth / 2).toFixed(1));
        rectEl.setAttribute('y', (midY - labelHeight / 2).toFixed(1));
        rectEl.setAttribute('width', labelWidth.toFixed(1));
        rectEl.setAttribute('height', labelHeight);
        rectEl.setAttribute('rx', 5);
        rectEl.setAttribute('class', `uml-label-badge-bg ${link.type}`);

        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', midX.toFixed(1));
        textEl.setAttribute('y', midY.toFixed(1));
        textEl.setAttribute('dy', '0.35em');
        textEl.setAttribute('class', `uml-link-label ${link.type}`);
        textEl.textContent = labelText;

        badgeGroup.appendChild(rectEl);
        badgeGroup.appendChild(textEl);
        this.linkLayer.appendChild(badgeGroup);
      }
    });
  }

  getRectBorderPoint(cx, cy, w, h, targetX, targetY) {
    const safeW = (w && w > 10) ? w : 220;
    const safeH = (h && h > 10) ? h : 160;

    let dx = targetX - cx;
    let dy = targetY - cy;
    if (Math.abs(dx) < 0.001) dx = dx >= 0 ? 0.001 : -0.001;
    if (Math.abs(dy) < 0.001) dy = dy >= 0 ? 0.001 : -0.001;

    const halfW = safeW / 2;
    const halfH = safeH / 2;

    const tanTheta = dy / dx;
    const tanCorner = halfH / halfW;

    let x, y;
    if (Math.abs(tanTheta) < tanCorner) {
      // Intersects left or right
      x = dx > 0 ? cx + halfW : cx - halfW;
      y = cy + (dx > 0 ? halfW : -halfW) * tanTheta;
    } else {
      // Intersects top or bottom
      y = dy > 0 ? cy + halfH : cy - halfH;
      x = cx + (dy > 0 ? halfH : -halfH) / tanTheta;
    }

    if (isNaN(x) || !isFinite(x)) x = cx;
    if (isNaN(y) || !isFinite(y)) y = cy;
    return { x, y };
  }

  bindMethods() {
    this.board.querySelectorAll('.uml-method').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const call = btn.getAttribute('data-call');
        this.executeMethod(call, btn);
      });
    });
  }

  executeMethod(call, btn) {
    if (document.body.classList.contains('silence-paused')) return;

    if (window.deckAudio) window.deckAudio.playTypeClick();
    btn.classList.add('method-called');
    setTimeout(() => btn.classList.remove('method-called'), 350);

    const memFill = document.getElementById('profMemFill');
    const memLabel = document.getElementById('profMemLabel');
    const gptStatus = document.getElementById('gptStatus');
    const gptReply = document.getElementById('gptReply');
    const threadState = document.getElementById('muerteThreadState');
    const salonDudas = document.getElementById('salonDudas');

    switch (call) {
      case 'alumno.asistirAClase':
        this.logConsole('Alumno.asistirAClase() → Presente con dudas en POO.');
        if (salonDudas) salonDudas.textContent = '1';
        break;

      case 'alumno.solicitarPuntos':
        this.logConsole('Alumno.solicitarPuntos() → Don Jorge: "Aquí es puro Python, no regalo nada."');
        break;

      case 'profesor.revisarCodigo':
        this.logConsole('Profesor.revisarCodigo(c) → Evaluando herencia y polimorfismo...');
        if (memFill) {
          memFill.style.width = '78%';
          if (memLabel) memLabel.textContent = '78% (Sobrecarga)';
        }
        break;

      case 'profesor.abrirChatGPT':
        this.logConsole('Profesor.abrirChatGPT() → Consultando IA para resolver la duda en clase...');
        if (gptStatus) {
          gptStatus.textContent = 'generando...';
          gptStatus.classList.add('active');
        }
        if (window.deckAudio) window.deckAudio.playChatGPTChime();
        if (gptReply) {
          gptReply.textContent = '"La herencia se aplica mediante extends..."';
          gptReply.style.display = 'block';
        }
        break;

      case 'chatgpt.generarRespuesta':
      case 'chatgpt.explicarPOO':
        this.logConsole('ChatGPT.explicarPOO() → "Un objeto es una instancia viva de una clase."');
        if (gptReply) {
          gptReply.textContent = '"class Muerte extends Alumno implementa la Parca."';
          gptReply.style.display = 'block';
        }
        if (window.deckAudio) window.deckAudio.playChatGPTChime();
        break;

      case 'muerte.compilar':
        this.logConsole('Muerte.compilar() → Compilación en progreso... ¡Parca trabada!');
        if (threadState) {
          threadState.textContent = 'BLOCKED (POO)';
          threadState.style.color = 'var(--neon-pink)';
        }
        break;

      case 'salon.pedirDudas':
        this.logConsole('Profesor: "¿Dudas, salón?" → ...y el salón volvió a callar.');
        if (salonDudas) salonDudas.textContent = '0 (Silencio)';
        break;

      case 'salon.callar':
        this.logConsole('SalonDeClases.callar() → Silencio total en el aula.');
        break;

      default:
        this.logConsole(`Ejecutado: ${call}()`);
    }
  }

  logConsole(msg) {
    if (this.statusEl) {
      this.statusEl.textContent = msg;
    }
  }
}

function onReadyUml(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReadyUml(() => {
  window.umlBoard = new UmlBoard();
});
