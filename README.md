# Generador de listas de asistencia

Aplicación web de fase 1 para generar listas mensuales de asistencia en Word para el personal de la Coordinación Estatal IMSS-Bienestar Baja California.

La solución funciona completamente en el navegador: no requiere backend, autenticación, base de datos ni almacenamiento de información personal.

## Funcionalidades actuales

- Captura de nombre completo y puesto o área.
- Selección de mes y año.
- Validación de campos obligatorios antes de descargar.
- Cálculo de meses de 28, 29, 30 y 31 días, incluidos años bisiestos.
- Identificación y sombreado de sábados, domingos y descansos generales.
- Vista previa con dos secciones de calendario: días 1 a 15 y 16 al último día del mes.
- Leyenda informativa `Lun - Día de descanso` en la vista previa cuando un descanso general cae entre semana.
- Generación local de archivos `.docx` mediante JSZip y OpenXML.
- Eliminación de filas correspondientes a días inexistentes sin alterar los dos encabezados del calendario.
- Nombre de archivo con periodo y nombre normalizado para Windows, por ejemplo `Lista_Asistencia_2026-03_Nombre_Apellido.docx`.
- Mensajes comprensibles cuando la plantilla está ausente, dañada o tiene una estructura incompatible.
- Modal “Acerca de esta aplicación” con alcance, privacidad, vigencia normativa y responsables institucionales.
- Normalización de rutas desconocidas a `/`, sin recargar la aplicación.
- Diseño adaptable para escritorio y dispositivos móviles.

La leyenda de descanso es únicamente informativa en la vista previa. La columna `OBSERVACIONES` del documento Word permanece vacía para conservar el formato destinado a impresión.

## Calendario institucional

El criterio base corresponde a la circular **IB-UAF-CRH-0003-2026** e incluye reglas declarativas para:

- Fechas fijas confirmadas.
- Primer lunes de febrero.
- Tercer lunes de marzo.
- Tercer lunes de noviembre.

Para otros ejercicios se proyectan las mismas reglas sobre el calendario real del año seleccionado. El criterio deberá confirmarse o modificarse cuando Recursos Humanos publique la circular correspondiente a cada ejercicio.

Los descansos adicionales aplicables solamente a determinados trabajadores se mantienen separados de los descansos generales. En particular, el 5 de mayo no se sombrea indiscriminadamente.

## Privacidad y alcance

- Los datos escritos se mantienen en la sesión del navegador.
- La generación del Word ocurre localmente.
- La aplicación no envía ni almacena datos personales.
- No sustituye disposiciones, validaciones, instrucciones ni formatos oficiales de Recursos Humanos.
- El documento generado debe revisarse antes de imprimirse o utilizarse.

La fase 1 no incluye autenticación, catálogo de empleados, backend, base de datos, control vacacional, incidencias, firmas digitales, carga de listas firmadas ni integraciones con Power Automate.

## Tecnología

- Angular 21 con componentes standalone y Signals.
- TypeScript 5.9.
- JSZip y OpenXML para modificar la plantilla Word en el navegador.
- Despliegue como frontend estático.

La lógica principal se distribuye de la siguiente forma:

- `src/app/core/data/holidays.data.ts`: catálogos y calendario institucional.
- `src/app/core/models/attendance.model.ts`: modelos públicos del calendario y documento.
- `src/app/core/services/calendar.service.ts`: cálculo de días, fines de semana y descansos.
- `src/app/core/services/docx-generator.service.ts`: carga y modificación de la plantilla Word.
- `src/app/app.ts`, `app.html` y `app.css`: estado e interfaz pública.

## Requisitos

- Node.js compatible con Angular 21.
- npm.
- La plantilla institucional aprobada en `public/template-membretado-2026.docx`.
- Los recursos visuales `public/HEADER.png` y `public/FOOTER.png`.

La aplicación no genera ni sustituye la plantilla institucional.

## Ejecución local

```bash
npm ci
npm start
```

Después abre `http://localhost:4200/`.

## Compilación

```bash
npm run build
```

La salida estática se genera en `dist/attendance-poc-web/browser/`.

El build actual puede mostrar advertencias no bloqueantes por el tamaño de `app.css` y por el formato CommonJS de JSZip.

## Pruebas

El repositorio contiene pruebas unitarias para reglas relevantes del calendario y normalización de nombres de archivo:

- Febrero de 2026.
- Descanso del 16 de marzo de 2026.
- Tratamiento diferenciado del 5 de mayo.
- Tercer lunes de noviembre de 2026.
- Febrero bisiesto de 2028 con proyección del criterio 2026.
- Nombres largos y caracteres no válidos para Windows.

El comando previsto es:

```bash
npm test -- --watch=false
```

La configuración actual requiere agregar como dependencias de desarrollo `vitest` y un entorno DOM compatible, como `jsdom` o `happy-dom`, antes de poder ejecutar la suite. No se deben reportar las pruebas como exitosas hasta instalar esas dependencias y ejecutar el comando.

## Despliegue estático

Publica el contenido de `dist/attendance-poc-web/browser/` en un hosting estático. `netlify.toml` configura el fallback de rutas hacia `index.html` para Netlify.

El despliegue debe incluir en la raíz pública:

- `template-membretado-2026.docx`.
- `HEADER.png`.
- `FOOTER.png`.

## Uso

1. Escribe el nombre completo.
2. Escribe el puesto o área respetando el texto oficial proporcionado por RH.
3. Selecciona mes y año.
4. Revisa días, sombreado y leyendas en la vista previa.
5. Descarga el documento Word.
6. Abre el archivo en Microsoft Word y revísalo antes de imprimir.

## Checklist de liberación

- Ejecutar `npm run build`.
- Ejecutar las pruebas cuando sus dependencias estén instaladas.
- Confirmar que la plantilla institucional corresponda a la versión aprobada.
- Verificar documentos de 28, 29, 30 y 31 días.
- Revisar encabezados, pies, logotipos, tablas y sombreado en Microsoft Word.
- Validar impresión sin desbordamientos.
- Confirmar el calendario y descansos adicionales con Recursos Humanos.
- Revisar privacidad y configuración del hosting antes de publicar.

No debe declararse “listo para producción” sin revisión del documento real, aprobación de Recursos Humanos y validación del despliegue.
