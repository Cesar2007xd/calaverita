/**
 * Calaverita Literaria - Ing. Jorge Martínez Muñoz
 * Controlador Maestro de Coreografía, Navegación, Sonido e Interacciones
 * Organizado por la Comunidad de Ciencias Computacionales (CCC)
 */

const CalaveritaApp = {
  currentScreen: 1,
  totalScreens: 4,
  state: {
    screen2Animated: false,
    screen3Animated: false,
    screen4Animated: false,
    isSilenceActive: false
  },
  // REGLA CERO: Versos Oficiales Inmutables
  stanzas: {
    stanza1: [
      "Llegó la Muerte en Java buscando su setenta,",
      "don Jorge vio el programa y le cobró la renta:",
      "\"Aquí es puro Python o mi amado JavaScript,",
      "te llevas un N/A y te borro todo el script\"."
    ],
    stanza2: [
      "En clase de POO la Parca se trabó,",
      "y al profe de repente la memoria le falló.",
      "Abrió su ChatGPT para a todos enseñar,",
      "pidió que hubiera dudas... y el salón volvió a callar."
    ],
    stanza3: [
      "Ya en Bases de Datos le intentó inyectar,",
      "consultas y registros que no pudo conectar.",
      "Aunque exige el código tal como lo explicó,",
      "afuera de las aulas, a la Muerte rescató."
    ]
  },
  timeouts: [],
  intervals: []
};

function onReadyApp(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Global action hooks for HTML onclick attributes (bulletproof fallback)
window.goToScreen = goToScreen;
function safeRun(fn) {
  try { fn(); } catch (err) { console.error(err); }
}

window.triggerLightningAction = function() {
  const btn = document.getElementById('btnLightning');
  if (btn) {
    btn.classList.add('clicked-cyan');
    setTimeout(() => btn.classList.remove('clicked-cyan'), 500);
  }

  // 1. Audio: Ensure AudioContext is ready and play thunder + zap
  safeRun(() => {
    if (window.deckAudio) {
      window.deckAudio.init();
      window.deckAudio.playThunder();
      window.deckAudio.playElectricZap();
    }
  });

  // 2. Trigger multi-bolt dramatic lightning
  safeRun(() => {
    if (window.cemeteryScene) {
      window.cemeteryScene.triggerDramaticLightning();
    }
  });

  // 3. Screen earthquake shock on screen 1
  safeRun(() => {
    const s1 = document.getElementById('screen1');
    if (s1) {
      s1.classList.remove('screen-earthquake');
      void s1.offsetWidth;
      s1.classList.add('screen-earthquake');
      setTimeout(() => s1.classList.remove('screen-earthquake'), 480);
    }
  });

  // 4. Overload high-voltage vibration & sparks on Don Jorge's card
  safeRun(() => {
    const nameWrap = document.getElementById('electricNameWrapper');
    if (nameWrap) {
      nameWrap.classList.add('electric-active');
      createDOMSparks(nameWrap);
      setTimeout(() => nameWrap.classList.remove('electric-active'), 850);
    }
  });

  safeRun(() => {
    if (window.showToast) window.showToast("⚡ ¡Relámpago desatado en el cementerio!");
  });
};

window.igniteCandlesAction = function() {
  const btn = document.getElementById('btnIgniteCandles');
  if (btn) {
    btn.classList.add('clicked-gold');
    setTimeout(() => btn.classList.remove('clicked-gold'), 500);
  }

  safeRun(() => {
    if (window.deckAudio) {
      window.deckAudio.init();
      window.deckAudio.playCandleIgnite();
    }
  });

  safeRun(() => {
    if (window.cemeteryScene) {
      window.cemeteryScene.igniteAllCandles();
    }
  });

  safeRun(() => {
    if (window.showToast) window.showToast("🕯️ ¡Veladoras del altar encendidas!");
  });
};

window.triggerCrowAction = function() {
  const btn = document.getElementById('btnCrow');
  if (btn) {
    btn.classList.add('clicked-purple');
    setTimeout(() => btn.classList.remove('clicked-purple'), 500);
  }

  safeRun(() => {
    if (window.deckAudio) {
      window.deckAudio.init();
      window.deckAudio.playCrowCaw();
    }
  });

  safeRun(() => {
    if (window.cemeteryScene) {
      window.cemeteryScene.triggerCrowFlight();
    }
  });

  safeRun(() => {
    if (window.showToast) window.showToast("🦅 ¡El cuervo grazna y alza el vuelo!");
  });
};
window.restartPresentationAction = function() {
  resetPresentation();
  goToScreen(1);
  if (window.showToast) window.showToast("Calaverita reiniciada desde el inicio");
};

onReadyApp(() => {
  try { initNavigation(); } catch (e) { console.error(e); }
  try { initFullscreen(); } catch (e) { console.error(e); }
  try { initElectricInteraction(); } catch (e) { console.error(e); }
  try { initAudioToggle(); } catch (e) { console.error(e); }
  try { initPortadaButtons(); } catch (e) { console.error(e); }
  try { initModals(); } catch (e) { console.error(e); }
  try { initSlideControls(); } catch (e) { console.error(e); }

  // Iniciar en portada
  goToScreen(1);
});

/* ==========================================================================
   Gestión de Pantalla Completa (Fullscreen API)
   ========================================================================== */
function initFullscreen() {
  const fsBtn = document.getElementById('fullscreenToggleBtn');
  const fsIconUse = document.getElementById('fsIconUse');
  const fsText = document.getElementById('fsText');

  function updateFsUI() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (fsIconUse) fsIconUse.setAttribute('href', isFs ? '#i-compress' : '#i-expand');
    if (fsText) fsText.textContent = isFs ? 'Salir' : 'Pantalla completa';
  }

  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      toggleFullscreen();
    });
  }

  document.addEventListener('fullscreenchange', updateFsUI);
  document.addEventListener('webkitfullscreenchange', updateFsUI);
}

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
    showToast("Modo Pantalla Completa Activado (Presiona F o Esc para salir)");
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/* ==========================================================================
   Navegación entre Pantallas (Diapositivas)
   ========================================================================== */
