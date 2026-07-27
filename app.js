// ============================================================================
// app.js - SUITE TERAPIA VISUAL (Motor Clínico, Pacientes y Reportes)
// ============================================================================

window.patients = JSON.parse(localStorage.getItem('nystagmus_patients') || '[{"id":"p_default","name":"Paciente General", "dob": "", "notes": ""}]');
window.routines = JSON.parse(localStorage.getItem('nystagmus_routines') || '{}');
window.historyLog = JSON.parse(localStorage.getItem('nystagmus_history') || '[]');
window.clinicCfg = JSON.parse(localStorage.getItem('nystagmus_clinic_cfg') || '{}');
window.activePatientId = localStorage.getItem('nystagmus_active_patient_id') || window.patients[0].id;

window.chartXAxisType = 'index'; 
window.activeStatsTab = 'search'; // Por defecto empezamos en la primera prueba

function initApp() {
    const sel = document.getElementById('global-patient-select'); 
    sel.innerHTML = '';
    
    if(!window.patients.find(p => p.id === window.activePatientId)) {
        window.activePatientId = window.patients[0].id;
        localStorage.setItem('nystagmus_active_patient_id', window.activePatientId);
    }
    
    window.patients.forEach(p => sel.appendChild(new Option(p.name, p.id)));
    sel.value = window.activePatientId;
    
    sel.addEventListener('change', e => { 
        window.activePatientId = e.target.value; 
        localStorage.setItem('nystagmus_active_patient_id', window.activePatientId); 
        updatePatientCardDisplay();
        renderDashboard(); 
    });
    
    updatePatientCardDisplay();

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
    
    renderDashboard();
}

document.getElementById('cfg-logo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        window.clinicCfg.logoBase64 = event.target.result;
        document.getElementById('cfg-logo-preview').src = window.clinicCfg.logoBase64;
        document.getElementById('cfg-logo-preview').style.display = 'block';
        document.getElementById('clear-logo-btn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
});

document.getElementById('clear-logo-btn').addEventListener('click', () => {
    window.clinicCfg.logoBase64 = '';
    document.getElementById('cfg-logo-input').value = '';
    document.getElementById('cfg-logo-preview').style.display = 'none';
    document.getElementById('clear-logo-btn').style.display = 'none';
});

document.getElementById('save-clinic-btn').addEventListener('click', () => {
    window.clinicCfg.clinicName = document.getElementById('cfg-clinic').value.trim();
    window.clinicCfg.specialistName = document.getElementById('cfg-specialist').value.trim();
    window.clinicCfg.colNum = document.getElementById('cfg-col').value.trim();
    localStorage.setItem('nystagmus_clinic_cfg', JSON.stringify(window.clinicCfg));
    alert('¡Configuración de clínica guardada con éxito!');
});

function updatePatientCardDisplay() {
    const activeP = window.patients.find(p => p.id === window.activePatientId) || window.patients[0];
    const dobText = activeP.dob ? ` | Nacimiento: ${activeP.dob}` : '';
    document.getElementById('patient-info-display').innerHTML = `<strong>${activeP.name}</strong>${dobText}<br><em style="color:#64748b;">${activeP.notes || 'Sin notas adicionales.'}</em>`;
}

document.getElementById('create-pat-btn').addEventListener('click', () => {
    const name = document.getElementById('new-pat-name').value.trim();
    const dob = document.getElementById('new-pat-dob').value;
    const notes = document.getElementById('new-pat-notes').value.trim();
    
    if (!name) { alert('Introduzca un nombre para el paciente.'); return; }
    
    const newP = { id: 'p_' + Date.now(), name: name, dob: dob, notes: notes };
    window.patients.push(newP);
    localStorage.setItem('nystagmus_patients', JSON.stringify(window.patients));
    
    document.getElementById('new-pat-name').value = '';
    document.getElementById('new-pat-dob').value = '';
    document.getElementById('new-pat-notes').value = '';
    
    initApp();
    document.getElementById('global-patient-select').value = newP.id;
    document.getElementById('global-patient-select').dispatchEvent(new Event('change'));
    alert(`Paciente añadido al sistema.`);
});

