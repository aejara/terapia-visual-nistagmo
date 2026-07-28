// ============================================================================
// app.js - SUITE TERAPIA VISUAL v7.00 (Motor Clínico, Roles, IndexedDB)
// ============================================================================

// 1. GESTOR DE BASE DE DATOS NATIVA (IndexedDB)
const IDB = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('TerapiaVisualSuite', 1);
            req.onupgradeneeded = e => { e.target.result.createObjectStore('store'); };
            req.onsuccess = e => { this.db = e.target.result; resolve(); };
            req.onerror = e => reject(e);
        });
    },
    async get(key) {
        return new Promise(resolve => {
            const tx = this.db.transaction('store', 'readonly');
            const req = tx.objectStore('store').get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    },
    async set(key, val) {
        return new Promise(resolve => {
            const tx = this.db.transaction('store', 'readwrite');
            tx.objectStore('store').put(val, key);
            tx.oncomplete = () => resolve();
        });
    }
};

// ESTADO GLOBAL EN MEMORIA
window.patients = [];
window.routines = {};
window.historyLog = [];
window.clinicCfg = {};
window.activePatientId = null;
window.currentRole = 'patient'; 
window.chartXAxisType = 'index'; 
window.activeStatsTab = 'search'; 

// DICCIONARIO CLÍNICO DE JUEGOS
const gameDictionary = {
    'search': { icon: '🔠', title: 'Búsqueda Táctil', desc: 'Mejora la fijación excéntrica y foveación.', info: 'En pacientes con nistagmo, obliga al sistema visual a localizar un objetivo estático entre distractores, ayudando a estabilizar y aumentar el tiempo de foveación prolongada.' },
    'coord': { icon: '🗺️', title: 'Coordenadas', desc: 'Discriminación de cuadrantes espacial.', info: 'Desarrolla la integración visomotora y la localización espacial periférica, una habilidad frecuentemente alterada en ambliopías estrábicas.' },
    'pursuit': { icon: '🏃', title: 'Seguimiento', desc: 'Rastreo de objetivo en cuadrícula.', info: 'Trabaja los movimientos oculares de seguimiento suave (smooth pursuits). En nistagmo, entrenar el seguimiento ayuda a reducir la amplitud y latencia de la sacada de refijación.' },
    'anticrowding': { icon: '🎯', title: 'Anti-Crowding', desc: 'Agudeza contra amontonamiento.', info: 'El fenómeno de amontonamiento (crowding) es característico de la ambliopía. Disminuir progresivamente el espaciado entre flanqueadores estimula la agudeza visual resolutiva central.' },
    'saccadic': { icon: '⚡', title: 'Saltos Sacádicos', desc: 'Reflejo periférico ultrarrápido.', info: 'Los saltos sacádicos entrenan la rapidez, precisión y reducción de latencia en la refijación foveal de un punto a otro del espacio.' },
    'marsden': { icon: '🎾', title: 'Pelota de Marsden', desc: 'Seguimiento dinámico pendular.', info: 'Fomenta la coordinación ojo-mano y el seguimiento en un entorno dinámico continuo. Excelente para estabilizar la binocularidad en el espacio libre.' },
    'tracing': { icon: '🔀', title: 'Visual Tracing', desc: 'Rastreo de laberintos entrelazados.', info: 'Mejora la estabilidad de la mirada y el control oculomotor pasivo, forzando al paciente a discriminar trayectorias continuas sin apoyo motor (sin usar el dedo).' },
    'tachisto': { icon: '📸', title: 'Taquistoscopio', desc: 'Memoria visual flash (250ms).', info: 'Potencia la memoria visual a corto plazo y la velocidad de procesamiento. Al usar estímulos relámpago, evita que el paciente con nistagmo tenga tiempo de realizar movimientos oscilatorios lentos.' },
    'gabor': { icon: '🦓', title: 'Parches de Gabor', desc: 'Sensibilidad al contraste direccional.', info: 'La sensibilidad al contraste está disminuida en pacientes con ambliopía. Los parches de Gabor estimulan directamente y con alta especificidad las neuronas de la corteza visual primaria (V1).' },
    'trombone': { icon: '🎺', title: 'Acomodación', desc: 'Flexibilidad ciliar en eje Z.', info: 'Entrenamiento de acomodación dinámica (rock acomodativo). Mejora la flexibilidad del cristalino y la capacidad de mantener la nitidez durante acercamientos y alejamientos bruscos.' }
};

// 2. BOOTSTRAP Y MIGRACIÓN
async function bootApp() {
    await IDB.init();
    let dbPatients = await IDB.get('patients');
    
    if (!dbPatients && localStorage.getItem('nystagmus_patients')) {
        console.log("Migrando de localStorage a IndexedDB...");
        window.patients = JSON.parse(localStorage.getItem('nystagmus_patients') || '[]');
        window.routines = JSON.parse(localStorage.getItem('nystagmus_routines') || '{}');
        window.historyLog = JSON.parse(localStorage.getItem('nystagmus_history') || '[]');
        window.clinicCfg = JSON.parse(localStorage.getItem('nystagmus_clinic_cfg') || '{}');
        window.activePatientId = localStorage.getItem('nystagmus_active_patient_id') || window.patients[0].id;
        await saveAllToIDB();
    } else {
        window.patients = dbPatients || [{id:"p_default", name:"Paciente General", dob:"", notes:""}];
        window.routines = await IDB.get('routines') || {};
        window.historyLog = await IDB.get('history') || [];
        window.clinicCfg = await IDB.get('clinicCfg') || {};
        window.activePatientId = await IDB.get('activePatientId') || window.patients[0].id;
    }
    renderUI();
}

async function saveAllToIDB() {
    await IDB.set('patients', window.patients);
    await IDB.set('routines', window.routines);
    await IDB.set('history', window.historyLog);
    await IDB.set('clinicCfg', window.clinicCfg);
    await IDB.set('activePatientId', window.activePatientId);
}

// 3. GESTIÓN DE ROLES E INTERFAZ
window.switchRole = function(role) {
    window.currentRole = role;
    document.getElementById('tab-role-patient').classList.toggle('active', role === 'patient');
    document.getElementById('tab-role-admin').classList.toggle('active', role === 'admin');
    
    document.getElementById('patient-area').style.display = role === 'patient' ? 'flex' : 'none';
    document.getElementById('admin-area').style.display = role === 'admin' ? 'flex' : 'none';
    
    if (role === 'patient') renderPatientArea();
    else renderAdminDashboard();
}

function renderUI() {
    const sel = document.getElementById('global-patient-select'); 
    sel.innerHTML = '';
    
    if(!window.patients.find(p => p.id === window.activePatientId)) {
        window.activePatientId = window.patients[0].id;
        IDB.set('activePatientId', window.activePatientId);
    }
    
    window.patients.forEach(p => sel.appendChild(new Option(p.name, p.id)));
    sel.value = window.activePatientId;
    
    sel.addEventListener('change', async e => { 
        window.activePatientId = e.target.value; 
        await IDB.set('activePatientId', window.activePatientId); 
        updatePatientCardDisplay();
        if(window.currentRole === 'patient') renderPatientArea();
        else renderAdminDashboard();
    });
    
    updatePatientCardDisplay();

    // Configuración Clínica
    document.getElementById('cfg-clinic').value = window.clinicCfg.clinicName || '';
    document.getElementById('cfg-specialist').value = window.clinicCfg.specialistName || '';
    document.getElementById('cfg-col').value = window.clinicCfg.colNum || '';
    if (window.clinicCfg.logoBase64) {
        document.getElementById('cfg-logo-preview').src = window.clinicCfg.logoBase64;
        document.getElementById('cfg-logo-preview').style.display = 'block';
        document.getElementById('clear-logo-btn').style.display = 'inline-block';
    }

    if(typeof initMonitorSize === 'function') {
        document.getElementById('game-inches').value = initMonitorSize();
        updateDistanceCalibration();
    }
    
    switchRole(window.currentRole);
}

function calculateStreak() {
    const ph = window.historyLog.filter(x => x.patientId === window.activePatientId);
    if(ph.length === 0) return 0;

    const datesStr = [...new Set(ph.map(h => h.date.split(',')[0].trim()))];
    const datesObj = datesStr.map(d => {
        const parts = d.split('/');
        return new Date(parts[2], parts[1]-1, parts[0]).setHours(0,0,0,0);
    }).sort((a,b) => b - a);

    let streak = 0;
    let today = new Date().setHours(0,0,0,0);
    let yesterday = new Date(today - 86400000).setHours(0,0,0,0);

    if(datesObj[0] !== today && datesObj[0] !== yesterday) return 0;

    let checkDate = datesObj[0]; 
    streak = 1;

    for(let i = 1; i < datesObj.length; i++) {
        let prevDay = new Date(checkDate - 86400000).setHours(0,0,0,0);
        if(datesObj[i] === prevDay) { streak++; checkDate = prevDay; } 
        else break;
    }
    return streak;
}

function updatePatientCardDisplay() {
    const activeP = window.patients.find(p => p.id === window.activePatientId) || window.patients[0];
    const dobText = activeP.dob ? ` | Nac: ${activeP.dob}` : '';
    document.getElementById('patient-info-display').innerHTML = `<strong>${activeP.name}</strong>${dobText}<br><em style="color:#64748b;">${activeP.notes || 'Sin notas adicionales.'}</em>`;
    document.getElementById('patient-welcome-name').textContent = activeP.name.split(' ')[0];
    
    // Gamificación: Actualizar Racha en ambos badges
    const streak = calculateStreak();
    document.querySelectorAll('.streak-badge').forEach(badge => {
        badge.textContent = `🔥 Racha: ${streak} día${streak !== 1 ? 's' : ''}`;
        if (streak > 0) { badge.style.backgroundColor = '#fef08a'; badge.style.color = '#b45309'; badge.style.borderColor = '#eab308'; }
        else { badge.style.backgroundColor = '#f1f5f9'; badge.style.color = '#64748b'; badge.style.borderColor = '#cbd5e1'; }
    });
}

// ==================== INFO MODAL ====================
window.showGameInfo = function(gameId) {
    const info = gameDictionary[gameId];
    document.getElementById('info-modal-icon').textContent = info.icon;
    document.getElementById('info-modal-title').textContent = info.title;
    document.getElementById('info-modal-body').innerHTML = `<strong>Propósito:</strong> ${info.desc}<br><br><strong>Relevancia Clínica:</strong> ${info.info}`;
    document.getElementById('game-info-modal').classList.add('active');
}

// ==================== ÁREA DEL PACIENTE ====================
window.renderPatientArea = function() {
    const container = document.getElementById('horizontal-games-list');
    container.innerHTML = '';
    
    const patHistory = window.historyLog.filter(x => x.patientId === window.activePatientId);

    // Estado de la Rutina Superior
    const rt = window.routines[window.activePatientId] || []; 
    if(rt.length === 0) { 
        document.getElementById('routine-status-patient').textContent = "Hoy tienes entrenamiento libre."; 
        document.getElementById('btn-launch-routine').style.display = 'none'; 
    } else {
        document.getElementById('btn-launch-routine').style.display = 'inline-block';
        let tr = 0, tc = 0; 
        rt.forEach((t) => { tr += t.req; tc += Math.min(t.done, t.req); });
        document.getElementById('routine-status-patient').innerHTML = `Has completado <strong style="color:var(--primary);">${tc} de ${tr}</strong> ejercicios asignados.`;
    }

    // Inyección de Tarjetas Horizontales
    Object.keys(gameDictionary).forEach(gameId => {
        const game = gameDictionary[gameId];
        const h = patHistory.filter(x => x.mode === gameId);
        const bestMs = h.length > 0 ? Math.min(...h.map(s => s.timeMs)) : null;
        const bestStr = bestMs ? h.find(s => s.timeMs === bestMs).timeFormatted : '--:--';
        
        container.innerHTML += `
            <div class="exercise-card-horizontal">
                <div class="exercise-card-left" style="cursor:pointer;" onclick="openGame('${gameId}')">
                    <div class="exercise-card-icon">${game.icon}</div>
                    <div class="exercise-card-info">
                        <div class="exercise-card-title">${game.title}</div>
                        <div class="exercise-card-desc">${game.desc}</div>
                    </div>
                </div>
                <div class="exercise-card-right">
                    <div class="exercise-stats">
                        Partidas: <strong style="color:#0f172a">${h.length}</strong><br>
                        Mejor T.: <strong style="color:var(--primary)">${bestStr}</strong>
                    </div>
                    <div class="exercise-actions">
                        <button class="btn btn-secondary" onclick="showGameInfo('${gameId}')" title="Ver Info Clínica">ℹ️ Info</button>
                        <button class="btn" onclick="openGame('${gameId}')">Jugar ▶</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ==================== ÁREA DE ADMINISTRACIÓN ====================
window.renderAdminDashboard = function() {
    const rt = window.routines[window.activePatientId] || []; 
    const rl = document.getElementById('routine-list-admin'); 
    rl.innerHTML = '';
    
    if(rt.length === 0) { 
        rl.innerHTML = "<div style='color:#64748b; font-size:0.9rem;'>No hay ninguna pauta asignada. Usa el generador o añade manual.</div>";
    } else {
        let tr = 0, tc = 0; 
        rt.forEach((t, i) => {
            tr += t.req; tc += Math.min(t.done, t.req);
            rl.innerHTML += `
                <div class="task-item ${t.done >= t.req ? 'completed' : ''}" style="background:white; border:1px solid #cbd5e1; padding:0.5rem; border-radius:6px; margin-bottom:0.4rem; display:flex; justify-content:space-between; font-size:0.9rem;">
                    <div><strong>#${i+1} ${gameDictionary[t.mode].title}</strong> (${t.eye})</div>
                    <div><strong>${t.done}/${t.req}</strong> series ${t.done >= t.req ? '✅' : ''}</div>
                </div>`;
        });
    }
    renderHistory(false);
};

// ==================== AUTO-GENERADOR INTELIGENTE DE PAUTAS ====================
document.getElementById('btn-auto-gen').addEventListener('click', async () => {
    const mins = parseInt(document.getElementById('auto-time').value) || 15;
    const focus = document.getElementById('auto-focus').value; 
    
    const totalRounds = Math.max(1, Math.round(mins / 2)); 
    let newRoutine = [];

    const monoculares = ['anticrowding', 'saccadic', 'gabor', 'tachisto'];
    const binoculares = ['tracing', 'marsden', 'search', 'pursuit', 'trombone'];

    let monocRounds = focus !== 'BIN' ? Math.ceil(totalRounds * 0.6) : 0;
    let binocRounds = totalRounds - monocRounds;

    for(let i=0; i<monocRounds; i++) {
        let ex = monoculares[Math.floor(Math.random() * monoculares.length)];
        newRoutine.push({ mode: ex, eye: focus, lines: 'No', req: 1, done: 0 });
    }
    for(let i=0; i<binocRounds; i++) {
        let ex = binoculares[Math.floor(Math.random() * binoculares.length)];
        newRoutine.push({ mode: ex, eye: 'BIN', lines: 'No', req: 1, done: 0 });
    }

    let collapsedRoutine = [];
    newRoutine.forEach(r => {
        let existing = collapsedRoutine.find(x => x.mode === r.mode && x.eye === r.eye);
        if(existing) existing.req += 1; else collapsedRoutine.push(r);
    });

    window.routines[window.activePatientId] = collapsedRoutine;
    await IDB.set('routines', window.routines);
    window.renderAdminDashboard();
    alert(`¡Pauta de ${mins} minutos generada con éxito!`);
});

document.getElementById('btn-add-routine').onclick = async () => {
    let r = window.routines[window.activePatientId] || []; 
    r.push({
        mode: document.getElementById('rout-add-mode').value, eye: document.getElementById('rout-add-eye').value, 
        lines: document.getElementById('rout-add-lines').value, req: parseInt(document.getElementById('rout-add-req').value), done: 0
    });
    window.routines[window.activePatientId] = r; 
    await IDB.set('routines', window.routines); 
    window.renderAdminDashboard();
};

document.getElementById('btn-clear-routine').onclick = async () => { 
    window.routines[window.activePatientId] = []; 
    await IDB.set('routines', window.routines); 
    window.renderAdminDashboard(); 
};

window.updateRoutineProgress = async function() {
    let r = window.routines[window.activePatientId] || []; 
    let updated = false;
    for(let t of r) {
        if(t.done < t.req && t.mode === window.currentGame && t.eye === document.getElementById('game-eye').value) { 
            t.done++; updated = true; break; 
        }
    }
    if(updated) { 
        window.routines[window.activePatientId] = r; 
        await IDB.set('routines', window.routines); 
    }
};

// ==================== ANALÍTICA GLOBAL ====================
function formatDuration(ms) {
    const s = Math.floor(ms/1000);
    return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

window.switchStatsTab = function(mode, event) {
    window.activeStatsTab = mode;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    renderHistory(false);
}

function renderHistory(printAll = false) {
    const h = window.historyLog.filter(x => x.patientId === window.activePatientId);
    let filteredHistory = printAll ? h : h.filter(x => x.mode === window.activeStatsTab);
    
    const tbody = document.getElementById('history-tbody');
    document.getElementById('metric-total-sessions').textContent = filteredHistory.length;
    const totalMs = filteredHistory.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
    document.getElementById('metric-total-time').textContent = formatDuration(totalMs);

    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Sin datos acumulados.</td></tr>';
        document.getElementById('metric-best-time').textContent = '--:--'; document.getElementById('metric-avg-accuracy').textContent = '--%';
        renderChart([], document.getElementById('evolution-chart')); return;
    }

    const sumAccuracy = filteredHistory.reduce((acc, curr) => acc + (curr.accuracy !== undefined ? curr.accuracy : 100), 0);
    document.getElementById('metric-avg-accuracy').textContent = `${Math.round(sumAccuracy / filteredHistory.length)}%`;

    const bestMs = Math.min(...filteredHistory.map(s => s.timeMs));
    const bestSession = filteredHistory.find(s => s.timeMs === bestMs);
    document.getElementById('metric-best-time').textContent = bestSession ? bestSession.timeFormatted : '--:--';

    tbody.innerHTML = [...filteredHistory].reverse().map((s) => `<tr><td>${s.date}</td><td>${s.eye}</td><td><strong>${s.timeFormatted}</strong></td><td>${s.accuracy}% (${s.errors} err)</td></tr>`).join('');
    renderChart(filteredHistory, document.getElementById('evolution-chart'));
}

function renderChart(data, targetSvg) {
    if(!targetSvg) return;
    targetSvg.innerHTML = '';
    if (!data || data.length === 0) return;

    const width = targetSvg.clientWidth || 700; const height = targetSvg.clientHeight || 200; const padding = 35;
    const maxTime = Math.max(...data.map(d => d.timeMs / 1000)); const minTime = Math.min(...data.map(d => d.timeMs / 1000));

    const points = data.map((d, idx) => {
        let x = (window.chartXAxisType === 'index') 
            ? (data.length === 1 ? width / 2 : padding + (idx / (data.length - 1)) * (width - 2 * padding))
            : ((data[data.length-1].id === data[0].id) ? width/2 : padding + ((d.id - data[0].id) / (data[data.length-1].id - data[0].id)) * (width - 2 * padding));
        const ySecs = d.timeMs / 1000; const range = (maxTime - minTime) || 1;
        const y = height - padding - ((ySecs - minTime) / range) * (height - 2 * padding);
        return { x, y, eye: d.eye || 'BIN' };
    });

    for(let i = 0; i <= 3; i++) {
        const yVal = padding + i * (height - 2 * padding) / 3;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding); line.setAttribute("x2", width - padding);
        line.setAttribute("y1", yVal); line.setAttribute("y2", yVal); line.setAttribute("stroke", "#e2e8f0"); line.setAttribute("stroke-dasharray", "4"); targetSvg.appendChild(line);
    }

    if (points.length > 1) {
        const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD); path.setAttribute("fill", "none"); path.setAttribute("stroke", "#3b82f6"); path.setAttribute("stroke-width", "3"); targetSvg.appendChild(path);
    }
    points.forEach(p => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", "5"); circle.setAttribute("fill", p.eye === 'OD' ? '#ef4444' : (p.eye === 'OI' ? '#3b82f6' : '#10b981')); targetSvg.appendChild(circle);
    });
}

document.getElementById('chart-axis-btn').addEventListener('click', () => {
    window.chartXAxisType = window.chartXAxisType === 'index' ? 'date' : 'index';
    document.getElementById('chart-axis-btn').textContent = window.chartXAxisType === 'index' ? '🔢 Eje X: Por Pruebas' : '📅 Eje X: Por Fecha';
    renderHistory(false);
});

// ==================== PACIENTES CREATE / DELETE ====================
document.getElementById('create-pat-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-pat-name').value.trim();
    if (!name) { alert('Introduzca un nombre para el paciente.'); return; }
    const newP = { id: 'p_' + Date.now(), name: name, dob: document.getElementById('new-pat-dob').value, notes: document.getElementById('new-pat-notes').value.trim() };
    window.patients.push(newP);
    window.activePatientId = newP.id;
    await saveAllToIDB();
    document.getElementById('new-pat-name').value = ''; document.getElementById('new-pat-dob').value = ''; document.getElementById('new-pat-notes').value = '';
    renderUI(); alert(`Paciente añadido al sistema.`);
});
document.getElementById('delete-pat-btn').addEventListener('click', async () => {
    if(window.patients.length <= 1) { alert("Debe haber al menos un paciente en el sistema."); return; }
    if(confirm('¿Desea ELIMINAR COMPLETAMENTE a este paciente y su historial? Acción irreversible.')) {
        window.patients = window.patients.filter(p => p.id !== window.activePatientId);
        window.historyLog = window.historyLog.filter(h => h.patientId !== window.activePatientId);
        delete window.routines[window.activePatientId];
        window.activePatientId = window.patients[0].id;
        await saveAllToIDB(); renderUI(); alert("Paciente eliminado.");
    }
});

// ==================== IMPRESIÓN, EXPORTACIÓN Y MEMBRETE ====================
document.getElementById('btn-print-pdf').addEventListener('click', () => {
    document.getElementById('print-clinic').textContent = window.clinicCfg.clinicName || 'Centro Clínico';
    document.getElementById('print-specialist').textContent = window.clinicCfg.specialistName || 'Especialista';
    document.getElementById('print-col').textContent = window.clinicCfg.colNum ? "Nº Col: " + window.clinicCfg.colNum : '';
    document.getElementById('print-date').textContent = "Fecha Emisión: " + new Date().toLocaleDateString('es-ES');
    if(window.clinicCfg.logoBase64) { document.getElementById('print-logo').src = window.clinicCfg.logoBase64; document.getElementById('print-logo').style.display = 'block'; }
    
    const printContainer = document.getElementById('print-report-container'); printContainer.innerHTML = ''; 
    const patHistory = window.historyLog.filter(x => x.patientId === window.activePatientId);
    
    let hasData = false;
    Object.keys(gameDictionary).forEach(modeId => {
        const modeData = patHistory.filter(h => h.mode === modeId);
        if(modeData.length === 0) return;
        hasData = true;

        const avgAcc = Math.round(modeData.reduce((acc, curr) => acc + (curr.accuracy || 100), 0) / modeData.length);
        const totalMs = modeData.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
        const bestMs = Math.min(...modeData.map(s => s.timeMs));
        const bestS = modeData.find(s => s.timeMs === bestMs);

        const section = document.createElement('div'); section.className = 'print-section';
        section.innerHTML = `
            <h3 style="border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px;">${gameDictionary[modeId].title}</h3>
            <div style="display:flex; gap: 10px; margin-bottom: 10px; font-size: 10pt;">
                <div class="metric-card" style="flex:1;"><strong>Sesiones:</strong> ${modeData.length}</div>
                <div class="metric-card" style="flex:1;"><strong>Tiempo Total:</strong> ${formatDuration(totalMs)}</div>
                <div class="metric-card" style="flex:1;"><strong>Mejor:</strong> ${bestS ? bestS.timeFormatted : '--:--'}</div>
                <div class="metric-card" style="flex:1; color:#16a34a;"><strong>Precisión:</strong> ${avgAcc}%</div>
            </div>
            <div class="chart-container" style="height: 150px; margin-bottom: 10px; border: 1px solid #94a3b8; padding: 4px;"><svg id="print-svg-${modeId}" width="100%" height="100%" style="overflow: visible;"></svg></div>
            <table class="history-table" style="font-size: 8pt;">
                <thead><tr><th>Fecha</th><th>Ojo</th><th>Tiempo</th><th>Precisión</th></tr></thead>
                <tbody>${[...modeData].reverse().map(s => `<tr><td>${s.date}</td><td><strong>${s.eye}</strong></td><td><strong>${s.timeFormatted}</strong></td><td>${s.accuracy}% (${s.errors} err)</td></tr>`).join('')}</tbody>
            </table>`;
        printContainer.appendChild(section);
        renderChart(modeData, document.getElementById(`print-svg-${modeId}`));
    });

    if(!hasData) printContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">No hay datos registrados para este paciente.</p>';
    document.body.classList.remove('print-grid-only'); document.body.classList.add('print-report-only');
    setTimeout(() => { window.print(); document.body.classList.remove('print-report-only'); }, 300);
});

document.getElementById('btn-export-json').addEventListener('click', () => {
    const bundle = { version: "7.00", clinic: window.clinicCfg, patients: window.patients, routines: window.routines, history: window.historyLog, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_terapia_visual_${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const d = JSON.parse(event.target.result);
            if (d.patients && d.history) {
                window.patients = d.patients; window.historyLog = d.history; window.routines = d.routines || {}; window.clinicCfg = d.clinic || {};
                await saveAllToIDB(); alert('¡Base de datos restaurada!'); location.reload();
            } else alert('Formato de backup no válido.');
        } catch (err) { alert('Error al procesar el archivo JSON.'); }
    }; reader.readAsText(file);
});

document.getElementById('btn-delete-hist').addEventListener('click', async () => {
    if (confirm('¿Desea borrar TODO el historial de pruebas (de todos los juegos) de este paciente?')) {
        window.historyLog = window.historyLog.filter(s => s.patientId !== window.activePatientId);
        await IDB.set('history', window.historyLog);
        renderHistory(false); updatePatientCardDisplay(); if(window.currentRole==='patient') window.renderPatientArea();
    }
});

document.addEventListener('DOMContentLoaded', bootApp);