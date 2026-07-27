// ============================================================================
// app.js - SUITE TERAPIA VISUAL v6.00 (Motor Clínico, IndexedDB, Gamificación)
// ============================================================================

// 1. GESTOR DE BASE DE DATOS NATIVA (IndexedDB)
const IDB = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('TerapiaVisualSuite', 1);
            req.onupgradeneeded = e => {
                e.target.result.createObjectStore('store');
            };
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

// ESTADO GLOBAL EN MEMORIA (Sincronizado con IDB)
window.patients = [];
window.routines = {};
window.historyLog = [];
window.clinicCfg = {};
window.activePatientId = null;

window.chartXAxisType = 'index'; 
window.activeStatsTab = 'search'; 

// 2. MIGRACIÓN E INICIALIZACIÓN ASÍNCRONA
async function bootApp() {
    await IDB.init();

    // Intentar cargar de IndexedDB
    let dbPatients = await IDB.get('patients');
    
    // MIGRACIÓN AUTOMÁTICA (Si IndexedDB está vacío pero hay datos antiguos en localStorage)
    if (!dbPatients && localStorage.getItem('nystagmus_patients')) {
        console.log("Migrando datos de localStorage a IndexedDB...");
        window.patients = JSON.parse(localStorage.getItem('nystagmus_patients') || '[]');
        window.routines = JSON.parse(localStorage.getItem('nystagmus_routines') || '{}');
        window.historyLog = JSON.parse(localStorage.getItem('nystagmus_history') || '[]');
        window.clinicCfg = JSON.parse(localStorage.getItem('nystagmus_clinic_cfg') || '{}');
        window.activePatientId = localStorage.getItem('nystagmus_active_patient_id') || window.patients[0].id;
        
        await saveAllToIDB();
    } else {
        // Carga normal desde IndexedDB
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

// 3. RENDERIZADO DE LA INTERFAZ PRINCIPAL
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
        window.renderDashboard(); 
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
    
    window.renderDashboard();
}

// 4. GAMIFICACIÓN: CÁLCULO DE RACHAS (STREAKS)
function calculateStreak() {
    const ph = window.historyLog.filter(x => x.patientId === window.activePatientId);
    if(ph.length === 0) return 0;

    // Extraer solo la fecha (DD/MM/YYYY) y obtener valores únicos
    const datesStr = [...new Set(ph.map(h => h.date.split(',')[0].trim()))];
    
    // Convertir a timestamps para ordenar (formato ES: DD/MM/YYYY)
    const datesObj = datesStr.map(d => {
        const parts = d.split('/');
        return new Date(parts[2], parts[1]-1, parts[0]).setHours(0,0,0,0);
    }).sort((a,b) => b - a);

    let streak = 0;
    let today = new Date().setHours(0,0,0,0);
    let yesterday = new Date(today - 86400000).setHours(0,0,0,0);

    // Si el último entreno no fue hoy ni ayer, racha perdida.
    if(datesObj[0] !== today && datesObj[0] !== yesterday) return 0;

    let checkDate = datesObj[0]; // Empezamos a contar desde el último día jugado
    streak = 1;

    for(let i = 1; i < datesObj.length; i++) {
        let prevDay = new Date(checkDate - 86400000).setHours(0,0,0,0);
        if(datesObj[i] === prevDay) {
            streak++;
            checkDate = prevDay;
        } else break;
    }
    return streak;
}

function updatePatientCardDisplay() {
    const activeP = window.patients.find(p => p.id === window.activePatientId) || window.patients[0];
    const dobText = activeP.dob ? ` | Nac: ${activeP.dob}` : '';
    document.getElementById('patient-info-display').innerHTML = `<strong>${activeP.name}</strong>${dobText}<br><em style="color:#64748b;">${activeP.notes || 'Sin notas adicionales.'}</em>`;
    
    // Gamificación: Actualizar Racha
    const streak = calculateStreak();
    const badge = document.getElementById('patient-streak');
    badge.textContent = `🔥 Racha: ${streak} día${streak !== 1 ? 's' : ''}`;
    if (streak > 0) { badge.style.backgroundColor = '#fef08a'; badge.style.color = '#b45309'; badge.style.borderColor = '#eab308'; }
    else { badge.style.backgroundColor = '#f1f5f9'; badge.style.color = '#64748b'; badge.style.borderColor = '#cbd5e1'; }
}

// ==================== EVENTOS DEL MENÚ DE PACIENTES ====================
document.getElementById('create-pat-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-pat-name').value.trim();
    if (!name) { alert('Introduzca un nombre para el paciente.'); return; }
    
    const newP = { id: 'p_' + Date.now(), name: name, dob: document.getElementById('new-pat-dob').value, notes: document.getElementById('new-pat-notes').value.trim() };
    window.patients.push(newP);
    
    window.activePatientId = newP.id;
    await saveAllToIDB();
    
    document.getElementById('new-pat-name').value = '';
    document.getElementById('new-pat-dob').value = '';
    document.getElementById('new-pat-notes').value = '';
    
    renderUI();
    alert(`Paciente añadido al sistema.`);
});