document.getElementById('delete-pat-btn').addEventListener('click', () => {
    if(window.patients.length <= 1) {
        alert("Debe haber al menos un paciente registrado en el sistema.");
        return;
    }
    if(confirm('¿Desea ELIMINAR COMPLETAMENTE a este paciente, su historial y sus pautas? Esta acción es irreversible.')) {
        window.patients = window.patients.filter(p => p.id !== window.activePatientId);
        window.historyLog = window.historyLog.filter(h => h.patientId !== window.activePatientId);
        delete window.routines[window.activePatientId];
        
        localStorage.setItem('nystagmus_patients', JSON.stringify(window.patients));
        localStorage.setItem('nystagmus_history', JSON.stringify(window.historyLog));
        localStorage.setItem('nystagmus_routines', JSON.stringify(window.routines));
        
        window.activePatientId = window.patients[0].id;
        localStorage.setItem('nystagmus_active_patient_id', window.activePatientId);
        initApp();
        alert("Paciente eliminado del sistema.");
    }
});

document.getElementById('btn-add-routine').onclick = () => {
    let r = window.routines[window.activePatientId] || []; 
    r.push({
        mode: document.getElementById('rout-add-mode').value, 
        eye: document.getElementById('rout-add-eye').value, 
        lines: document.getElementById('rout-add-lines').value,
        req: parseInt(document.getElementById('rout-add-req').value), 
        done: 0
    });
    window.routines[window.activePatientId] = r; 
    localStorage.setItem('nystagmus_routines', JSON.stringify(window.routines)); 
    renderDashboard();
};

document.getElementById('btn-clear-routine').onclick = () => { 
    window.routines[window.activePatientId] = []; 
    localStorage.setItem('nystagmus_routines', JSON.stringify(window.routines)); 
    renderDashboard(); 
};

window.updateRoutineProgress = function() {
    let r = window.routines[window.activePatientId] || []; 
    let updated = false;
    for(let t of r) {
        // Ahora simplemente coincidir window.currentGame
        if(t.done < t.req && t.mode === window.currentGame && t.eye === document.getElementById('game-eye').value) { 
            t.done++; updated = true; break; 
        }
    }
    if(updated) { 
        window.routines[window.activePatientId] = r; 
        localStorage.setItem('nystagmus_routines', JSON.stringify(window.routines)); 
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
            search: 'Búsqueda Táctil', coord: 'Coordenadas', pursuit: 'Seguimiento', 
            anticrowding: 'Anti-Crowding', saccadic: 'Sacádicos', marsden: 'Pelota Marsden', 
            tracing: 'Laberintos', tachisto: 'Taquistoscopio'
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
    renderHistory(false);
};

document.getElementById('btn-launch-routine').addEventListener('click', () => {
    let r = window.routines[window.activePatientId] || []; 
    let next = r.find(t => t.done < t.req);
    
    if(!next) { alert("¡Pauta clínica completada por hoy!"); return; }
    
    window.openGame(next.mode);
    if(['search', 'coord', 'pursuit'].includes(next.mode)) { 
        document.getElementById('game-lines-toggle').checked = (next.lines === 'Sí');
    }
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
    renderHistory(false);
}

function renderHistory(printAll = false) {
    const h = window.historyLog.filter(x => x.patientId === window.activePatientId);
    
    let filteredHistory = h;
    if (!printAll) {
        // Ahora filtramos exactamente por el modo activo, ya no hay agrupaciones
        filteredHistory = h.filter(x => x.mode === window.activeStatsTab);
    }
    
    const tbody = document.getElementById('history-tbody');
    document.getElementById('metric-total-sessions').textContent = filteredHistory.length;
    const totalMs = filteredHistory.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
    document.getElementById('metric-total-time').textContent = formatDuration(totalMs);

    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Sin datos acumulados en esta prueba.</td></tr>';
        document.getElementById('metric-best-time').textContent = '--:--';
        document.getElementById('metric-avg-accuracy').textContent = '--%';
        renderChart([]);
        return;
    }

    const sumAccuracy = filteredHistory.reduce((acc, curr) => acc + (curr.accuracy !== undefined ? curr.accuracy : 100), 0);
    document.getElementById('metric-avg-accuracy').textContent = `${Math.round(sumAccuracy / filteredHistory.length)}%`;

    const bestMs = Math.min(...filteredHistory.map(s => s.timeMs));
    const bestSession = filteredHistory.find(s => s.timeMs === bestMs);
    document.getElementById('metric-best-time').textContent = bestSession ? bestSession.timeFormatted : '--:--';

    tbody.innerHTML = [...filteredHistory].reverse().map((s) => {
        return `<tr>
            <td>${s.date}</td><td>${s.modeName || s.mode}</td><td><strong>${s.eye}</strong></td>
            <td><strong>${s.timeFormatted}</strong></td><td>${s.accuracy}% (${s.errors} err)</td>
        </tr>`;
    }).join('');

    renderChart(filteredHistory);
}

function renderChart(data) {
    const svg = document.getElementById('evolution-chart');
    svg.innerHTML = '';
    if (!data || data.length === 0) return;

    const width = svg.clientWidth || 700;
    const height = 200;
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
        svg.appendChild(line);
    }

    if (points.length > 1) {
        const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD); path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#3b82f6"); path.setAttribute("stroke-width", "3");
        svg.appendChild(path);
    }

    points.forEach(p => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", "5");
        circle.setAttribute("fill", p.eye === 'OD' ? '#ef4444' : (p.eye === 'OI' ? '#3b82f6' : '#10b981'));
        svg.appendChild(circle);
    });
}

