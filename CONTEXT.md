# CONTEXTO DEL SISTEMA: Suite de Terapia Visual Clínica (v7.01)

## 1. Propósito y Alcance del Sistema
Software clínico web diseñado para el entrenamiento oculomotor, estabilización de la mirada y mejora de la agudeza visual. Dirigido a la rehabilitación optométrica de pacientes con nistagmo, ambliopía y déficits de fijación/seguimiento.
*   **Alcance funcional:** 
    *   Gestión multiusuario (Base de datos de pacientes).
    *   Asignación de pautas terapéuticas (manuales y autogeneradas algorítmicamente por tiempo).
    *   Ejecución de 10 módulos interactivos de terapia visual (Cuadrículas, Anti-Crowding, Sacádicos, Marsden, Laberintos, Taquistoscopio, Parches de Gabor, Acomodación Dinámica).
    *   Gamificación mediante cálculo de rachas diarias (*streaks*).
    *   Generación de reportes clínicos A4 en PDF (tablas de datos y gráficas SVG).
    *   Copias de seguridad vía exportación/importación JSON.

## 2. Stack Tecnológico y Dependencias
Desarrollo **Backend-less** y **Zero-Dependencies**.
*   **Lenguajes:** HTML5, CSS3, JavaScript (ES6+).
*   **APIs Nativas del Navegador:**
    *   `IndexedDB` (Almacenamiento asíncrono y persistente de base de datos).
    *   `Web Speech API` (Síntesis de voz / TTS para instrucciones).
    *   `Service Workers` y `Web App Manifest` (Para empaquetado PWA y funcionamiento 100% offline).
    *   `Canvas API` y `SVG` (Renderizado de juegos como Visual Tracing/Gabor y gráficas).
*   **Dependencias Externas:** Ninguna. Frameworks descartados para garantizar portabilidad absoluta y ejecución local directa.
*   **Plataformas Objetivo:** Navegadores modernos en macOS, Windows, iOS, Android y dispositivos de tinta electrónica (e-Ink como Kindle Scribe).

## 3. Arquitectura y Flujo de Datos
Arquitectura modular nativa (Single Page Application estructurada en múltiples ficheros para evitar límites de tokens y sobrecarga cognitiva).

*   **Módulos Principales:**
    *   `index.html`: Estructura DOM, contenedores SPA (`.app-view`), modales, overlays y *router* visual (roles Paciente/Clínica).
    *   `styles.css`: Sistema de diseño basado en variables CSS, modo Alto Contraste (e-Ink) y reglas estrictas `@media print` para ocultar UI e imprimir reportes.
    *   `app.js`: Motor clínico. Maneja el estado asíncrono (`IDB`), la navegación, CRUD de pacientes, generador de pautas y renderizado de gráficas SVG/Historial.
    *   `juegos.js`: Motor gráfico (*Game Loops*). Implementa las lógicas de los 10 juegos, teclado virtual unificado, calibración física (tarjeta) y TTS.
    *   `sw.js` / `manifest.json`: Capa de infraestructura PWA y caché offline.

*   **Flujo de Peticiones (Capa Cliente):**
    1.  Interacción del usuario (UI) -> Lógica de juego (`juegos.js`) o administración (`app.js`).
    2.  Modificación del estado global en memoria (inyectado en el objeto `window`).
    3.  Actualización asíncrona de persistencia hacia IndexedDB.
    4.  Carga inicial (Boot): El sistema lee IndexedDB. Si está vacío, verifica `localStorage` (como *fallback* de migración de versiones anteriores <= v5.xx), absorbe los datos y purga el storage antiguo.

