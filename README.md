# 👁️ Suite de Terapia Visual Clínica (v7.02)

## 1. Título y Descripción
**Suite de Terapia Visual Clínica** es un software médico web integral estructurado como PWA (*Progressive Web App*). Está diseñado para la rehabilitación optométrica, focalizado en pacientes con nistagmo, ambliopía, déficits de fijación foveal, alteraciones de seguimiento y sacádicos. La plataforma permite a los especialistas recetar y evaluar rutinas visuales, y a los pacientes ejecutarlas de manera guiada en un entorno gamificado, calculando métricas de precisión y tiempo de forma 100% *offline*.

## 2. Características Principales
* **10 Módulos de Entrenamiento Clínico:** Búsqueda Táctil, Coordenadas, Seguimiento, Anti-Crowding, Saltos Sacádicos, Pelota de Marsden, Visual Tracing (Laberintos), Taquistoscopio, Parches de Gabor y Acomodación Dinámica (Trombón).
* **Arquitectura de Roles:** Interfaces completamente separadas para `Clínica/Optometrista` (administración y analítica) y `Paciente` (jugabilidad sin sobrecarga cognitiva).
* **Auto-Generador Algorítmico:** Creación automática de pautas terapéuticas basadas en un objetivo de tiempo (ej. 15 min) y lateralidad (BIN, OD, OI).
* **Gamificación y Retención:** Motor automático de cálculo de rachas diarias (*streaks*).
* **Reportes Clínicos PDF:** Generador global de informes en A4 con gráficas vectoriales (SVG), métricas desglosadas por juego y membrete personalizable (Marca Blanca).
* **Base de Datos Nativa:** Persistencia asíncrona mediante `IndexedDB`. Almacenamiento ilimitado, privado e independiente de servidores externos (HIPAA/GDPR compliance por diseño).
* **Backup Portable:** Exportación e importación completa de la base de datos en formato JSON.

## 3. Requisitos Previos
El proyecto adopta un enfoque **Backend-less y Zero-Dependencies** (Vanilla JS).
* **Sistemas Operativos:** macOS, Windows, iOS, Android, o dispositivos e-Ink (ej. Kindle Scribe).
* **Runtimes / Gestores de Paquetes:** `NO SE REQUIEREN` (Sin Node.js, Python, npm, ni pip).
* **Navegador Web:** Chrome, Safari, Firefox o Edge actualizados (Soporte indispensable para ES6+, `IndexedDB`, `ServiceWorkers` y `SpeechSynthesis API`).

## 4. Instalación y Puesta en Marcha

**Clonación del repositorio:**
```bash
git clone [https://github.com/tu-usuario/terapia-visual-suite.git](https://github.com/tu-usuario/terapia-visual-suite.git)
cd terapia-visual-suite