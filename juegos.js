// ============================================================================
// juegos.js - SUITE TERAPIA VISUAL (Motor Gráfico, 8 Juegos Independientes)
// ============================================================================

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const confusionMatrix = {
    'A': ['V','X','Y','R'], 'B': ['P','R','E','D'], 'C': ['O','G','Q','D'], 'D': ['O','B','C','Q'],
    'E': ['F','B','P','L'], 'F': ['E','P','T','R'], 'G': ['C','O','Q','D'], 'H': ['N','M','K','R']
};

window.currentGame = null; 
let isPlaying = false;
let isPausedByOverlay = false;
let isTimerActive = true; 

let timeMs = 0, sessionErrors = 0, foundTargets = 0, reqTargets = 10;
let targetValue = ''; 
let currentSuggestedDistanceCm = 75;

let gameTimerInt = null, customInt1 = null, flashcardTimeout = null;

const viewDash = document.getElementById('view-dashboard');
const viewGame = document.getElementById('game-view-container');
const canvasArea = document.getElementById('game-canvas-area');
const virtualKeypad = document.getElementById('virtual-keypad');
let selectedKeypadIndex = 0;

// NAVEGACIÓN Y CONFIGURACIÓN HARDWARE
window.initMonitorSize = function() {
    const saved = localStorage.getItem('nystagmus_monitor_size');
    const ua = navigator.userAgent || '';
    if (/Kindle|Silk|Book/.test(ua)) {
        document.getElementById('game-contrast').checked = true;
        document.body.classList.add('high-contrast');
    }
    if (saved) return parseFloat(saved);
    const maxD = Math.max(window.screen.width, window.screen.height);
    if (/Kindle/.test(ua)) return 10.2;
    if (/iPad/.test(ua)) return maxD >= 1366 ? 12.9 : 10.9;
    return maxD >= 2500 ? 34 : 24;
}

window.updateDistanceCalibration = function() {
    const inches = parseFloat(document.getElementById('game-inches').value) || 34;
    const ppi = Math.hypot(window.screen.width, window.screen.height) / inches;
    const fontMm = ((window.innerHeight * 0.04) / ppi) * 25.4; 
    currentSuggestedDistanceCm = Math.max(40, Math.round(fontMm * 8));
    
    const infoEl = document.getElementById('game-distance-info');
    if(infoEl) {
        infoEl.innerHTML = `Tamaño letra: ~${fontMm.toFixed(1)} mm. <strong style="color:#2563eb; margin-left:0.5rem;">Distancia: ~${currentSuggestedDistanceCm} cm</strong>`;
    }
}

document.getElementById('game-inches').addEventListener('input', e => { 
    localStorage.setItem('nystagmus_monitor_size', e.target.value); 
    updateDistanceCalibration(); 
});

document.getElementById('save-calib-btn').addEventListener('click', () => {
    const cardWidthPx = parseInt(document.getElementById('calib-slider').value);
    const ppi = cardWidthPx / 3.3700787; 
    const calculatedInches = Math.hypot(window.screen.width, window.screen.height) / ppi;
    const roundedInches = Math.round(calculatedInches * 10) / 10;
    
    document.getElementById('game-inches').value = roundedInches;
    localStorage.setItem('nystagmus_monitor_size', roundedInches);
    updateDistanceCalibration();
    document.getElementById('card-calib-modal').classList.remove('active');
    alert(`Pantalla calibrada. Diagonal ajustada a ${roundedInches}"`);
});

document.getElementById('calib-slider').addEventListener('input', (e) => {
    const w = parseInt(e.target.value);
    const h = Math.round(w * (53.98 / 85.6));
    const box = document.getElementById('calib-card-box');
    box.style.width = w + 'px';
    box.style.height = h + 'px';
});