document.getElementById('chart-axis-btn').addEventListener('click', () => {
    window.chartXAxisType = window.chartXAxisType === 'index' ? 'date' : 'index';
    document.getElementById('chart-axis-btn').textContent = window.chartXAxisType === 'index' ? '🔢 Eje X: Por Pruebas' : '📅 Eje X: Por Fecha';
    renderHistory(false);
});

document.getElementById('btn-print-pdf').addEventListener('click', () => {
    document.getElementById('print-clinic').textContent = window.clinicCfg.clinicName || 'Centro Clínico';
    document.getElementById('print-specialist').textContent = window.clinicCfg.specialistName || 'Especialista';
    document.getElementById('print-col').textContent = window.clinicCfg.colNum ? "Nº Col: " + window.clinicCfg.colNum : '';
    document.getElementById('print-date').textContent = "Fecha Emisión: " + new Date().toLocaleDateString('es-ES');
    
    if(window.clinicCfg.logoBase64) { 
        document.getElementById('print-logo').src = window.clinicCfg.logoBase64; 
        document.getElementById('print-logo').style.display = 'block'; 
    }
    
    renderHistory(true); 
    document.body.classList.remove('print-grid-only');
    document.body.classList.add('print-report-only');
    
    setTimeout(() => {
        window.print();
        document.body.classList.remove('print-report-only');
        renderHistory(false); 
    }, 200);
});

document.getElementById('btn-export-json').addEventListener('click', () => {
    const bundle = {
        version: "5.04",
        clinic: window.clinicCfg,
        patients: window.patients,
        routines: window.routines,
        history: window.historyLog,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_terapia_visual_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('import-file-input').click());

document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const d = JSON.parse(event.target.result);
            if (d.patients && d.history) {
                localStorage.setItem('nystagmus_patients', JSON.stringify(d.patients));
                localStorage.setItem('nystagmus_history', JSON.stringify(d.history));
                if (d.routines) localStorage.setItem('nystagmus_routines', JSON.stringify(d.routines));
                if (d.clinic) localStorage.setItem('nystagmus_clinic_cfg', JSON.stringify(d.clinic));
                alert('¡Base de datos completa restaurada con éxito!');
                location.reload();
            } else if (Array.isArray(d)) {
                localStorage.setItem('nystagmus_history', JSON.stringify(d));
                alert('¡Historial heredado importado!');
                location.reload();
            } else alert('Formato no válido.');
        } catch (err) { alert('Error al procesar el archivo JSON.'); }
    };
    reader.readAsText(file);
});

document.getElementById('btn-delete-hist').addEventListener('click', () => {
    if (confirm('¿Desea borrar TODO el historial de pruebas (de todos los juegos) de este paciente?')) {
        window.historyLog = window.historyLog.filter(s => s.patientId !== window.activePatientId);
        localStorage.setItem('nystagmus_history', JSON.stringify(window.historyLog));
        renderHistory(false);
    }
});

document.addEventListener('DOMContentLoaded', initApp);