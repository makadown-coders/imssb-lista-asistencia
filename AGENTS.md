# AGENTS.md — RH Listas de Asistencia (IMSS-Bienestar Baja California)

## 1. Propósito
Este repositorio contiene una prueba de concepto (MVP) para generar formatos mensuales de listas de asistencia del personal adscrito a la Coordinación Estatal de IMSS-Bienestar Baja California.

**Objetivo de fase 1 aprobado:** producir documentos Word mensuales con nombre, puesto o área, periodo, días correctos del mes y sombreado de descansos generales confirmados, respetando la plantilla institucional aprobada.

No es todavía un sistema de control de asistencia, registro de incidencias ni gestión de vacaciones.

## 2. Estado técnico comprobado
- Aplicación Angular 21, TypeScript 5.9, componentes standalone y Angular Signals.
- Interfaz principal: `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`.
- Modelos: `src/app/core/models/attendance.model.ts`.
- Reglas iniciales y textos: `src/app/core/data/holidays.data.ts`.
- Calendario: `src/app/core/services/calendar.service.ts`.
- Generación Word en navegador: `src/app/core/services/docx-generator.service.ts`, usando `jszip` y OpenXML.
- Comandos disponibles: `npm start`, `npm run build`, `npm test` (verificar que existan pruebas antes de asumir cobertura).
- `angular.json` publica los recursos de `public/`.
- La plantilla `public/template-membretado-2026.docx` es un insumo institucional de despliegue. Puede omitirse de paquetes compartidos deliberadamente; no inventar ni generar una sustituta.
- El estado de edición es local a la sesión. No existe un backend, base de datos ni persistencia comprobada en este repositorio.

## 3. Alcance autorizado del MVP
1. Selección de mes y año.
2. Cálculo correcto de meses de 28, 29, 30 y 31 días, incluidos años bisiestos.
3. Identificación y sombreado de sábados y domingos.
4. Sombreado de descansos generales conforme al calendario institucional confirmado para el ejercicio; sin ajustes manuales públicos.
5. Captura de nombre y texto del campo «Puesto», y selección de mes y año. Jornada, horario y adscripción permanecen como textos institucionales internos del formato.
6. Generación y descarga de archivo `.docx` a partir de la plantilla oficial, conservando encabezado, tablas, logotipos, distribución e identidad gráfica.
7. Mantener la generación de documentos en el navegador cuando sea viable, sin exigir servidores.

## 4. Fuera de alcance por ahora
**No implementar sin instrucción explícita:**
- Tratamiento de días otorgados, permisos con/sin goce, incapacidades o comisiones.
- Flujos de validación previa a impresión, firmas digitales o verificación de firmas autógrafas.
- Reglas sobre generación al inicio o cierre del mes, o flujos especiales de regeneración.
- Reloj checador, registro de horas reales, aprobación de asistencia, nómina o expediente laboral.
- Administración de vacaciones, saldos, periodos, descuentos o solicitudes vacacionales.
- Inicio de sesión, roles, backend, base de datos, despliegue en servidor o integración con Power Automate sin un requerimiento aprobado.

## 5. Evolución prevista, NO implementada
La reunión de RH del 30/10/2026 identificó una posible etapa futura de control vacacional: periodos primero/segundo por año, días disfrutados, fecha de disfrute, saldos e historial. También se mencionó la posibilidad de que el empleado descargue sus formatos y que RH controle altas y datos maestros.

Estas ideas son **requerimientos por validar**, no autorización para construirlas ahora. Si se aprueba una fase posterior, separar el catálogo de personal, la generación documental y los movimientos vacacionales en módulos claros. No asumir reglas de devengo, caducidad, transferencias o saldos sin validación formal de RH.

## 6. Reglas de negocio y datos
- Alcance organizacional: únicamente personal de la Coordinación Estatal de Baja California.
- El PDF de marzo de 2026 es una referencia visual e histórica, **no** un padrón vigente ni una fuente autoritativa para nuevas altas.
- El campo impreso «Puesto» contiene en ocasiones oficinas, departamentos, nombres o cargos. Conservar el texto oficial proporcionado por RH; no deducir ni normalizar automáticamente un catálogo de puestos.
- En la muestra, la jornada es «LUNES A VIERNES», el horario «08:00 – 17:00 HRS» y la adscripción «COORDINACIÓN ESTATAL DE IMSS BIENESTAR BAJA CALIFORNIA». Son valores predeterminados del MVP, no reglas universales demostradas.
- No asumir que todos los días festivos se recorren al lunes. Diferenciar fecha fija, lunes ordinal expresamente autorizado y excepciones anuales. El comportamiento genérico de «mover al lunes de la misma semana» requiere aprobación antes de tratarse como regla oficial.
- La circular IB-UAF-CRH-0003-2026 respalda formalmente el calendario 2026. En ejercicios posteriores se proyectan provisionalmente sus mismas reglas de fechas fijas y lunes ordinales; la interfaz debe advertirlo y cada año deberá sustituirse o confirmarse con la circular correspondiente de RH.
- Los descansos adicionales para determinados trabajadores se catalogan por separado y no se aplican de manera general. En particular, el 5 de mayo no se sombrea indiscriminadamente.
- El sombreado de fin de semana debe ser independiente del de festivos y ajustes manuales; un mismo día puede reunir más de una causa.
- Nunca inventar feriados, suspensiones, excepciones o autorizaciones institucionales.
- Las filas de días inexistentes del mes deben eliminarse o tratarse conforme a la plantilla aprobada, sin romper el diseño.

