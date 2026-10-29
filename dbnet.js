/**
 * 3D Database Cluster Network & Hologram Controller for Pantalla 4 (Bases de Datos)
 * Direct visual inspiration from user reference:
 * - Central Master Database server with stacked metallic silver cylinders & glowing amber/gold core
 * - Radiating blue bus cables connecting to 7 satellite database servers
 * - Live animated data packets travelling along cables
 * - Interactive node inspection on click (pings node, shows records & status)
 * - Interactive SQL injection test by La Muerte (intercepted by Don Jorge's firewall)
 * - 3D Holographic query results lifting Estrofa 3
 */

class DbClusterNetwork {
  constructor() {
    this.networkEl = document.getElementById('dbNetwork');
    this.linksSvg = document.getElementById('dbLinks');
    this.packetLayer = document.getElementById('dbPacketLayer');
    this.infoPopup = document.getElementById('dbNodeInfo');
    if (!this.networkEl) return;

    this.nodes = [
      { id: 'master', name: 'Don Jorge Master DB', role: 'Motor Principal', isMaster: true, x: 0.5, y: 0.5, ip: '10.0.0.1:5432', status: 'ONLINE', records: 12840 },
      { id: 'purgatorio', name: 'Nodo Purgatorio', role: 'Tablas de Juicio', x: 0.5, y: 0.12, ip: '10.0.1.10:5432', status: 'SINCRONIZADO', records: 70 },
      { id: 'calificaciones', name: 'Calificaciones', role: 'Actas Semestrales', x: 0.82, y: 0.25, ip: '10.0.1.11:5432', status: 'ONLINE', records: 450 },
      { id: 'python', name: 'Python Scripts DB', role: 'Módulo Autorizado', x: 0.85, y: 0.65, ip: '10.0.1.12:5432', status: 'ACTIVO', records: 3200 },
      { id: 'alumnos', name: 'Alumnos Matriculados', role: 'Padrón Escolar', x: 0.5, y: 0.88, ip: '10.0.1.13:5432', status: 'ONLINE', records: 980 },
      { id: 'muerte', name: 'Nodo Parca (Java)', role: 'Módulo Aislado', x: 0.18, y: 0.72, ip: '10.0.1.14:5432', status: 'BLOQUEADO', records: 0 },
      { id: 'jsnode', name: 'JavaScript Engine', role: 'Runtime Amado', x: 0.15, y: 0.32, ip: '10.0.1.15:5432', status: 'ACTIVO', records: 5400 }
    ];

    this.init();
  }