// ROUTER 
window.openGame = function(gameId) {
    viewDash.classList.remove('active'); 
    viewGame.style.display = 'flex';
    window.currentGame = gameId; 
    canvasArea.innerHTML = ''; 
    virtualKeypad.style.display = 'none';
    document.getElementById('btn-game-start').textContent = "Iniciar Ejercicio";
    
    // Toggles exclusivos de las versiones de Cuadrícula (Ahora comprobando los 3 modos sueltos)
    if (['search', 'coord', 'pursuit'].includes(gameId)) {
        document.getElementById('grid-lines-box').style.display = 'flex';
        document.getElementById('btn-print-grid').style.display = 'inline-block';
        canvasArea.innerHTML = `<div class="grid-wrapper"><div id="grid-container" class="mode-${gameId}"></div></div>`;
        reqTargets = (gameId === 'search') ? 0 : (gameId === 'coord' ? 10 : 15);
        drawGrid();
    } else {
        document.getElementById('grid-lines-box').style.display = 'none';
        document.getElementById('btn-print-grid').style.display = 'none';
    }

    if (gameId === 'anticrowding') {
        canvasArea.innerHTML = `<div class="game-area" id="ac-wrapper"><div id="ac-display" style="font-size:120px; letter-spacing:30px;">A <span class="ac-target">B</span> C</div></div>`;
        reqTargets = 10;
    }
    if (gameId === 'saccadic') {
        canvasArea.innerHTML = `<div class="game-area" id="sac-area"><div id="saccadic-target"></div></div>`;
        reqTargets = 15;
    }
    if (gameId === 'marsden') {
        canvasArea.innerHTML = `<div class="game-area" id="mars-area" style="align-items:flex-start;"><div id="marsden-pendulum"><div class="marsden-string"></div><div id="marsden-ball">A</div></div></div>`;
        reqTargets = 10;
    }
    if (gameId === 'tracing') {
        canvasArea.innerHTML = `<div class="game-area" style="position:relative;"><canvas id="tracing-canvas"></canvas></div>`;
        reqTargets = 5;
    }
    if (gameId === 'tachisto') {
        canvasArea.innerHTML = `<div class="game-area" style="position:relative;"><div id="tach-fixation">+</div><div id="tach-display">123</div><div id="tach-input-area"><input type="text" id="tach-input" style="font-size:2rem; width:150px; text-align:center;" maxlength="5" onkeydown="handleTachInput(event)"></div></div>`;
        reqTargets = 10;
    }
    
    resetScoreboard();
}

window.closeGame = function() { 
    stopGame(); 
    viewGame.style.display = 'none'; 
    viewDash.classList.add('active'); 
    window.renderDashboard(); 
}

// MOTOR CENTRAL Y SÍNTESIS DE VOZ
function speakText(text) {
    const audioToggle = document.getElementById('game-audio');
    if (!audioToggle || !audioToggle.checked) return;
    try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; 
        utterance.rate = 0.9; 
        window.speechSynthesis.speak(utterance);
    } catch(e) {}
}

function resetScoreboard() {
    timeMs = 0; sessionErrors = 0; foundTargets = 0;
    document.getElementById('game-timer').textContent = "00:00.0";
    document.getElementById('game-score').textContent = "0";
    document.getElementById('game-total').textContent = reqTargets;
    document.getElementById('game-errors').textContent = "0";
    document.getElementById('game-target').textContent = "-";
}

document.getElementById('btn-game-start').addEventListener('click', () => {
    if (isPlaying) stopGame(); else startGame();
});

function startGame() {
    isPlaying = true; 
    isTimerActive = true; 
    resetScoreboard();
    document.getElementById('btn-game-start').textContent = "Detener Ejercicio"; 
    document.getElementById('btn-game-start').style.background = "#ef4444";
    
    gameTimerInt = setInterval(() => {
        if(isPausedByOverlay || !isTimerActive) return; 
        timeMs += 100;
        let m = Math.floor(timeMs/60000).toString().padStart(2,'0');
        let s = Math.floor((timeMs%60000)/1000).toString().padStart(2,'0');
        let d = Math.floor((timeMs%1000)/100);
        document.getElementById('game-timer').textContent = `${m}:${s}.${d}`;
    }, 100);

    if (['search', 'coord', 'pursuit'].includes(window.currentGame)) startGrid();
    if (window.currentGame === 'anticrowding') startAntiCrowding();
    if (window.currentGame === 'saccadic') startSaccadic();
    if (window.currentGame === 'marsden') startMarsden();
    if (window.currentGame === 'tracing') startTracing();
    if (window.currentGame === 'tachisto') startTachisto();
}