## 4. Variables de Entorno y Configuración
Al ser un sistema estrictamente del lado del cliente, no usa `.env`. La configuración se mantiene en los "Stores" de IndexedDB (Base de datos: `TerapiaVisualSuite` v1, ObjectStore: `store`):
*   `patients`: Array de objetos con el perfil de cada paciente (id, nombre, dob, notas).
*   `routines`: Objeto de arrays mapeado por `patientId` con la pauta asignada.
*   `history`: Array global de registros de sesión (tiempos, aciertos, precisión, modo, ojo).
*   `clinicCfg`: Configuración de marca blanca de la clínica (Nombre, Especialista, Colegiado, Logo en Base64).
*   `activePatientId`: Puntero al paciente actual cargado en el contexto.

*Claves legacy en LocalStorage (Solo para migraciones o calibración de hardware):*
*   `nystagmus_monitor_size`: Pulgadas calculadas vía slider de tarjeta física.

## 5. Decisiones Clave y Restricciones Técnicas
*   **Separación de Ficheros (Anti-Monolito):** El proyecto abandonó una estructura de fichero único (v4) tras superar las 1600 líneas para asegurar el mantenimiento escalable y la correcta asimilación por agentes de IA.
*   **IndexedDB vs LocalStorage:** Transición realizada para evitar el límite restrictivo de 5MB de `localStorage`, permitiendo almacenamiento indefinido de historiales y logos Base64 masivos.
*   **Gráficas Vectoriales (SVG) para PDFs:** Se descartó Canvas para las gráficas de evolución clínica para garantizar una resolución óptima al imprimir en A4.
*   **Teclado Virtual Nativo:** Se implementó botonera en pantalla para inputs (letras/opciones) con el fin de evitar invocar el teclado nativo del SO móvil, el cual empujaría el layout y rompería los Canvas.
*   **Separación de Roles UI:** Creación de dos flujos aislados en `app.js` (Modo Optometrista vs Modo Paciente) para mitigar la sobrecarga cognitiva del usuario en casa.

## 6. Deuda Técnica y Problemas Conocidos
*   **Gestión de Estado Global Frágil:** La comunicación entre `app.js` y `juegos.js` depende de variables y funciones colgadas del objeto `window` (`window.patients`, `window.endGame`, etc.). Es un compromiso asumido por la ausencia de bundlers (Webpack/Vite) y módulos ES reales (`type="module"`).
*   **Caché Agresiva del Service Worker (`sw.js`):** Durante el desarrollo o actualizaciones (OTA), los navegadores retienen versiones previas. Obliga a versionar el nombre del caché (`terapia-visual-vX.XX`) y forzar `self.clients.claim()` en cada iteración para invalidarla.
*   **Web Speech API (Voz) en iOS:** Las políticas de Apple bloquean la síntesis de voz si no hay una interacción táctil directa en la misma pila de llamadas. Puede fallar o silenciarse temporalmente en transiciones automatizadas (ej. Taquistoscopio automático).
*   **Animaciones en Dispositivos Lentos / e-Ink:** Juegos como "Acomodación Dinámica (Trombón)" utilizan animaciones CSS (`transform: scale`) en lugar de `requestAnimationFrame` por rendimiento, lo que puede provocar tearing visual en pantallas de baja tasa de refresco (Kindle).

## 7. Convenciones de Código
*   **No dependencias:** Prohibido incorporar librerías externas (jQuery, Chart.js, React). Todo se programa desde cero.
*   **Programación Asíncrona:** Toda operación contra la base de datos (IDB) utiliza `async / await` envuelta en métodos adaptadores en el objeto estático `IDB`.
*   **Resiliencia de Carga:** Uso de comprobaciones de tipo (`typeof window.X === 'function'`) y bloques `try/catch` globales antes de leer o parchear objetos JSON en los imports.
*   **Inyección DOM:** Se prioriza la generación de HTML dinámico mediante literales de plantilla (Template Literals ``) inyectados vía `innerHTML` por simplicidad, mitigando el XSS al no existir inputs de terceros/públicos.
*   **Estilos:** Uso intensivo de CSS `clamp()` para tipografías responsive y variables CSS (`:root`) para temas globales y modo e-Ink de alto contraste.