## 7. Arquitectura y restricciones
- **No hay infraestructura propia** disponible para este proyecto.
- Existen cuentas institucionales Microsoft 365 y acceso a ciertas herramientas de automatización, incluido Power Automate; **no asumir** permisos, conectores premium, creación de listas SharePoint, licencias adicionales ni disponibilidad de un entorno específico.
- Preferir la solución más simple que cumpla el alcance. No introducir dependencias, servicios externos, autenticación o almacenamiento remoto por iniciativa propia.
- El prototipo actual puede ejecutarse como frontend estático. Cualquier propuesta de persistencia o automatización institucional debe explicar permisos, costo, protección de datos y alternativa sin servidor.
- Datos de empleados son información personal: minimizar su uso, evitar registros de consola con datos reales y no enviar información a servicios externos sin autorización.

## 8. Convenciones de desarrollo
- Respetar la estructura y el estilo existente de Angular 21; utilizar TypeScript con tipado explícito y Signals cuando corresponda.
- Mantener lógica de calendario en `CalendarService`, generación documental en `DocxGeneratorService`, tipos en `attendance.model.ts` y catálogos en `holidays.data.ts` hasta que exista una razón concreta para refactorizar.
- No convertir el componente raíz en un repositorio de reglas de negocio.
- Evitar cambios cosméticos no solicitados, reescrituras amplias y modificaciones de la plantilla oficial.
- Mantener los textos de interfaz en español y usar fechas locales sin errores por huso horario.
- No agregar dependencias nuevas sin justificar necesidad y compatibilidad.
- Si un requisito es ambiguo, exponer la decisión pendiente en vez de suponerla.

## 9. Riesgos técnicos que revisar
1. Verificar la presencia, integridad y versión de `public/template-membretado-2026.docx`.
2. `DocxGeneratorService` depende de que las tablas de Word conserven posiciones específicas (`tables[0]` y `tables[1]`), de filas fijas y de columnas específicas. Protegerse ante cambios de plantilla y mostrar errores comprensibles.
3. `setCellText` modifica nodos `w:t` existentes: revisar casos donde una celda carece de texto o el texto está repartido en múltiples runs.
4. Revisar que el nombre de archivo descargado no cause colisiones cuando se generen documentos para distintos empleados (actualmente contiene solo mes y año).
5. Revisar la lógica de festivos trasladados, incluidos cruces de mes y fin de semana; **no cambiar reglas laborales sin validación**.
6. Revisar comportamiento y apariencia del Word resultante en Microsoft Word e impresión, no solo la vista previa HTML.
7. Verificar si `npm test` realmente tiene pruebas configuradas antes de reportar pruebas exitosas.

## 10. Pruebas mínimas sugeridas
- Febrero 2024 (29 días), febrero 2025/2026 (28 días), abril (30) y marzo (31).
- Cambio de año y mes: recalcular sombreado y limpiar ajustes manuales según comportamiento actual.
- Fines de semana en primer y último día del mes.
- Festivos fijos, festivos de lunes ordinal y coincidencia con fin de semana, con resultados esperados confirmados.
- Días adicionales sombreados y reversión del ajuste.
- Nombres y puestos largos, acentos, eñes y campos vacíos.
- Documento generado: una hoja por empleado, encabezados y pies correctos, tablas completas, sin filas de días inexistentes, impresión sin desbordamientos.
- Error por plantilla ausente o incompatible con mensaje útil.

## 11. Protocolo obligatorio para agentes de código
Antes de editar:
1. Leer este archivo y los archivos concretos relacionados con la tarea.
2. Resumir el comportamiento actual y el cambio mínimo propuesto.
3. Identificar supuestos y pedir aclaración si afectan reglas RH, plantilla o datos personales.

Al implementar:
4. Hacer cambios acotados, mantener compatibilidad y no expandir el alcance.
5. Agregar o actualizar pruebas cuando corresponda; no afirmar cobertura inexistente.
6. Ejecutar `npm run build` y las pruebas disponibles si el entorno lo permite.

Al entregar:
7. Indicar archivos modificados, comportamiento implementado, pruebas ejecutadas y resultados.
8. Declarar limitaciones, dependencias faltantes y cualquier decisión pendiente de RH.
9. No declarar «listo para producción» sin pruebas de documento real, revisión de RH y evaluación de privacidad/despliegue.

## 12. Criterio de terminado para tareas del MVP
Una tarea se considera terminada cuando cumple la solicitud sin alterar funciones existentes, compila cuando es posible, se prueba con escenarios relevantes y conserva la fidelidad del formato institucional. Si depende de una plantilla o autorización faltante, declararlo explícitamente.