let isNavigating = false;
function goToScreen(screenNumber) {
  if (CalaveritaApp.state.isSilenceActive) return; // Bloqueo durante micro-interacción de silencio
  if (screenNumber < 1 || screenNumber > CalaveritaApp.totalScreens) return;
  if (isNavigating) return;
  isNavigating = true;
  setTimeout(() => { isNavigating = false; }, 260);

  closeAllModals();
  CalaveritaApp.currentScreen = screenNumber;

  // Actualizar visibilidad de pantallas
  document.querySelectorAll('.slide-screen').forEach((screen, idx) => {
    const isTarget = (idx + 1) === screenNumber;
    screen.classList.toggle('active', isTarget);
  });

  // Actualizar indicadores de navegación superior
  document.querySelectorAll('.nav-dot').forEach((dot, idx) => {
    const isTarget = (idx + 1) === screenNumber;
    dot.classList.toggle('active', isTarget);
  });

  // Barra de progreso superior
  const progressPercent = (screenNumber / CalaveritaApp.totalScreens) * 100;
  const progressBar = document.getElementById('slideProgressBar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  announceScreenReader(`Diapositiva ${screenNumber} de 4`);

  // Coreografías según pantalla
  if (screenNumber === 1) {
    // Portada
  } else if (screenNumber === 2) {
    playScreen2Choreography();
  } else if (screenNumber === 3) {
    if (window.umlBoard) {
      window.umlBoard.resetLayout();
      setTimeout(() => {
        if (window.umlBoard) window.umlBoard.updateLinks();
      }, 40);
    }
    playScreen3Choreography();
  } else if (screenNumber === 4) {
    if (window.dbCluster) {
      setTimeout(() => {
        window.dbCluster.updateNodePositions();
        window.dbCluster.renderCables();
      }, 50);
    }
    playScreen4Choreography();
  }
}

function initNavigation() {
  // Botón Iniciar en portada
  const btnIniciar = document.getElementById('btnIniciar');
  if (btnIniciar) {
    btnIniciar.addEventListener('click', (e) => {
      e.stopPropagation();
      goToScreen(2);
    });
  }

  // Botón Siguiente Pantalla 2 -> 3
  const btnNext2 = document.getElementById('btnNextFromScreen2');
  if (btnNext2) {
    btnNext2.addEventListener('click', () => {
      goToScreen(3);
    });
  }

  // Botón Siguiente Pantalla 3 -> 4
  const btnNext3 = document.getElementById('btnNextFromScreen3');
  if (btnNext3) {
    btnNext3.addEventListener('click', () => {
      goToScreen(4);
    });
  }

  // Botón Reiniciar en Pantalla 4
  const btnRestart = document.getElementById('btnRestartCalaverita');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      resetPresentation();
      goToScreen(1);
      showToast("Calaverita reiniciada desde el inicio");
    });
  }

  // Clic en dots de navegación superior
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const target = parseInt(e.currentTarget.getAttribute('data-screen'), 10);
      goToScreen(target);
    });
  });

  // Controles de teclado
  window.addEventListener('keydown', (e) => {
    if (CalaveritaApp.state.isSilenceActive) return;

    // Espacio/Enter sobre un botón enfocado activa SOLO ese botón (no avanza diapositiva)
    const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
    if ((e.key === ' ' || e.key === 'Enter') && (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'A')) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      if (CalaveritaApp.currentScreen < CalaveritaApp.totalScreens) {
        goToScreen(CalaveritaApp.currentScreen + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (CalaveritaApp.currentScreen > 1) {
        goToScreen(CalaveritaApp.currentScreen - 1);
      }
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'm') {
      toggleAudio();
    } else if (e.key.toLowerCase() === 'r') {
      resetPresentation();
      goToScreen(1);
    } else if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function resetPresentation() {
  clearAllTimeouts();

  CalaveritaApp.state.screen2Animated = false;
  CalaveritaApp.state.screen3Animated = false;
  CalaveritaApp.state.screen4Animated = false;
  CalaveritaApp.state.isSilenceActive = false;

  document.body.classList.remove('silence-paused');
  const silenceOverlay = document.getElementById('silenceOverlay');
  if (silenceOverlay) silenceOverlay.classList.remove('active');

  // Reset Pantalla 2
  const javaOut = document.getElementById('javaCodeOutput');
  const pyCard = document.getElementById('pythonCodeCard');
  const pyOut = document.getElementById('pythonCodeOutput');
  const tabName = document.getElementById('tabFileName');
  const tabIcon = document.getElementById('tabFileIcon');
  const btnNext2 = document.getElementById('btnNextFromScreen2');
  const treeJava = document.getElementById('treeJavaFile');
  const treePy = document.getElementById('treePyFile');
  const modeInd = document.getElementById('ideModeIndicator');
  const ideWin = document.getElementById('ideWindowFundamentos');
  const modal = document.getElementById('fatalJavaModal');

  if (ideWin) ideWin.classList.remove('screen-earthquake');
  if (modal) modal.classList.remove('visible');
  if (javaOut) { javaOut.textContent = ''; javaOut.style.display = 'block'; }
  if (pyCard) pyCard.style.display = 'none';
  if (pyOut) pyOut.innerHTML = '';
  if (tabName) tabName.textContent = 'ExamenFinal.java';
  if (tabIcon) {
    tabIcon.textContent = 'J';
    tabIcon.className = 'file-badge badge-java';
  }
  if (treeJava) treeJava.style.display = 'block';
  if (treePy) treePy.style.display = 'none';
  if (modeInd) {
    modeInd.textContent = 'JAVA RUNTIME 21';
    modeInd.style.color = 'var(--neon-blue)';
  }
  if (btnNext2) {
    btnNext2.disabled = true;
    btnNext2.classList.remove('pulse-ready');
  }

  // Reset Pantalla 3
  const chatGpt = document.getElementById('chatGptPill');
  const btnNext3 = document.getElementById('btnNextFromScreen3');
  const pooStatus = document.getElementById('pooStatusText');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`pooVerse${i}`);
    if (el) el.textContent = '';
  }
  if (chatGpt) chatGpt.style.display = 'none';
  if (btnNext3) {
    btnNext3.style.display = 'none';
    btnNext3.classList.remove('pulse-ready');
  }
  if (pooStatus) pooStatus.textContent = "Inicializando arquitectura de clases...";

  if (window.umlBoard) {
    window.umlBoard.resetLayout();
  }

  // Reset Pantalla 4
  const sqlCmd = document.getElementById('sqlCommandTyping');
  if (sqlCmd) sqlCmd.textContent = '';
  const queryStatus = document.getElementById('dbQueryStatus');
  if (queryStatus) queryStatus.textContent = '';
  const btnInject = document.getElementById('btnDbInject');
  if (btnInject) btnInject.disabled = true;
  const rowsCount = document.getElementById('holoRowsCount');
  if (rowsCount) rowsCount.textContent = '[0 REGISTROS]';

  for (let i = 1; i <= 4; i++) {
    const row = document.getElementById(`holoRow${i}`);
    if (row) {
      row.classList.remove('revealed');
      const vtd = row.querySelector('.holo-verse');
      if (vtd) vtd.textContent = '';
    }
  }
}

function clearAllTimeouts() {
  CalaveritaApp.timeouts.forEach(t => clearTimeout(t));
  CalaveritaApp.timeouts = [];
  CalaveritaApp.intervals.forEach(i => clearInterval(i));
  CalaveritaApp.intervals = [];
}

function safeTimeout(fn, delay) {
  const t = setTimeout(fn, delay);
  CalaveritaApp.timeouts.push(t);
  return t;
}

function safeInterval(fn, delay) {
  const i = setInterval(fn, delay);
  CalaveritaApp.intervals.push(i);
  return i;
}

/* ==========================================================================
   PANTALLA 1: Portada & Micro-interacción OBLIGATORIA (El toque eléctrico)
   ========================================================================== */
function createDOMSparks(wrapper) {
  if (!wrapper) return;
  for (let i = 0; i < 7; i++) {
    const spark = document.createElement('span');
    spark.className = 'electric-spark-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 45;
    spark.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    spark.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    spark.style.left = `${10 + Math.random() * 80}%`;
    spark.style.top = `${20 + Math.random() * 60}%`;
    wrapper.appendChild(spark);
    setTimeout(() => spark.remove(), 400);
  }
}

function initElectricInteraction() {
  const nameWrapper = document.getElementById('electricNameWrapper');
  if (!nameWrapper) return;

  const triggerShock = (e) => {
    nameWrapper.classList.add('electric-active');
    if (window.deckAudio) window.deckAudio.playElectricZap();

    createDOMSparks(nameWrapper);

    if (window.cemeteryScene) {
      const rect = nameWrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const tx = rect.left + Math.random() * rect.width;
      const ty = rect.top + Math.random() * rect.height;
      window.cemeteryScene.triggerLightningArc(cx, cy, tx, ty);
    }
  };

  nameWrapper.addEventListener('mouseenter', triggerShock);
  nameWrapper.addEventListener('pointerenter', triggerShock);
  nameWrapper.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.6) triggerShock(e);
  });
  nameWrapper.addEventListener('mouseleave', () => {
    nameWrapper.classList.remove('electric-active');
  });
  nameWrapper.addEventListener('pointerleave', () => {
    nameWrapper.classList.remove('electric-active');
  });

  // Clic en el nombre: sobrecarga eléctrica
  nameWrapper.addEventListener('click', (e) => {
    triggerShock(e);
    showToast("¡Sobrecarga de alta tensión de Don Jorge!");
    if (window.cemeteryScene) {
      window.cemeteryScene.triggerLightning();
      const rect = nameWrapper.getBoundingClientRect();
      for (let i = 0; i < 5; i++) {
        window.cemeteryScene.triggerLightningArc(
          rect.left + Math.random() * rect.width,
          rect.top + Math.random() * rect.height,
          rect.left + Math.random() * rect.width,
          rect.top + Math.random() * rect.height
        );
      }
    }
  });

  nameWrapper.addEventListener('focus', triggerShock);
  nameWrapper.addEventListener('blur', () => {
    nameWrapper.classList.remove('electric-active');
  });
}