document.getElementById('delete-pat-btn').addEventListener('click', async () => {
    if(window.patients.length <= 1) { alert("Debe haber al menos un paciente en el sistema."); return; }
    if(confirm('¿Desea ELIMINAR COMPLETAMENTE a este paciente y su historial? Acción irreversible.')) {
        window.patients = window.patients.filter(p => p.id !== window.activePatientId);
        window.historyLog = window.historyLog.filter(h => h.patientId !== window.activePatientId);
        delete window.routines[window.activePatientId];
        
        window.activePatientId = window.patients[0].id;
        await saveAllToIDB();
        renderUI();
        alert("Paciente eliminado.");
    }
});

// ==================== AUTO-GENERADOR INTELIGENTE DE PAUTAS ====================
document.getElementById('btn-auto-gen').addEventListener('click', async () => {
    const mins = parseInt(document.getElementById('auto-time').value) || 15;
    const focus = document.getElementById('auto-focus').value; // BIN, OD, OI
    
    // Estimación: 1 ronda de ejercicio (10 repeticiones) tarda ~2 minutos de tiempo real.
    const totalRounds = Math.max(1, Math.round(mins / 2)); 
    let newRoutine = [];

    // Catálogo terapéutico
    const monoculares = ['anticrowding', 'saccadic', 'gabor', 'tachisto'];
    const binoculares = ['tracing', 'marsden', 'search', 'pursuit', 'trombone'];

    let monocRounds = focus !== 'BIN' ? Math.ceil(totalRounds * 0.6) : 0;
    let binocRounds = totalRounds - monocRounds;

    // Repartir Monoculares
    for(let i=0; i<monocRounds; i++) {
        let ex = monoculares[Math.floor(Math.random() * monoculares.length)];
        newRoutine.push({ mode: ex, eye: focus, lines: 'No', req: 1, done: 0 });
    }
    // Repartir Binoculares
    for(let i=0; i<binocRounds; i++) {
        let ex = binoculares[Math.floor(Math.random() * binoculares.length)];
        newRoutine.push({ mode: ex, eye: 'BIN', lines: 'No', req: 1, done: 0 });
    }

    // Agrupar ejercicios repetidos
    let collapsedRoutine = [];
    newRoutine.forEach(r => {
        let existing = collapsedRoutine.find(x => x.mode === r.mode && x.eye === r.eye);
        if(existing) existing.req += 1;
        else collapsedRoutine.push(r);
    });

    window.routines[window.activePatientId] = collapsedRoutine;
    await IDB.set('routines', window.routines);
    window.renderDashboard();
});

// GESTIÓN MANUAL DE PAUTAS
document.getElementById('btn-add-routine').onclick = async () => {
    let r = window.routines[window.activePatientId] || []; 
    r.push({
        mode: document.getElementById('rout-add-mode').value, eye: document.getElementById('rout-add-eye').value, 
        lines: document.getElementById('rout-add-lines').value, req: parseInt(document.getElementById('rout-add-req').value), done: 0
    });
    window.routines[window.activePatientId] = r; 
    await IDB.set('routines', window.routines); 
    window.renderDashboard();
};