function stopGame() {
    isPlaying = false; 
    isTimerActive = false;
    clearInterval(gameTimerInt); clearInterval(customInt1); 
    document.getElementById('btn-game-start').textContent = "Iniciar Ejercicio"; 
    document.getElementById('btn-game-start').style.background = "var(--primary)";
    virtualKeypad.style.display = 'none';
    
    const pend = document.getElementById('marsden-pendulum');
    if (pend) pend.style.animation = 'none';
}

function endGame() {
    stopGame();
    speakText("¡Sesión completada!"); 
    
    const acc = (foundTargets + sessionErrors) > 0 ? Math.round((foundTargets / (foundTargets + sessionErrors)) * 100) : 100;
    
    const logNames = {
        'search': 'Búsqueda Táctil', 'coord': 'Coordenadas', 'pursuit': 'Seguimiento',
        'anticrowding': 'Anti-Crowding', 'saccadic': 'Sacádicos', 'marsden': 'Pelota Marsden',
        'tracing': 'Laberintos', 'tachisto': 'Taquistoscopio'
    };
    
    let linesInfo = "N/A";
    if (['search', 'coord', 'pursuit'].includes(window.currentGame)) {
        linesInfo = document.getElementById('game-lines-toggle').checked ? 'Sí' : 'No';
    }

    const log = { 
        id: Date.now(), patientId: window.activePatientId, date: new Date().toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'}), 
        mode: window.currentGame, modeName: logNames[window.currentGame] || window.currentGame, eye: document.getElementById('game-eye').value, 
        timeMs: timeMs, timeFormatted: document.getElementById('game-timer').textContent, accuracy: acc, errors: sessionErrors,
        lines: linesInfo, screenInches: parseFloat(document.getElementById('game-inches').value) || 34
    };
    
    window.historyLog.push(log); 
    localStorage.setItem('nystagmus_history', JSON.stringify(window.historyLog));
    window.updateRoutineProgress();
    
    document.getElementById('res-time').textContent = log.timeFormatted; 
    document.getElementById('res-errors').textContent = sessionErrors; 
    document.getElementById('res-accuracy').textContent = acc + "%";
    document.getElementById('result-overlay').classList.add('active');
}

function triggerError(element) {
    sessionErrors++; document.getElementById('game-errors').textContent = sessionErrors;
    if (element) { 
        element.classList.remove('error', 'wrong'); 
        void element.offsetWidth; 
        element.classList.add(['search', 'coord', 'pursuit'].includes(window.currentGame) ? 'wrong' : 'error'); 
    }
}

function registerHit() {
    foundTargets++; document.getElementById('game-score').textContent = foundTargets;
    if (foundTargets >= reqTargets) endGame();
}

// INTERFAZ: TOGGLES Y FLASHCARDS CON AUDIO
document.getElementById('game-contrast').addEventListener('change', (e) => {
    if(e.target.checked) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
});

document.getElementById('game-lines-toggle').addEventListener('change', (e) => {
    const cont = document.getElementById('grid-container');
    if(!cont) return;
    if(e.target.checked) cont.classList.remove('hide-lines');
    else cont.classList.add('hide-lines');
    updateLayoutAndGridSize();
});

let overlayCallback = null;

function showFlash(htmlText, spokenText, callback) {
    isPausedByOverlay = true;
    document.getElementById('flashcard-main').innerHTML = htmlText; 
    document.getElementById('flashcard-dist-val').textContent = currentSuggestedDistanceCm;
    document.getElementById('flashcard-overlay').classList.add('active');
    overlayCallback = callback;
    
    speakText(spokenText);

    clearTimeout(flashcardTimeout);
    flashcardTimeout = setTimeout(() => { if(document.getElementById('flashcard-overlay').classList.contains('active')) hideFlash(); }, 2500);
}

function hideFlash() { 
    document.getElementById('flashcard-overlay').classList.remove('active'); 
    isPausedByOverlay = false; 
    if (overlayCallback) { let temp = overlayCallback; overlayCallback = null; temp(); } 
}
document.getElementById('flashcard-overlay').addEventListener('click', hideFlash);
document.getElementById('result-overlay').addEventListener('click', () => { document.getElementById('result-overlay').classList.remove('active'); });