function initPortadaButtons() {
  const btnLightning = document.getElementById('btnLightning');
  if (btnLightning) {
    btnLightning.onclick = (e) => {
      if (e) e.stopPropagation();
      triggerLightningAction();
    };
  }

  const btnCandles = document.getElementById('btnIgniteCandles');
  if (btnCandles) {
    btnCandles.onclick = (e) => {
      if (e) e.stopPropagation();
      igniteCandlesAction();
    };
  }

  const btnCrow = document.getElementById('btnCrow');
  if (btnCrow) {
    btnCrow.onclick = (e) => {
      if (e) e.stopPropagation();
      triggerCrowAction();
    };
  }
}

/* ==========================================================================
   PANTALLA 2: FUNDAMENTOS (Azul / Editor de Código Dark IDE)
   Animación Secuencial Estricta:
   a. Máquina de escribir rápida redactando código genérico en Java.
   b. Inmediatamente después: la pantalla tiembla, se tiñe de rojo y modal de error:
      "[ERROR FATAL] LENGUAJE JAVA NO PERMITIDO. CALIFICACIÓN: N/A".
   c. El modal desaparece, el código Java se borra solo, y la pestaña cambia a fundamentos.py.
   d. Comienza a escribirse la Estrofa 1 línea por línea simulando escritura humana.
   ========================================================================== */
