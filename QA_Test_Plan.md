# 🧪 Matriz de Pruebas QA - Suite Terapia Visual v7.00

| Fase / Categoría | Prueba a realizar | macOS | Windows | iOS | Android | Kindle | Observaciones / Enlace a Issue |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Entorno PWA** | Aparece opción de instalar PWA / Añadir a Inicio | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Icono y Nombre correctos en el sistema | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Carga inicial 100% Offline (Sin Wi-Fi) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Persistencia al hacer Hard Refresh (`F5`) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **2. Base de Datos**| Crear Paciente (Nombre, Fecha, Notas) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Cambio de Paciente actualiza el Dashboard | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Eliminar Paciente (Borrado y confirmación) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Guardar Configuración Clínica (Textos) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Subir, Renderizar y Eliminar Logo (Base64) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **3. UI y Roles** | Fondo gris medio fotográfico (`#808080`) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Cambio de Rol restringe vistas correctamente | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Modal "ℹ️ Info" muestra el texto clínico | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Calibración Física (Slider Tarjeta) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Cálculo automático de Distancia (cm) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Toggle Alto Contraste / e-Ink (Fondo blanco) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **4. Motor Común** | Uso de Teclado Físico (A-Z, Barra Espaciadora) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Navegación por flechas en Teclado Virtual | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | El Cronómetro se pausa durante Flashcards | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Cálculo correcto de % de Precisión al fallar | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Síntesis de Voz (TTS) lee instrucciones y final | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **5. Juegos (1-5)** | 1. Búsqueda: Matriz 10x10 y toggle de líneas | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 2. Coordenadas: Teclado con 4 opciones | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 3. Seguimiento: Salto azul a celda contigua | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 4. Anti-Crowding: Escala y centra correcto | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 5. Sacádicos: Diana táctil salta aleatorio | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **5. Juegos (6-10)**| 6. Marsden: Animación pendular e intro con 'A' | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 7. Tracing: 3 líneas canvas entrelazadas | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 8. Taquistoscopio: 250ms y auto-siguiente | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 9. Gabor: Gradiente CSS rotado y pérdida contraste| [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | 10. Trombón: Animación Zoom en CSS / Eje Z | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **6. Pautas** | Añadir Pauta Manual | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Generador Automático (Algoritmo de Tiempo) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Jugar actualiza la progresión del paciente | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Cálculo de Rachas (Streaks) marca 1 día | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| **7. Analítica/Datos**| Filtro de Pestañas actualiza las métricas | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Gráfica SVG carga puntos en ambos ejes X | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Impresión Papel (Solo renderiza cuadrícula) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Reporte PDF Total (1 sección por juego + SVG) | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Exportar Backup JSON descarga el fichero | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| | Importar Backup restaura base de datos | [ ] | [ ] | [ ] | [ ] | [ ] |  |