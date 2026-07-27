# 👁️ Suite de Terapia Visual (v5.00)

> **Software clínico web para entrenamiento oculomotor, estabilización de la mirada y agudeza visual**, diseñado específicamente para pacientes con nistagmo, ambliopía, déficits de fijación foveal, alteraciones de seguimiento y sacádicos.

---

## 📋 Descripción del Proyecto

Esta aplicación web funciona como una **Suite Clínica Integral** (*Single Page Application*). Permite a optometristas y terapeutas visuales gestionar perfiles de pacientes, recetar pautas terapéuticas diarias y ejecutar **6 módulos de entrenamiento visual distintos**. 

La aplicación se adapta automáticamente a cualquier pantalla (Mac, PC, iPads/Tablets y dispositivos e-Ink como Kindle Scribe), calculando la distancia clínica recomendada mediante calibración por tarjeta física. Todo el procesamiento de datos y la generación de informes se realizan de forma local en el navegador, garantizando total privacidad.

---

## 🎮 Catálogo de Ejercicios (6 Módulos)

1. **🔠 Cuadrícula Espacial (Spatial Grid):**
   * *Búsqueda Táctil:* Localización foveal entre distractores (matriz 10x10).
   * *Coordenadas:* Discriminación espacial usando el teclado virtual/físico.
   * *Seguimiento (Pursuit):* Rastreo de un objetivo saltarín en la cuadrícula.
2. **🎯 Anti-Crowding:** 
   * Entrenamiento contra el amontonamiento visual. El paciente debe identificar la letra central entre flanqueadores que se reducen progresivamente en tamaño y espaciado.
3. **⚡ Saltos Sacádicos:** 
   * Entrenamiento de reflejo periférico y fijación foveal ultrarrápida. Aparición aleatoria de dianas temporizadas.
4. **🎾 Pelota de Marsden Virtual:** 
   * Simulador pendular para entrenamiento de seguimiento dinámico suave (*Smooth Pursuit*). El cronómetro y la acción de validación solo se activan ante estímulos diana específicos.
5. **🔀 Visual Tracing (Laberintos):** 
   * Estabilización de la mirada. Generación aleatoria de curvas entrelazadas (Canvas) que el paciente debe seguir exclusivamente con los ojos de principio a fin.
6. **📸 Taquistoscopio:** 
   * Entrenamiento de memoria visual y fijación extrema. Flash de 250 milisegundos con caracteres alfanuméricos tras fijación central en cruz.

---

## ✨ Funcionalidades Clínicas

* **Gestión Multiusuario Integral:** Creación, edición y borrado absoluto de perfiles de pacientes (incluyendo historial y pautas).
* **Marca Blanca (Configuración de Clínica):** Personalización completa de los reportes con Nombre de Clínica, Nombre del Especialista, Nº de Colegiado, Contacto y **Logo personalizado (procesado en Base64)**.
* **Pautas Terapéuticas (Diseñador):** Posibilidad de recetar "Planes del Día" combinando múltiples series de los 6 diferentes juegos, eligiendo ojo entrenado (BIN, OD, OI) y opciones visuales.
* **Reportes Clínicos PDF:** Generador global de informes en A4, agrupando el desempeño de todos los juegos en métricas y gráficas de evolución vectorial (SVG) con el membrete oficial del centro.
* **Base de Datos Portátil:** Exportación e importación de la base de datos completa (Pacientes, Rutinas, Historial y Configuración de la Clínica) en un único archivo JSON de seguridad.
* **Modo e-Ink / Alto Contraste:** Interfaz e-Reader amigable.

---

## 🏗️ Arquitectura Técnica (Multifichero)

A partir de la versión 5.00, el proyecto ha migrado de una estructura monolítica a un sistema modular ligero para facilitar el mantenimiento sin depender de librerías externas ni servidores (*Backend-less*):

1. `index.html`: Estructura base de la aplicación (SPA), modales de interfaz y contenedores DOM.
2. `styles.css`: Estilos visuales, variables CSS, Dark Mode / Alto Contraste y reglas estrictas de paginación `@media print` para los PDF.
3. `app.js`: Motor clínico. Controla el *Router* de las vistas, la persistencia en `localStorage`, la gestión de pacientes, clínica, historial y el renderizado global SVG.
4. `juegos.js`: Motor gráfico y bucles de juego (Game Loops). Incluye el Teclado Virtual dinámico interactivo y la lógica de validación/renderizado (Canvas/DOM) de los 6 ejercicios terapéuticos.