// TECLADO VIRTUAL Y NAVEGACIÓN UNIVERSAL
function renderKeypadCustom(options, correct) {
    virtualKeypad.innerHTML = ''; 
    selectedKeypadIndex = 0; 
    
    options.forEach((c, i) => {
        let b = document.createElement('button'); 
        b.className = 'keypad-btn' + (i === 0 ? ' focused' : ''); 
        b.textContent = c;
        b.onclick = (e) => { e.preventDefault(); handleKey(c); }; 
        virtualKeypad.appendChild(b);
    });
    virtualKeypad.style.gridTemplateColumns = `repeat(${options.length}, 1fr)`;
    virtualKeypad.style.display = 'grid';
}

function renderKeypad(correct) {
    let opts = confusionMatrix[correct] ? [...confusionMatrix[correct]] : [];
    opts.push(correct); 
    while(opts.length < 4) { 
        let r = alphabet[Math.floor(Math.random()*26)]; 
        if(!opts.includes(r)) opts.push(r); 
    }
    opts.sort(() => Math.random() - 0.5);
    renderKeypadCustom(opts, correct);
}

function updateKeypadFocus() {
    const btns = virtualKeypad.querySelectorAll('.keypad-btn');
    btns.forEach((btn, idx) => {
        if (idx === selectedKeypadIndex) btn.classList.add('focused');
        else btn.classList.remove('focused');
    });
}

function handleKey(char) {
    if (!isPlaying || isPausedByOverlay) return;
    
    if (['search', 'coord', 'pursuit'].includes(window.currentGame)) {
        if (window.currentGame === 'search') return; 
        if (char === targetValue) {
            let c = document.querySelector('.pursuit-active'); 
            if(c) { c.classList.remove('pursuit-active'); c.classList.add('found'); setTimeout(() => c.classList.remove('found'), 400); }
            registerHit(); 
            if (isPlaying) { 
                if (window.currentGame === 'coord') pickNewCoordinate();
                else { clearInterval(customInt1); gridNextPursuit(); customInt1 = setInterval(gridNextPursuit, 3000); }
            }
        } else { triggerError(document.querySelector('.pursuit-active')); }
    } 
    else if (window.currentGame === 'anticrowding') {
        if (char === targetValue) {
            document.getElementById('ac-wrapper').classList.add('success'); 
            setTimeout(() => document.getElementById('ac-wrapper').classList.remove('success'), 200);
            
            acLevel.font = Math.max(30, acLevel.font * 0.85); 
            acLevel.space = Math.max(0, acLevel.space - 4); 
            if (foundTargets === 4) acLevel.fl = 2; 
            
            registerHit();
            if (isPlaying) nextACRound();
        } else { triggerError(document.getElementById('ac-wrapper')); }
    }
    else if (window.currentGame === 'tracing') {
        if (char === targetValue) {
            registerHit();
            if (isPlaying) nextTracing(); 
        } else { triggerError(null); }
    }
}

document.addEventListener('keydown', e => {
    if (document.getElementById('flashcard-overlay').classList.contains('active')) { hideFlash(); return; }
    if (document.getElementById('result-overlay').classList.contains('active')) { document.getElementById('result-overlay').classList.remove('active'); return; }
    if (!isPlaying || isPausedByOverlay) return;

    if (e.key === ' ' && window.currentGame === 'marsden') { e.preventDefault(); checkMarsden(); return; }

    const buttons = virtualKeypad.querySelectorAll('.keypad-btn');
    if (buttons.length > 0 && virtualKeypad.style.display !== 'none') {
        if (e.key === 'ArrowLeft') { 
            e.preventDefault(); 
            selectedKeypadIndex = (selectedKeypadIndex - 1 + buttons.length) % buttons.length; 
            updateKeypadFocus(); 
            return; 
        }
        if (e.key === 'ArrowRight') { 
            e.preventDefault(); 
            selectedKeypadIndex = (selectedKeypadIndex + 1) % buttons.length; 
            updateKeypadFocus(); 
            return; 
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') { 
            e.preventDefault(); 
            handleKey(buttons[selectedKeypadIndex].textContent); 
            return; 
        }
    }

    if (/^[a-zA-ZñÑ]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
    }
});

// ==========================================
// MÓDULO 1: CUADRÍCULA ESPACIAL
// ==========================================
let gridTR = 0, gridTC = 0;