document.getElementById('btn-clear-routine').onclick = async () => { 
    window.routines[window.activePatientId] = []; 
    await IDB.set('routines', window.routines); 
    window.renderDashboard(); 
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

window.renderDashboard = function() {
    const rt = window.routines[window.activePatientId] || []; 
    const rl = document.getElementById('routine-list'); 
    rl.innerHTML = '';
    
    if(rt.length === 0) { 
        document.getElementById('routine-status').textContent = "Sin pauta activa"; 
        document.getElementById('btn-launch-routine').style.display = 'none'; 
    } else {
        document.getElementById('btn-launch-routine').style.display = 'inline-block';
        let tr = 0, tc = 0; 
        const names = {
            search: 'Búsqueda Táctil', coord: 'Coordenadas', pursuit: 'Seguimiento', anticrowding: 'Anti-Crowding', 
            saccadic: 'Sacádicos', marsden: 'Pelota Marsden', tracing: 'Laberintos', tachisto: 'Taquistoscopio',
            gabor: 'Parches de Gabor', trombone: 'Acomodación Dinámica'
        };
        
        rt.forEach((t, i) => {
            tr += t.req; tc += Math.min(t.done, t.req);
            rl.innerHTML += `
                <div class="task-item ${t.done >= t.req ? 'completed' : ''}">
                    <div><strong>#${i+1} ${names[t.mode]}</strong> (${t.eye})</div>
                    <div><strong>${t.done}/${t.req}</strong> series ${t.done >= t.req ? '✅' : ''}</div>
                </div>`;
        });
        document.getElementById('routine-status').textContent = `Completado: ${tc} de ${tr} ejercicios.`;
    }
    renderHistory();
};

document.getElementById('btn-launch-routine').addEventListener('click', () => {
    let r = window.routines[window.activePatientId] || []; 
    let next = r.find(t => t.done < t.req);
    if(!next) { alert("¡Pauta clínica completada por hoy!"); return; }
    
    window.openGame(next.mode);
    if(['search', 'coord', 'pursuit'].includes(next.mode)) { document.getElementById('game-lines-toggle').checked = (next.lines === 'Sí'); }
    document.getElementById('game-eye').value = next.eye; 
    setTimeout(startGame, 500); 
});

function formatDuration(ms) {
    const s = Math.floor(ms/1000);
    return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

window.switchStatsTab = function(mode, event) {
    window.activeStatsTab = mode;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    renderHistory();
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
        document.getElementById('metric-best-time').textContent = '--:--';
        document.getElementById('metric-avg-accuracy').textContent = '--%';
        renderChart([], document.getElementById('evolution-chart'));
        return;
    }

    const sumAccuracy = filteredHistory.reduce((acc, curr) => acc + (curr.accuracy !== undefined ? curr.accuracy : 100), 0);
    document.getElementById('metric-avg-accuracy').textContent = `${Math.round(sumAccuracy / filteredHistory.length)}%`;

    const bestMs = Math.min(...filteredHistory.map(s => s.timeMs));
    const bestSession = filteredHistory.find(s => s.timeMs === bestMs);
    document.getElementById('metric-best-time').textContent = bestSession ? bestSession.timeFormatted : '--:--';

    tbody.innerHTML = [...filteredHistory].reverse().map((s) => `<tr><td>${s.date}</td><td>${s.modeName || s.mode}</td><td><strong>${s.eye}</strong></td><td><strong>${s.timeFormatted}</strong></td><td>${s.accuracy}% (${s.errors} err)</td></tr>`).join('');
    renderChart(filteredHistory, document.getElementById('evolution-chart'));
}

function renderChart(data, targetSvg) {
    targetSvg.innerHTML = '';
    if (!data || data.length === 0) return;

    const width = targetSvg.clientWidth || 700;
    const height = targetSvg.clientHeight || 200;
    const padding = 35;
    const maxTime = Math.max(...data.map(d => d.timeMs / 1000));
    const minTime = Math.min(...data.map(d => d.timeMs / 1000));

    const points = data.map((d, idx) => {
        let x = (window.chartXAxisType === 'index') 
            ? (data.length === 1 ? width / 2 : padding + (idx / (data.length - 1)) * (width - 2 * padding))
            : ((data[data.length-1].id === data[0].id) ? width/2 : padding + ((d.id - data[0].id) / (data[data.length-1].id - data[0].id)) * (width - 2 * padding));
        
        const ySecs = d.timeMs / 1000;
        const range = (maxTime - minTime) || 1;
        const y = height - padding - ((ySecs - minTime) / range) * (height - 2 * padding);
        return { x, y, eye: d.eye || 'BIN' };
    });

    for(let i = 0; i <= 3; i++) {
        const yVal = padding + i * (height - 2 * padding) / 3;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding); line.setAttribute("x2", width - padding);
        line.setAttribute("y1", yVal); line.setAttribute("y2", yVal);
        line.setAttribute("stroke", "#e2e8f0"); line.setAttribute("stroke-dasharray", "4");
        targetSvg.appendChild(line);
    }

    if (points.length > 1) {
        const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD); path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#3b82f6"); path.setAttribute("stroke-width", "3");
        targetSvg.appendChild(path);
    }

    points.forEach(p => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", "5");
        circle.setAttribute("fill", p.eye === 'OD' ? '#ef4444' : (p.eye === 'OI' ? '#3b82f6' : '#10b981'));
        targetSvg.appendChild(circle);
    });
}