function playScreen2Choreography() {
  clearAllTimeouts();
  CalaveritaApp.state.screen2Animated = true;

  const javaCode = `// Buscando aprobación de fin de semestre
public class ExamenFinal {
    public static void main(String[] args) {
        int calificacion = 70; // Setenta deseado
        Muerte parca = new Muerte();
        parca.aprobarMateria();
        System.out.println("¿Aprobada?");
    }
}`;

  const javaOutput = document.getElementById('javaCodeOutput');
  const pyCard = document.getElementById('pythonCodeCard');
  const pyOutput = document.getElementById('pythonCodeOutput');
  const ideWindow = document.getElementById('ideWindowFundamentos');
  const fatalModal = document.getElementById('fatalJavaModal');
  const tabName = document.getElementById('tabFileName');
  const tabIcon = document.getElementById('tabFileIcon');
  const treeJava = document.getElementById('treeJavaFile');
  const treePy = document.getElementById('treePyFile');
  const btnNext = document.getElementById('btnNextFromScreen2');
  const modeIndicator = document.getElementById('ideModeIndicator');

  // Reset to clean initial state
  if (fatalModal) fatalModal.classList.remove('visible');
  if (ideWindow) ideWindow.classList.remove('screen-earthquake');
  if (javaOutput) {
    javaOutput.textContent = '';
    javaOutput.style.display = 'block';
  }
  if (pyCard) pyCard.style.display = 'none';
  if (pyOutput) pyOutput.innerHTML = '';
  if (tabName) tabName.textContent = 'ExamenFinal.java';
  if (tabIcon) {
    tabIcon.textContent = 'J';
    tabIcon.className = 'file-badge badge-java';
  }
  if (treeJava) treeJava.style.display = 'block';
  if (treePy) treePy.style.display = 'none';
  if (modeIndicator) {
    modeIndicator.textContent = "JAVA RUNTIME 21";
    modeIndicator.style.color = "var(--neon-blue)";
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.classList.remove('pulse-ready');
  }

  let charIdx = 0;
  const typeJavaInterval = safeInterval(() => {
    if (charIdx < javaCode.length) {
      if (javaOutput) javaOutput.textContent += javaCode.charAt(charIdx);
      if (charIdx % 3 === 0 && window.deckAudio) {
        window.deckAudio.playTypeClick();
      }
      charIdx++;
    } else {
      clearInterval(typeJavaInterval);

      // Breve pausa para contemplar el código Java antes del rechazo
      safeTimeout(() => {
        // b. Inmediatamente después: temblor, tinte rojo y modal gigante
        if (ideWindow) ideWindow.classList.add('screen-earthquake');
        if (fatalModal) fatalModal.classList.add('visible');
        if (window.deckAudio) window.deckAudio.playFatalJavaError();
        if (modeIndicator) {
          modeIndicator.textContent = "FATAL ERROR // JAVA REJECTED";
          modeIndicator.style.color = "var(--error-red)";
        }

        const dismissBar = document.getElementById('dismissProgress');
        if (dismissBar) {
          dismissBar.style.width = "0%";
          dismissBar.style.transition = "width 2.2s linear";
          setTimeout(() => { dismissBar.style.width = "100%"; }, 20);
        }

        // c. El modal desaparece, el código Java se borra solo, pestaña cambia a fundamentos.py
        safeTimeout(() => {
          if (ideWindow) ideWindow.classList.remove('screen-earthquake');
          if (fatalModal) fatalModal.classList.remove('visible');

          if (javaOutput) {
            javaOutput.textContent = '';
            javaOutput.style.display = 'none';
          }

          if (tabName) tabName.textContent = 'fundamentos.py';
          if (tabIcon) {
            tabIcon.textContent = 'PY';
            tabIcon.className = 'file-badge badge-py';
          }
          if (treeJava) treeJava.style.display = 'none';
          if (treePy) treePy.style.display = 'block';
          if (modeIndicator) {
            modeIndicator.textContent = "PYTHON 3.12 // SCRIPT AUTORIZADO";
            modeIndicator.style.color = "var(--neon-green)";
          }

          // d. Comienza a escribirse la Estrofa 1 línea por línea
          if (pyCard) pyCard.style.display = 'block';
          typeStanza1Sequentially(pyOutput, () => {
            if (btnNext) {
              btnNext.disabled = false;
              btnNext.classList.add('pulse-ready');
            }
          });

        }, 2400);

      }, 450);
    }
  }, 22);
}