function updateLayoutAndGridSize() {
    const cont = document.getElementById('grid-container');
    if (!cont) return;
    const maxW = Math.min(window.innerWidth * 0.90, 600);
    const maxH = Math.min(window.innerHeight * 0.58, 600);
    const squareSize = Math.floor(Math.min(maxW, maxH));
    cont.style.width = squareSize + 'px'; 
    cont.style.height = squareSize + 'px';

    setTimeout(() => {
        const cell = document.querySelector('.cell');
        if (cell && cell.clientHeight > 0) {
            const fontPx = Math.round(cell.clientHeight * 0.65);
            document.querySelectorAll('.cell').forEach(c => c.style.fontSize = fontPx + 'px');
        }
        const label = document.querySelector('.label-cell');
        if (label && label.clientHeight > 0) {
            const lFontPx = Math.round(label.clientHeight * 0.45);
            document.querySelectorAll('.label-cell').forEach(l => l.style.fontSize = lFontPx + 'px');
        }
    }, 50);
}

window.addEventListener('resize', () => { 
    updateDistanceCalibration(); 
    if(['search', 'coord', 'pursuit'].includes(window.currentGame)) updateLayoutAndGridSize(); 
});

function drawGrid() {
    const cont = document.getElementById('grid-container'); 
    if(!cont) return;
    cont.innerHTML = ''; cont.className = `mode-${window.currentGame}`;
    if(!document.getElementById('game-lines-toggle').checked) cont.classList.add('hide-lines');

    cont.appendChild(document.createElement('div')); 
    for(let i=1; i<=10; i++) { let d = document.createElement('div'); d.className = 'label-cell'; d.textContent = i; cont.appendChild(d); }
    for(let r=1; r<=10; r++) {
        let h = document.createElement('div'); h.className = 'label-cell'; h.textContent = r; cont.appendChild(h);
        for(let c=1; c<=10; c++) {
            let d = document.createElement('div'); d.className = 'cell'; d.dataset.r = r; d.dataset.c = c;
            d.textContent = alphabet[Math.floor(Math.random()*26)];
            if(window.currentGame === 'search') {
                d.style.cursor = 'pointer';
                d.addEventListener('click', () => {
                    if (!isPlaying || isPausedByOverlay || window.currentGame !== 'search') return;
                    if (d.textContent === targetValue) {
                        if(!d.classList.contains('found')){ d.classList.add('found'); registerHit(); }
                    } else { triggerError(d); }
                });
            }
            cont.appendChild(d);
        }
    }
    updateLayoutAndGridSize();
}

function startGrid() {
    isTimerActive = true;
    if (window.currentGame === 'search') {
        reqTargets = 0; targetValue = alphabet[Math.floor(Math.random() * 26)];
        document.querySelectorAll('.cell').forEach(c => { 
            if (Math.random() < 0.15) { c.textContent = targetValue; reqTargets++; } 
            else { while(c.textContent === targetValue) c.textContent = alphabet[Math.floor(Math.random()*26)]; } 
        });
        document.getElementById('game-total').textContent = reqTargets;
        showFlash(`Busca: <span style="color:#e11d48">${targetValue}</span>`, `Busca la letra ${targetValue}`, () => { document.getElementById('game-target').textContent = targetValue; });
    } else if (window.currentGame === 'coord') {
        pickNewCoordinate();
    } else if (window.currentGame === 'pursuit') {
        showFlash(`Sigue la celda <span style="color:#3b82f6">AZUL</span>`, `Sigue la celda azul`, () => { 
            document.getElementById('game-target').textContent = "Celdas AZULES"; gridNextPursuit(); customInt1 = setInterval(gridNextPursuit, 3000); 
        });
    }
}

function pickNewCoordinate() {
    gridTR = Math.floor(Math.random()*10)+1; gridTC = Math.floor(Math.random()*10)+1;
    showFlash(`Fila ${gridTR}<br>Columna ${gridTC}`, `Fila ${gridTR}, Columna ${gridTC}`, () => {
        document.getElementById('game-target').textContent = `F${gridTR}, C${gridTC}`;
        targetValue = document.querySelector(`.cell[data-r="${gridTR}"][data-c="${gridTC}"]`).textContent;
        renderKeypad(targetValue);
    });
}