document.getElementById('chart-axis-btn').addEventListener('click', () => {
    window.chartXAxisType = window.chartXAxisType === 'index' ? 'date' : 'index';
    document.getElementById('chart-axis-btn').textContent = window.chartXAxisType === 'index' ? '🔢 Eje X: Por Pruebas' : '📅 Eje X: Por Fecha';
    renderHistory();
});

// IMPRESIÓN, EXPORTACIÓN Y MEMBRETE
document.getElementById('cfg-logo-input').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        window.clinicCfg.logoBase64 = event.target.result;
        document.getElementById('cfg-logo-preview').src = window.clinicCfg.logoBase64;
        document.getElementById('cfg-logo-preview').style.display = 'block';
        document.getElementById('clear-logo-btn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
});
document.getElementById('clear-logo-btn').addEventListener('click', () => { window.clinicCfg.logoBase64 = ''; document.getElementById('cfg-logo-input').value = ''; document.getElementById('cfg-logo-preview').style.display = 'none'; document.getElementById('clear-logo-btn').style.display = 'none'; });
document.getElementById('save-clinic-btn').addEventListener('click', async () => {
    window.clinicCfg.clinicName = document.getElementById('cfg-clinic').value.trim();
    window.clinicCfg.specialistName = document.getElementById('cfg-specialist').value.trim();
    window.clinicCfg.colNum = document.getElementById('cfg-col').value.trim();
    await IDB.set('clinicCfg', window.clinicCfg);
    alert('¡Configuración de clínica guardada!');
});