function typeStanza1Sequentially(container, onComplete) {
  if (!container) return;
  const verses = CalaveritaApp.stanzas.stanza1;
  let verseIndex = 0;

  function typeNextVerse() {
    if (verseIndex >= verses.length) {
      if (onComplete) onComplete();
      return;
    }

    const verseText = verses[verseIndex];
    const lineRow = document.createElement('div');
    lineRow.className = 'py-verse-row';

    const lineNum = document.createElement('span');
    lineNum.className = 'verse-lineno';
    lineNum.textContent = `${verseIndex + 1}`;

    const textSpan = document.createElement('span');
    textSpan.className = 'verse-text-highlight';

    lineRow.appendChild(lineNum);
    lineRow.appendChild(textSpan);
    container.appendChild(lineRow);

    let charPos = 0;
    const verseInterval = safeInterval(() => {
      if (charPos < verseText.length) {
        textSpan.textContent += verseText.charAt(charPos);
        if (window.deckAudio) window.deckAudio.playTypeClick();
        charPos++;
      } else {
        clearInterval(verseInterval);
        verseIndex++;
        safeTimeout(typeNextVerse, 320);
      }
    }, 28);
  }

  typeNextVerse();
}

function skipScreen2Animation() {
  clearAllTimeouts();
  CalaveritaApp.state.screen2Animated = true;

  const javaOutput = document.getElementById('javaCodeOutput');
  const pyCard = document.getElementById('pythonCodeCard');
  const pyOutput = document.getElementById('pythonCodeOutput');
  const fatalModal = document.getElementById('fatalJavaModal');
  const ideWindow = document.getElementById('ideWindowFundamentos');
  const tabName = document.getElementById('tabFileName');
  const tabIcon = document.getElementById('tabFileIcon');
  const treeJava = document.getElementById('treeJavaFile');
  const treePy = document.getElementById('treePyFile');
  const btnNext = document.getElementById('btnNextFromScreen2');
  const modeIndicator = document.getElementById('ideModeIndicator');

  if (ideWindow) ideWindow.classList.remove('screen-earthquake');
  if (fatalModal) fatalModal.classList.remove('visible');
  if (javaOutput) { javaOutput.textContent = ''; javaOutput.style.display = 'none'; }
  if (tabName) tabName.textContent = 'fundamentos.py';
  if (tabIcon) {
    tabIcon.textContent = 'PY';
    tabIcon.className = 'file-badge badge-py';
  }
  if (treeJava) treeJava.style.display = 'none';
  if (treePy) treePy.style.display = 'block';
  if (modeIndicator) {
    modeIndicator.textContent = "PYTHON 3.12 // SCRIPT AUTORIZADO";
    modeIndicator.style.color = "var(--neon-green)";
  }

  if (pyCard) pyCard.style.display = 'block';
  if (pyOutput) {
    pyOutput.innerHTML = '';
    CalaveritaApp.stanzas.stanza1.forEach((verse, idx) => {
      const row = document.createElement('div');
      row.className = 'py-verse-row';
      row.innerHTML = `<span class="verse-lineno">${idx + 1}</span><span class="verse-text-highlight">${verse}</span>`;
      pyOutput.appendChild(row);
    });
  }

  if (btnNext) {
    btnNext.disabled = false;
    btnNext.classList.add('pulse-ready');
  }
}