function gridNextPursuit() {
    if(isPausedByOverlay) return;
    let old = document.querySelector('.pursuit-active'); if(old) old.classList.remove('pursuit-active');
    
    if(gridTR === 0) { gridTR = 5; gridTC = 5; } 
    else { gridTR += (Math.floor(Math.random()*3)-1); gridTC += (Math.floor(Math.random()*3)-1); }
    if(gridTR < 1) gridTR = 2; if(gridTR > 10) gridTR = 9; if(gridTC < 1) gridTC = 2; if(gridTC > 10) gridTC = 9;
    
    let n = document.querySelector(`.cell[data-r="${gridTR}"][data-c="${gridTC}"]`);
    if(n) { n.classList.add('pursuit-active'); targetValue = n.textContent; renderKeypad(targetValue); }
}

// ==========================================
// MÓDULO 2: ANTI-CROWDING
// ==========================================
let acLevel = { font:120, space:30, fl:1 };

function startAntiCrowding() {
    isTimerActive = true;
    acLevel = { font:120, space:30, fl:1 };
    showFlash(`Identifica la central`, `Identifica la letra central`, () => { nextACRound(); });
}

function nextACRound() {
    targetValue = alphabet[Math.floor(Math.random()*26)];
    let html = ''; 
    for(let i=0; i<acLevel.fl; i++) { 
        html = `<span class="ac-flanker">${alphabet[Math.floor(Math.random()*26)]}</span> ` + html + ` <span class="ac-flanker">${alphabet[Math.floor(Math.random()*26)]}</span>`; 
    }
    let p = html.split(' '); p.splice(Math.floor(p.length/2), 0, `<span class="ac-target">${targetValue}</span>`);
    const d = document.getElementById('ac-display');
    d.style.fontSize = acLevel.font + 'px'; d.style.letterSpacing = acLevel.space + 'px'; d.innerHTML = p.join('');
    renderKeypad(targetValue);
}

// ==========================================
// MÓDULO 3: SALTOS SACÁDICOS
// ==========================================
function startSaccadic() {
    isTimerActive = false; 
    document.getElementById('game-target').textContent = "Atrapar Diana";
    showFlash(`Pulsa la diana roja rápidamente`, `Pulsa la diana roja rápidamente`, () => { nextSaccadic(); });
}

function nextSaccadic() {
    isTimerActive = true; 
    const t = document.getElementById('saccadic-target');
    if(!t) return;
    t.style.display = 'block';
    t.style.top = Math.floor(Math.random()*80 + 10) + '%'; t.style.left = Math.floor(Math.random()*80 + 10) + '%';
    t.onclick = () => { 
        isTimerActive = false; 
        t.style.display = 'none'; 
        registerHit(); 
        if(isPlaying) setTimeout(nextSaccadic, Math.random()*1000 + 200); 
    };
}

// ==========================================
// MÓDULO 4: PELOTA DE MARSDEN
// ==========================================
function startMarsden() {
    isTimerActive = false; 
    targetValue = 'A'; document.getElementById('game-target').textContent = `Pulsar la letra A`;
    document.getElementById('marsden-pendulum').style.animation = 'swing 2.5s infinite ease-in-out alternate';
    
    showFlash(`Pulsa SÓLO al ver la letra <span style="color:#e11d48">A</span>`, `Pulsa solo al ver la letra A`, () => {
        customInt1 = setInterval(() => {
            let char = Math.random() < 0.3 ? 'A' : alphabet[Math.floor(Math.random()*26)];
            document.getElementById('marsden-ball').textContent = char;
            isTimerActive = (char === 'A');
        }, 1500);
    });
    document.getElementById('mars-area').onclick = () => checkMarsden();
}

function checkMarsden() {
    if(isPausedByOverlay || !isPlaying) return;
    if(document.getElementById('marsden-ball').textContent === 'A') {
        isTimerActive = false; 
        document.getElementById('mars-area').style.background = '#dcfce7'; 
        setTimeout(() => document.getElementById('mars-area').style.background = '#ffffff', 200);
        document.getElementById('marsden-ball').textContent = '-';
        registerHit(); 
    } else { triggerError(document.getElementById('mars-area')); }
}