---

## 🚀 Instalación y Despliegue

La aplicación está construida estrictamente en **Vanilla HTML5, CSS3 y JavaScript ES6+**. No requiere Node.js, bases de datos ni conexión a internet continua.

### Opción A: Ejecución Local Offline
1. Descarga el contenido del repositorio en una misma carpeta.
2. Haz doble clic en el archivo `index.html` para abrirlo en cualquier navegador moderno (Chrome, Safari, Firefox).

### Opción B: Servidor Web / GitHub Pages
1. Clona este repositorio o actívalo directamente mediante GitHub Pages.
2. Visita la URL pública y guárdala como App de Pantalla de Inicio (*PWA / Bookmark*) en tus dispositivos de trabajo.

---

## 🔒 Privacidad y Datos (GDPR / HIPAA)

Este software es **100% Client-Side**. No existe transmisión de datos al exterior. Los datos de salud (historias clínicas, tiempos de resolución, diagnósticos y edad de pacientes) se cifran y guardan exclusivamente en el `localStorage` del navegador que ejecuta la aplicación web. El terapeuta es responsable de salvaguardar el dispositivo y exportar/borrar la base de datos según sus protocolos clínicos.

---

*Diseñado para la evolución tecnológica en la terapia y rehabilitación optométrica.*












# 👁️ Terapia Visual: Estabilización Táctil y Fijación Foveal

> **Software web de entrenamiento oculomotor y estabilización de la mirada**, diseñado específicamente para pacientes con nistagmo, ambliopía, déficits de fijación foveal o alteraciones de seguimiento y sacádicos.

---

## 📋 Descripción del Proyecto

Esta aplicación web interactiva permite a optometristas, terapeutas visuales y pacientes realizar ejercicios de fijación, rastreo visual sacádico y seguimiento dinámico. El software se adapta automáticamente a cualquier pantalla (Mac, PC, iPads/Tablets y dispositivos e-Ink como Amazon Kindle Scribe) calculando la distancia clínica recomendada según el tamaño físico del monitor y las letras en pantalla.

---

## ✨ Características Principales

* **3 Modos de Entrenamiento Clínico:**
  1. **Búsqueda Foveal:** Tocar objetivos específicos dentro de una cuadrícula alfanumérica de 10x10.
  2. **Lectura de Coordenadas:** Localización de celdas por Fila/Columna con entrada directa de teclado virtual/físico.
  3. **Seguimiento Dinámico:** Rastreo de un objetivo móvil con discriminación de caracteres para fijación continua.
* **Calibración Física Exacta:**
  * Detector automático de pulgadas y tipo de pantalla.
  * Herramienta de calibración milimétrica mediante tarjeta física (crédito/carné).
  * Cálculo dinámico de distancia sugerida de trabajo (en cm).
* **Adaptabilidad e-Ink y Accesibilidad:**
  * Modo **Alto Contraste / e-Ink** (blanco y negro puro) auto-activado en e-Readers.
  * Tipografía clínica legible (*Atkinson Hyperlegible*).
  * Auto-focus y scroll suave al tablero de juego.
  * Resumen flotante de aciertos y tiempos al finalizar cada ronda.
* **Gestión Multiusuario y Pautas Terapéuticas:**
  * Perfiles de pacientes individuales con historiales y estadísticas aisladas.
  * Diseñador de prescripciones diarias ("Plan del Día") con ejecución guiada en un clic.
* **Informes Clínicos y Marca Blanca:**
  * Personalización del centro: Nombre del Centro, Especialista, Nº de Colegiado, Contacto y Logo.
  * Generador de **Reportes PDF Documentales A4** de 1 sola página.
  * Impresión de hojas de trabajo analógicas para lápiz y papel.
  * Copias de seguridad completas en formato `.json` (importación/exportación).

---

## 📜 Historial de Versiones (Changelog)

### 🚀 Rama 3.xx / 4.00 (Gestión Clínica, Multiusuario y Marca Blanca)
* **v3.08 (Versión Actual Definitiva):**
  * **Personalización de Centro / Marca Blanca:** Panel de configuración para añadir Nombre de la Clínica, Especialista, Nº de Colegiado, Teléfono/Dirección y Subida de Logo personalizado (Base64).
  * **Membrete Profesional:** Incorporación automática del logo y ficha del especialista en la cabecera de los Reportes PDF.