document.getElementById('btn-print-pdf').addEventListener('click', () => {
    document.getElementById('print-clinic').textContent = window.clinicCfg.clinicName || 'Centro Clínico';
    document.getElementById('print-specialist').textContent = window.clinicCfg.specialistName || 'Especialista';
    document.getElementById('print-col').textContent = window.clinicCfg.colNum ? "Nº Col: " + window.clinicCfg.colNum : '';
    document.getElementById('print-date').textContent = "Fecha Emisión: " + new Date().toLocaleDateString('es-ES');
    if(window.clinicCfg.logoBase64) { document.getElementById('print-logo').src = window.clinicCfg.logoBase64; document.getElementById('print-logo').style.display = 'block'; }
    
    const printContainer = document.getElementById('print-report-container'); printContainer.innerHTML = ''; 
    const patHistory = window.historyLog.filter(x => x.patientId === window.activePatientId);
    
    const modes = [
        { id: 'search', name: '1. Búsqueda Táctil' }, { id: 'coord', name: '2. Coordenadas' }, { id: 'pursuit', name: '3. Seguimiento' }, 
        { id: 'anticrowding', name: '4. Anti-Crowding' }, { id: 'saccadic', name: '5. Saltos Sacádicos' }, { id: 'marsden', name: '6. Pelota de Marsden' },
        { id: 'tracing', name: '7. Laberinto Visual' }, { id: 'tachisto', name: '8. Taquistoscopio' },
        { id: 'gabor', name: '9. Parches de Gabor' }, { id: 'trombone', name: '10. Acomodación Dinámica' }
    ];

    let hasData = false;
    modes.forEach(m => {
        const modeData = patHistory.filter(h => h.mode === m.id);
        if(modeData.length === 0) return;
        hasData = true;

        const avgAcc = Math.round(modeData.reduce((acc, curr) => acc + (curr.accuracy || 100), 0) / modeData.length);
        const totalMs = modeData.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
        const bestMs = Math.min(...modeData.map(s => s.timeMs));
        const bestS = modeData.find(s => s.timeMs === bestMs);

        const section = document.createElement('div');
        section.className = 'print-section';
        section.innerHTML = `
            <h3 style="border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px;">${m.name}</h3>
            <div style="display:flex; gap: 10px; margin-bottom: 10px; font-size: 10pt;">
                <div class="metric-card" style="flex:1;"><strong>Sesiones:</strong> ${modeData.length}</div>
                <div class="metric-card" style="flex:1;"><strong>Tiempo Total:</strong> ${formatDuration(totalMs)}</div>
                <div class="metric-card" style="flex:1;"><strong>Mejor:</strong> ${bestS ? bestS.timeFormatted : '--:--'}</div>
                <div class="metric-card" style="flex:1; color:#16a34a;"><strong>Precisión:</strong> ${avgAcc}%</div>
            </div>
            <div class="chart-container" style="height: 150px; margin-bottom: 10px; border: 1px solid #94a3b8; padding: 4px;">
                <svg id="print-svg-${m.id}" width="100%" height="100%" style="overflow: visible;"></svg>
            </div>
            <table class="history-table" style="font-size: 8pt;">
                <thead><tr><th>Fecha</th><th>Ojo</th><th>Tiempo</th><th>Precisión</th></tr></thead>
                <tbody>${[...modeData].reverse().map(s => `<tr><td>${s.date}</td><td><strong>${s.eye}</strong></td><td><strong>${s.timeFormatted}</strong></td><td>${s.accuracy}% (${s.errors} err)</td></tr>`).join('')}</tbody>
            </table>`;
        printContainer.appendChild(section);
        renderChart(modeData, document.getElementById(`print-svg-${m.id}`));
    });

    if(!hasData) printContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">No hay datos registrados para este paciente.</p>';

    document.body.classList.remove('print-grid-only');
    document.body.classList.add('print-report-only');
    setTimeout(() => { window.print(); document.body.classList.remove('print-report-only'); }, 300);
});

document.getElementById('btn-print-grid').addEventListener('click', () => { document.body.classList.remove('print-report-only'); document.body.classList.add('print-grid-only'); window.print(); document.body.classList.remove('print-grid-only'); });

document.getElementById('btn-export-json').addEventListener('click', () => {
    const bundle = { version: "6.00", clinic: window.clinicCfg, patients: window.patients, routines: window.routines, history: window.historyLog, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup_terapia_visual_${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const d = JSON.parse(event.target.result);
            if (d.patients && d.history) {
                window.patients = d.patients; window.historyLog = d.history; window.routines = d.routines || {}; window.clinicCfg = d.clinic || {};
                await saveAllToIDB();
                alert('¡Base de datos completa restaurada con éxito!'); location.reload();
            } else alert('Formato de backup no válido.');
        } catch (err) { alert('Error al procesar el archivo JSON.'); }
    };
    reader.readAsText(file);
});

document.getElementById('btn-delete-hist').addEventListener('click', async () => {
    if (confirm('¿Desea borrar TODO el historial de pruebas (de todos los juegos) de este paciente?')) {
        window.historyLog = window.historyLog.filter(s => s.patientId !== window.activePatientId);
        await IDB.set('history', window.historyLog);
        renderHistory();
        updatePatientCardDisplay(); // Para quitar la racha visualmente
    }
});

// ARRANCAR EL MOTOR ASÍNCRONO
document.addEventListener('DOMContentLoaded', bootApp);