/* ==========================================================================
   PANTALLA 3: PROGRAMACIÓN ORIENTADA A OBJETOS (POO)
   ========================================================================== */
function playScreen3Choreography() {
  clearAllTimeouts();
  CalaveritaApp.state.isSilenceActive = false;

  const overlay = document.getElementById('silenceOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.onclick = null;
  }
  document.body.classList.remove('silence-paused');

  const chatGptPill = document.getElementById('chatGptPill');
  const pooStatus = document.getElementById('pooStatusText');
  const btnNext = document.getElementById('btnNextFromScreen3');

  if (btnNext) {
    btnNext.style.display = 'none';
    btnNext.classList.remove('pulse-ready');
  }

  const vElements = [
    document.getElementById('pooVerse1'),
    document.getElementById('pooVerse2'),
    document.getElementById('pooVerse3'),
    document.getElementById('pooVerse4')
  ];

  if (chatGptPill) chatGptPill.style.display = 'flex';
  if (pooStatus) pooStatus.textContent = "ChatGPT generando explicación de POO para Don Jorge...";
  if (window.deckAudio) window.deckAudio.playChatGPTChime();

  vElements.forEach(el => { if (el) el.textContent = ''; });

  // Quick typing start (250ms delay) so information loads immediately
  safeTimeout(() => {
    typePooVerseLines(vElements, CalaveritaApp.stanzas.stanza2, 0, () => {
      CalaveritaApp.state.screen3Animated = true;
      // Micro-interacción OBLIGATORIA (El Silencio)
      triggerAwkwardSilence(btnNext);
    });
  }, 250);
}

function typePooVerseLines(elements, verses, index, onComplete) {
  if (index >= verses.length) {
    if (onComplete) onComplete();
    return;
  }

  const el = elements[index];
  const text = verses[index];
  let charIdx = 0;
  if (el) el.textContent = '';

  const interval = safeInterval(() => {
    if (charIdx < text.length) {
      if (el) el.textContent += text.charAt(charIdx);
      if (window.deckAudio) window.deckAudio.playTypeClick();
      charIdx++;
    } else {
      clearInterval(interval);
      safeTimeout(() => {
        typePooVerseLines(elements, verses, index + 1, onComplete);
      }, 300);
    }
  }, 28);
}