* **v3.07:**
  * **Diseño PDF Documental:** Maquetación completa para A4 con líneas finas de precisión, márgenes de imprenta, tipografía compacta y eliminación de elementos estilo "web".
* **v3.06:**
  * **Aislamiento de Reportes PDF:** Separación estricta en CSS (`@media print`) para imprimir solo el informe clínico (1 página) sin cuadrículas ni controles de juego.
* **v3.05:**
  * **Cartel Gigante de Distancia Recomendada:** Aviso destacado en la *flashcard* inicial enunciando los cm recomendados antes de cada ejercicio.
  * **Herramienta de Calibración por Tarjeta (`💳 Calibrar`):** Ajuste de pantalla superponiendo una tarjeta física.
* **v3.04:**
  * **Resumen Flotante Accesible:** Cartel a pantalla completa con tiempo, errores y precisión foveal, descartable al tocar cualquier punto o pulsar una tecla.
* **v3.03:**
  * **Auto-Focus al Juego:** Desplazamiento automático de pantalla hacia el tablero al iniciar sesión.
  * **Indicadores Gigantes:** Tipografía de objetivo y aciertos maximizada para baja visión.
* **v3.02:**
  * **Diseñador de Pautas Terapéuticas:** Prescripción de ejercicios diarios y botón `▶️ Iniciar Siguiente Tarea` para autoconfigurar el juego.
* **v3.01:**
  * **Sistema Multiusuario Local:** Registro de pacientes y partición de historiales en `localStorage`.

### 🎨 Rama 2.xx (Analítica Foveal, e-Ink y Renderizado JS)
* **v2.04:**
  * **Modo Alto Contraste (e-Ink):** Inversión a negro azabache/blanco puro. Auto-activación en Kindle Scribe.
  * Generador de impresiones de cuadrículas en papel para trabajo analógico.
* **v2.03:**
  * **Motor de Renderizado JS:** Ajuste por código de píxeles para resolver incompatibilidades de Container Queries en motores WebKit e-Ink.
* **v2.02:** Vinculación proporcional de tamaño de letra a la celda.
* **v2.01:** Autodetección inteligente de hardware y memoria de monitor aislada por dispositivo.
* **v2.00:** Medición de tasa de precisión foveal (%), registro de fallos y selector de ojo entrenado (BIN / OD / OI).

### 🛠️ Rama 1.xx (Fundación del Motor de Juego)
* **v1.00 – v1.05:**
  * Tablero interactivo de 10x10.
  * Síntesis de voz (TTS) para instrucciones verbales.
  * Gráficas de evolución en SVG.
  * Modos de juego de Búsqueda, Coordenadas y Seguimiento.
  * Exportación e importación de datos en JSON.

---

## 🚀 Instalación y Despliegue

La aplicación está construida en **Vanilla HTML5, CSS3 y JavaScript** sin dependencias externas, lo que permite un despliegue inmediato.

### Opción A: Servidor Web / GitHub Pages
1. Clona este repositorio o descarga el archivo `index.html`.
2. Activa **GitHub Pages** en los ajustes de tu repositorio (*Settings > Pages > Branch: main*).
3. Accede desde cualquier navegador web en tu Mac, iPad, Android o Kindle.

### Opción B: Ejecución Local Offline
1. Descarga el archivo `index.html`.
2. Haz doble clic para abrirlo directamente en cualquier navegador web sin necesidad de conexión a internet.

---

## 🔒 Privacidad y Datos (GDPR / LOPD)

Esta aplicación opera **100% en el lado del cliente (*Client-Side*)**:
* Todos los datos de pacientes, historiales, pautas e imágenes de logos se almacenan exclusivamente en el navegador local (`localStorage`) del dispositivo del usuario.
* Ningún dato personal o métrico de salud se envía a servidores externos.
* Se recomienda utilizar identificadores anónimos o códigos clínicos internos al crear los perfiles de pacientes.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** CSS Variables, Flexbox, CSS Grid y Media Queries de Impresión.
* **JavaScript (ES6+):** Motor de cálculo físico de pantalla, manipulador de DOM nativo y LocalStorage API.
* **SVG:** Renderizado vectorial de gráficas de evolución temporal.
* **Web Speech API:** Síntesis de voz nativa en español para instrucciones auditivas.