  init() {
    this.renderNodes();
    this.renderCables();
    this.startPackets();

    window.addEventListener('resize', () => {
      this.updateNodePositions();
      this.renderCables();
    });

    const btnInject = document.getElementById('btnDbInject');
    if (btnInject) {
      btnInject.addEventListener('click', () => this.simulateSqlInjection());
    }

    const btnReplay = document.getElementById('btnDbReplay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        if (window.CalaveritaApp) {
          window.CalaveritaApp.state.screen4Animated = false;
          window.playScreen4Choreography();
        }
      });
    }

    // Close info on click outside
    document.addEventListener('click', (e) => {
      if (this.infoPopup && !this.infoPopup.contains(e.target) && !e.target.closest('.db-server-node')) {
        this.infoPopup.style.display = 'none';
      }
    });
  }

  renderNodes() {
    const nw = this.networkEl.clientWidth;
    const nh = this.networkEl.clientHeight;

    this.nodes.forEach(node => {
      const nodeEl = document.createElement('div');
      nodeEl.className = `db-server-node ${node.isMaster ? 'node-master' : 'node-satellite'}`;
      nodeEl.id = `dbnode_${node.id}`;

      const px = node.x * nw;
      const py = node.y * nh;
      nodeEl.style.left = `${px}px`;
      nodeEl.style.top = `${py}px`;

      // 3D metallic silver cylinder with glowing disc layers (like user image)
      nodeEl.innerHTML = `
        <div class="cylinder-server" title="${node.name}">
          <div class="cylinder-cap"></div>
          <div class="cylinder-disk disk-1"></div>
          <div class="cylinder-slit slit-1 ${node.isMaster ? 'amber-core' : 'cyan-core'}"></div>
          <div class="cylinder-disk disk-2"></div>
          <div class="cylinder-slit slit-2 ${node.isMaster ? 'amber-core' : 'cyan-core'}"></div>
          <div class="cylinder-disk disk-3"></div>
          <div class="cylinder-slit slit-3 ${node.isMaster ? 'amber-core' : 'cyan-core'}"></div>
          <div class="cylinder-base"></div>
        </div>
        <div class="db-node-tag">${node.id === 'master' ? 'DON JORGE MASTER' : node.name}</div>
      `;

      nodeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showNodeInfo(node, nodeEl);
      });

      this.networkEl.appendChild(nodeEl);
    });

    const onlineEl = document.getElementById('dbOnlineCount');
    if (onlineEl) onlineEl.textContent = '7/7';
    const latEl = document.getElementById('dbLatency');
    if (latEl) latEl.textContent = '2.4 ms';
  }

  updateNodePositions() {
    const nw = this.networkEl.clientWidth;
    const nh = this.networkEl.clientHeight;

    this.nodes.forEach(node => {
      const el = document.getElementById(`dbnode_${node.id}`);
      if (el) {
        el.style.left = `${node.x * nw}px`;
        el.style.top = `${node.y * nh}px`;
      }
    });
  }

  renderCables() {
    if (!this.linksSvg) return;
    this.linksSvg.innerHTML = '';

    const masterNode = this.nodes.find(n => n.isMaster);
    if (!masterNode) return;

    const nw = this.networkEl.clientWidth;
    const nh = this.networkEl.clientHeight;

    const mx = masterNode.x * nw;
    const my = masterNode.y * nh;

    this.nodes.forEach(sat => {
      if (sat.isMaster) return;

      const sx = sat.x * nw;
      const sy = sat.y * nh;

      // Glowing blue data cable
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', mx);
      line.setAttribute('y1', my);
      line.setAttribute('x2', sx);
      line.setAttribute('y2', sy);
      line.setAttribute('class', 'db-cable');
      this.linksSvg.appendChild(line);

      // Inner glowing core
      const core = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      core.setAttribute('x1', mx);
      core.setAttribute('y1', my);
      core.setAttribute('x2', sx);
      core.setAttribute('y2', sy);
      core.setAttribute('class', 'db-cable-core');
      this.linksSvg.appendChild(core);
    });
  }

  startPackets() {
    if (!this.packetLayer) return;

    setInterval(() => {
      const isSqlScreen = document.getElementById('screen4')?.classList.contains('active');
      if (!isSqlScreen || document.body.classList.contains('silence-paused')) return;

      const satellites = this.nodes.filter(n => !n.isMaster);
      const target = satellites[Math.floor(Math.random() * satellites.length)];
      this.spawnPacket(target, Math.random() > 0.5 ? 'out' : 'in');
    }, 450);
  }

  spawnPacket(satellite, direction = 'out') {
    const master = this.nodes.find(n => n.isMaster);
    if (!master) return;

    const nw = this.networkEl.clientWidth;
    const nh = this.networkEl.clientHeight;

    const mx = master.x * nw;
    const my = master.y * nh;
    const sx = satellite.x * nw;
    const sy = satellite.y * nh;

    const p = document.createElement('div');
    p.className = `db-packet ${satellite.id === 'muerte' ? 'pkt-red' : 'pkt-blue'}`;

    const startX = direction === 'out' ? mx : sx;
    const startY = direction === 'out' ? my : sy;
    const endX = direction === 'out' ? sx : mx;
    const endY = direction === 'out' ? sy : my;

    p.style.setProperty('--startX', `${startX}px`);
    p.style.setProperty('--startY', `${startY}px`);
    p.style.setProperty('--endX', `${endX}px`);
    p.style.setProperty('--endY', `${endY}px`);

    this.packetLayer.appendChild(p);

    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 900);
  }

  showNodeInfo(node, element) {
    if (!this.infoPopup) return;

    if (window.deckAudio) window.deckAudio.playPacketPing();

    this.infoPopup.innerHTML = `
      <div class="node-popup-header">
        <strong>${node.name}</strong>
        <span class="node-status-pill status-${node.status.toLowerCase()}">${node.status}</span>
      </div>
      <div class="node-popup-body">
        <div><strong>IP:</strong> ${node.ip}</div>
        <div><strong>Rol:</strong> ${node.role}</div>
        <div><strong>Registros:</strong> ${node.records.toLocaleString()} tuplas</div>
      </div>
      <button class="node-ping-btn" id="btnPingNode">Ping al Servidor</button>
    `;

    const rect = element.getBoundingClientRect();
    const netRect = this.networkEl.getBoundingClientRect();

    let left = rect.left - netRect.left + 40;
    let top = rect.top - netRect.top - 20;

    // Boundary check
    if (left + 220 > netRect.width) left = left - 240;
    if (top + 140 > netRect.height) top = netRect.height - 150;

    this.infoPopup.style.left = `${left}px`;
    this.infoPopup.style.top = `${top}px`;
    this.infoPopup.style.display = 'block';

    const pingBtn = document.getElementById('btnPingNode');
    if (pingBtn) {
      pingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.spawnPacket(node, 'out');
        setTimeout(() => this.spawnPacket(node, 'in'), 300);
        if (window.deckAudio) window.deckAudio.playPacketPing();
        if (window.showToast) window.showToast(`Ping a ${node.name}: 1.8ms (ACK)`);
      });
    }
  }

  // Interactive SQL Injection simulation
  simulateSqlInjection() {
    const muerteNode = this.nodes.find(n => n.id === 'muerte');
    const master = this.nodes.find(n => n.isMaster);
    const firewall = document.getElementById('dbFirewall');
    if (!muerteNode || !master) return;

    const nw = this.networkEl.clientWidth;
    const nh = this.networkEl.clientHeight;

    // Midpoint firewall position
    const mx = master.x * nw;
    const my = master.y * nh;
    const sx = muerteNode.x * nw;
    const sy = muerteNode.y * nh;

    const fwX = (mx + sx) / 2;
    const fwY = (my + sy) / 2;

    if (firewall) {
      firewall.style.left = `${fwX}px`;
      firewall.style.top = `${fwY}px`;
      firewall.classList.add('firewall-intercept');
    }

    // Red malicious packet
    const p = document.createElement('div');
    p.className = 'db-packet pkt-red pkt-injection';
    p.style.setProperty('--startX', `${sx}px`);
    p.style.setProperty('--startY', `${sy}px`);
    p.style.setProperty('--endX', `${fwX}px`);
    p.style.setProperty('--endY', `${fwY}px`);

    this.packetLayer.appendChild(p);

    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
      if (window.deckAudio) window.deckAudio.playSqlBlocked();

      if (window.showToast) {
        window.showToast("🛑 ¡INYECCIÓN DETECTADA Y BLOQUEADA POR EL FIREWALL DE DON JORGE!");
      }

      setTimeout(() => {
        if (firewall) firewall.classList.remove('firewall-intercept');
      }, 1500);
    }, 450);
  }

  triggerClusterScan() {
    const ring = document.getElementById('dbScanRing');
    if (ring) {
      ring.classList.remove('active');
      void ring.offsetWidth;
      ring.classList.add('active');
    }
  }

  triggerCelebration() {
    const layer = document.getElementById('dbConfetti');
    if (!layer) return;

    layer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const c = document.createElement('div');
      c.className = 'db-confetti-particle';
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDelay = `${Math.random() * 0.5}s`;
      c.style.animationDuration = `${1.2 + Math.random() * 1.5}s`;
      c.style.background = Math.random() > 0.5 ? 'var(--cempasuchil-gold)' : 'var(--neon-blue)';
      layer.appendChild(c);
    }
  }
}

function onReadyDb(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReadyDb(() => {
  window.dbCluster = new DbClusterNetwork();
});