function triggerAwkwardSilence(nextButton) {
  const overlay = document.getElementById('silenceOverlay');
  const pooStatus = document.getElementById('pooStatusText');
  const countdownEl = document.getElementById('silenceCountdown');
  const timerFill = document.getElementById('silenceTimerFill');

  CalaveritaApp.state.isSilenceActive = true;
  if (overlay) {
    overlay.classList.add('active');
    overlay.onclick = () => endSilence();
  }
  document.body.classList.add('silence-paused');

  if (window.deckAudio) {
    window.deckAudio.playSilenceCrickets();
  }

  // Cuenta regresiva activa: 3 -> 2 -> 1
  let secondsLeft = 3;
  if (countdownEl) countdownEl.textContent = `Silencio en el aula · 3s`;
  if (timerFill) {
    timerFill.style.animation = 'none';
    void timerFill.offsetWidth; // Reflow para reiniciar la barra animada
    timerFill.style.animation = 'drain-silence 3s linear forwards';
  }

  const countdownInterval = safeInterval(() => {
    secondsLeft--;
    if (countdownEl) {
      if (secondsLeft > 0) {
        countdownEl.textContent = `Silencio en el aula · ${secondsLeft}s`;
      } else {
        countdownEl.textContent = `¡Reanudando clase!`;
      }
    }
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  announceScreenReader("Silencio en el salón de clases: 3 segundos sin interacción.");

  function endSilence() {
    if (!CalaveritaApp.state.isSilenceActive) return;
    clearInterval(countdownInterval);
    CalaveritaApp.state.isSilenceActive = false;
    if (overlay) {
      overlay.classList.remove('active');
      overlay.onclick = null;
    }
    document.body.classList.remove('silence-paused');

    if (pooStatus) pooStatus.textContent = "Silencio incómodo superado. El profesor retoma el control.";
    if (nextButton) {
      nextButton.style.display = 'inline-flex';
      nextButton.classList.add('pulse-ready');
    }

    if (window.deckAudio) window.deckAudio.playChatGPTChime();
    announceScreenReader("La luz regresa. Botón Continuar disponible.");
  }

  safeTimeout(endSilence, 3000);
}

function skipScreen3Animation() {
  clearAllTimeouts();
  CalaveritaApp.state.screen3Animated = true;
  CalaveritaApp.state.isSilenceActive = false;

  const overlay = document.getElementById('silenceOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('silence-paused');

  const chatGpt = document.getElementById('chatGptPill');
  const pooStatus = document.getElementById('pooStatusText');
  const btnNext = document.getElementById('btnNextFromScreen3');

  if (chatGpt) chatGpt.style.display = 'flex';
  if (pooStatus) pooStatus.textContent = "Estrofa 2 completada.";

  CalaveritaApp.stanzas.stanza2.forEach((v, idx) => {
    const el = document.getElementById(`pooVerse${idx + 1}`);
    if (el) el.textContent = v;
  });

  if (btnNext) {
    btnNext.style.display = 'inline-flex';
    btnNext.classList.add('pulse-ready');
  }
}

/* ==========================================================================
   PANTALLA 4: BASES DE DATOS (SQL y Hologramas 3D)
   ========================================================================== */
function playScreen4Choreography() {
  clearAllTimeouts();
  CalaveritaApp.state.screen4Animated = true;

  const cmdEl = document.getElementById('sqlCommandTyping');
  const queryStatus = document.getElementById('dbQueryStatus');
  const btnInject = document.getElementById('btnDbInject');
  const rowsCount = document.getElementById('holoRowsCount');
  const queryCommand = "SELECT * FROM purgatorio;";

  for (let i = 1; i <= 4; i++) {
    const row = document.getElementById(`holoRow${i}`);
    if (row) {
      row.classList.remove('revealed');
      const vtd = row.querySelector('.holo-verse');
      if (vtd) vtd.textContent = '';
    }
  }

  let charIdx = 0;
  if (cmdEl) cmdEl.textContent = '';
  if (queryStatus) queryStatus.textContent = 'ejecutando...';

  const sqlTypingInterval = safeInterval(() => {
    if (charIdx < queryCommand.length) {
      if (cmdEl) cmdEl.textContent += queryCommand.charAt(charIdx);
      if (window.deckAudio) window.deckAudio.playTypeClick();
      charIdx++;
    } else {
      clearInterval(sqlTypingInterval);

      safeTimeout(() => {
        if (queryStatus) queryStatus.textContent = 'OK (200)';
        if (btnInject) btnInject.disabled = false;
        if (rowsCount) rowsCount.textContent = '[4 REGISTROS RECUPERADOS]';

        if (window.dbCluster) {
          window.dbCluster.triggerClusterScan();
        }

        if (window.deckAudio) window.deckAudio.playHologramRise();

        revealHologramRowsSequentially();
      }, 500);
    }
  }, 40);
}

function revealHologramRowsSequentially() {
  const verses = CalaveritaApp.stanzas.stanza3;

  for (let i = 1; i <= 4; i++) {
    safeTimeout(() => {
      const row = document.getElementById(`holoRow${i}`);
      if (row) {
        row.classList.add('revealed');
        const vtd = row.querySelector('.holo-verse');
        if (vtd) vtd.textContent = verses[i - 1];

        if (window.deckAudio) window.deckAudio.playTypeClick();
      }
    }, i * 420);
  }
}

/* ==========================================================================
   Controles Adicionales de Diapositivas (Replay / Skip / Celebrate)
   ========================================================================== */
function initSlideControls() {
  // Replay & Skip Pantalla 2
  const btnReplay2 = document.getElementById('btnReplayScreen2');
  const btnSkip2 = document.getElementById('btnSkipScreen2');
  if (btnReplay2) {
    btnReplay2.addEventListener('click', () => {
      playScreen2Choreography();
      showToast("Repitiendo Fundamentos");
    });
  }
  if (btnSkip2) {
    btnSkip2.addEventListener('click', () => {
      skipScreen2Animation();
      showToast("Animación saltada: Python autorizado");
    });
  }

  // Replay & Skip Pantalla 3
  const btnReplay3 = document.getElementById('btnReplayScreen3');
  const btnSkip3 = document.getElementById('btnSkipScreen3');
  if (btnReplay3) {
    btnReplay3.addEventListener('click', () => {
      if (window.umlBoard) window.umlBoard.resetLayout();
      playScreen3Choreography();
      showToast("Repitiendo POO");
    });
  }
  if (btnSkip3) {
    btnSkip3.addEventListener('click', () => {
      skipScreen3Animation();
      showToast("Animación saltada: Estrofa 2 lista");
    });
  }

  // Controles Pantalla 4
  const btnDbReplay = document.getElementById('btnDbReplay');
  if (btnDbReplay) {
    btnDbReplay.addEventListener('click', () => {
      playScreen4Choreography();
      showToast("Re-ejecutando consulta SQL en el clúster");
    });
  }

  // Copiar Calaverita al portapapeles
  const btnCopy = document.getElementById('btnCopyPoem');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const fullText = `CALAVERITA LITERARIA\nDedicada al: Ing. Jorge Martínez Muñoz\nComunidad de Ciencias Computacionales\n\nESTROFA 1 (Fundamentos):\n${CalaveritaApp.stanzas.stanza1.join('\n')}\n\nESTROFA 2 (POO):\n${CalaveritaApp.stanzas.stanza2.join('\n')}\n\nESTROFA 3 (Bases de Datos):\n${CalaveritaApp.stanzas.stanza3.join('\n')}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
          showToast("Versos oficiales copiados al portapapeles");
        }).catch(() => {
          showToast("Versos listos para copiar");
        });
      }
    });
  }

  // Celebrar Rescate de la Muerte
  const btnCelebrate = document.getElementById('btnCelebrate');
  if (btnCelebrate) {
    btnCelebrate.addEventListener('click', () => {
      if (window.deckAudio) window.deckAudio.playSuccessChime();
      if (window.dbCluster) window.dbCluster.triggerCelebration();
      showToast("¡La Muerte ha sido rescatada con honores por Don Jorge!");
    });
  }
}

/* ==========================================================================
   Modales & Notificaciones Toast
   ========================================================================== */
function initModals() {
  const poemModal = document.getElementById('fullPoemModal');
  const openPoemBtn = document.getElementById('btnVerPoemaModal');
  const closePoemBtn = document.getElementById('closePoemModalBtn');
  const returnDeckBtn = document.getElementById('btnReturnToDeck');

  if (openPoemBtn && poemModal) {
    openPoemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      poemModal.classList.add('visible');
    });
  }
  if (closePoemBtn) closePoemBtn.addEventListener('click', () => poemModal.classList.remove('visible'));
  if (returnDeckBtn) returnDeckBtn.addEventListener('click', () => poemModal.classList.remove('visible'));
  if (poemModal) {
    poemModal.addEventListener('click', (e) => {
      if (e.target === poemModal) poemModal.classList.remove('visible');
    });
  }

  const helpModal = document.getElementById('helpModal');
  const openHelpBtn = document.getElementById('helpModalBtn');
  const closeHelpBtn = document.getElementById('closeHelpModalBtn');
  const btnCloseHelp = document.getElementById('btnCloseHelp');

  if (openHelpBtn && helpModal) {
    openHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helpModal.classList.add('visible');
    });
  }
  if (closeHelpBtn) closeHelpBtn.addEventListener('click', () => helpModal.classList.remove('visible'));
  if (btnCloseHelp) btnCloseHelp.addEventListener('click', () => helpModal.classList.remove('visible'));
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) helpModal.classList.remove('visible');
    });
  }
}

function closeAllModals() {
  document.querySelectorAll('.full-poem-modal').forEach(m => m.classList.remove('visible'));
}

function initAudioToggle() {
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', toggleAudio);
  }
}

function toggleAudio() {
  const soundIconUse = document.getElementById('soundIconUse');
  const soundLabel = document.getElementById('soundLabel');
  if (window.deckAudio) {
    const isEnabled = window.deckAudio.toggle();
    if (soundIconUse) soundIconUse.setAttribute('href', isEnabled ? '#i-sound-on' : '#i-sound-off');
    if (soundLabel) soundLabel.textContent = isEnabled ? 'Sonido' : 'Silencio';
    showToast(isEnabled ? 'Efectos de sonido activados' : 'Efectos de sonido silenciados');
  }
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function announceScreenReader(message) {
  const announcer = document.getElementById('screen-reader-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}

window.CalaveritaApp = CalaveritaApp;
window.playScreen4Choreography = playScreen4Choreography;
window.showToast = showToast;