// ==========================================
// MÓDULO 5: VISUAL TRACING (LABERINTOS)
// ==========================================
function startTracing() {
    isTimerActive = true;
    document.getElementById('game-target').textContent = "Laberinto Visual";
    showFlash(`Sigue la línea que te indicaremos`, `Sigue la línea que te indicaremos`, () => { nextTracing(); });
}

function nextTracing() {
    const cvs = document.getElementById('tracing-canvas'); 
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.parentElement.clientWidth; const h = cvs.parentElement.clientHeight;
    cvs.width = w; cvs.height = h; ctx.clearRect(0,0,w,h);
    
    document.querySelectorAll('.tracing-label').forEach(e => e.remove());
    
    const startX = [w*0.2, w*0.5, w*0.8]; 
    const endX = [...startX].sort(() => Math.random() - 0.5); 
    
    const cols = ['#3b82f6', '#ef4444', '#10b981']; 
    const colNames = ['AZUL', 'ROJA', 'VERDE'];
    
    const labels = ['A', 'B', 'C'].sort(() => Math.random() - 0.5);
    const targetLineIdx = Math.floor(Math.random() * 3);
    targetValue = labels[endX.indexOf(endX[targetLineIdx])]; 

    for(let i=0; i<3; i++) {
        ctx.beginPath(); ctx.moveTo(startX[i], 40); 
        const cp1X = startX[i] + (Math.random() * 200 - 100);
        const cp2X = endX[i] + (Math.random() * 200 - 100);
        ctx.bezierCurveTo(cp1X, h/3, cp2X, h*(2/3), endX[i], h-40);
        ctx.strokeStyle = cols[i]; ctx.lineWidth = 6; ctx.stroke();
        
        let ls = document.createElement('div'); ls.className = 'tracing-label'; ls.style.left = (startX[i]-15) + 'px'; ls.style.top = '10px'; ls.textContent = i+1;
        let le = document.createElement('div'); le.className = 'tracing-label'; le.style.left = (endX[i]-15) + 'px'; le.style.top = (h-45) + 'px'; le.textContent = labels[i];
        cvs.parentElement.appendChild(ls); cvs.parentElement.appendChild(le);
    }
    
    showFlash(`Sigue la línea <span style="color:${cols[targetLineIdx]}">${colNames[targetLineIdx]}</span>`, `Sigue la línea ${colNames[targetLineIdx]}`, () => {
        document.getElementById('game-target').innerHTML = `<span style="color:${cols[targetLineIdx]}">Línea ${colNames[targetLineIdx]}</span>`;
        renderKeypadCustom(['A', 'B', 'C'].sort(), targetValue);
    });
}

// ==========================================
// MÓDULO 6: TAQUISTOSCOPIO
// ==========================================
let tachVal = "";

function startTachisto() { 
    isTimerActive = false; 
    document.getElementById('game-target').textContent = "Memorizar Flash"; 
    showFlash("Fija la vista en la cruz", "Fija la vista en la cruz", () => { setTimeout(nextTachisto, 1000); }); 
}

function nextTachisto() {
    isTimerActive = false; 
    document.getElementById('tach-input-area').style.display = 'none'; 
    document.getElementById('tach-input').value = '';
    document.getElementById('tach-fixation').style.display = 'block';
    
    setTimeout(() => {
        tachVal = Math.floor(100 + Math.random()*900).toString();
        document.getElementById('tach-fixation').style.display = 'none';
        document.getElementById('tach-display').textContent = tachVal;
        document.getElementById('tach-display').style.display = 'block';
        setTimeout(() => {
            document.getElementById('tach-display').style.display = 'none';
            document.getElementById('tach-input-area').style.display = 'flex';
            document.getElementById('tach-input').focus();
            isTimerActive = true; 
        }, 250); 
    }, 1500);
}

window.checkTach = function() {
    if(!isPlaying) return;
    isTimerActive = false; 
    if(document.getElementById('tach-input').value.trim() === tachVal) { 
        registerHit(); 
        if(isPlaying) nextTachisto(); 
    } else { 
        triggerError(null); 
        document.getElementById('tach-input').value = ''; 
        if(isPlaying) nextTachisto(); 
    }
}

window.handleTachInput = function(e) {
    if(e.key === 'Backspace' || e.key === 'Delete') return;
    if(/^[0-9]$/.test(e.key)) return;
    
    e.preventDefault();
    window.checkTach();
}