Vista de Detalle de suscripción
1. Contexto y objetivo
Crea la vista de Detalle de una suscripción de la PWA.
Aquí se debe hacer un ajuste a los enlaces de la pantalla principal. Al abrir una fila de la sección “Suscripciones” debe abrirse esta vista que se creará ahora y debe permitir:
•	Ver toda la información relevante de esa suscripción.
•	Ver su impacto mensual/anual.
•	Ver estado, método de pago, con quién se comparte.
•	Ver un pequeño histórico de cambios de precio.
•	Acceder a acciones clave (editar, marcar como cancelada, etc.).
Entonces, la pantalla “Editar” antes creada debe ser accedida desde esta nueva vista “Detalles”. El flujo sería así:
Pantalla Inicio  botón “Agregar suscripción”  vista “Agregar Suscripción”
Pantalla Inicio  fila en “Suscripciones”  nueva vista “Detalles”  vista “Editar Suscripción”

Mismo estilo neobrutalista utilitario que el resto de la app, con tipografía, paleta y tratamiento visual ya establecidos.
________________________________________
2. Estructura semántica y layout
Dentro de <main>:
1.	<header> con navegación y título.
2.	Bloque “Encabezado de la suscripción” (nombre + estado + montos clave).
3.	Bloque “Resumen de impacto” (mensual/anual y por persona).
4.	Bloque “Detalles de facturación” (ciclo, próxima fecha, método de pago).
5.	Bloque “Participantes / con quién se comparte”.
6.	Bloque “Historial de cambios de precio”.
7.	Zona de acciones (Editar, Marcar como cancelada, etc.).
Mobile first, bloques apilados verticalmente con buen espaciado. En desktop, puedes mantener una sola columna (no es obligatorio pasar a 2 columnas en esta vista).
Jerarquía de encabezados
•	H1/H2 en el header (nombre de la suscripción).
•	H2 para cada sección: “Resumen de impacto”, “Detalles de facturación”, “Participantes”, “Historial de precio”.
________________________________________
3. Header de la vista
•	Semántica: <header> dentro de <main>.
•	Contenido:
•	Botón de volver (icono “←” o “Atrás”) con texto o aria-label="Volver a la lista de suscripciones".
•	Nombre de la suscripción como H1/H2 (Space Grotesk, tamaño grande).
•	Opcionalmente un pequeño badge con el estado (ACTIVA/TRIAL/ZOMBIE/PAUSADA) junto al nombre.
Estilo
•	Layout horizontal: flecha de vuelta + título + badge de estado.
•	Debajo, una línea horizontal (borde inferior negro) separa el header del contenido.
________________________________________
4. Bloque “Encabezado de la suscripción”
Primer bloque justo bajo el header.
Semántica
•	<section aria-labelledby="detalle-resumen-suscripcion"> con H2 oculto o visible (p.ej. “Resumen de esta suscripción”).
Contenido
•	Monto principal (Fira Code grande):
•	Ej. $XX.XXX / mes o $YY.YYY / año.
•	Pequeño texto debajo:
•	“Equivalente mensual: $X” o “Equivalente anual: $Y” según corresponda.
•	Badge de estado (si no fue puesto en el header) con color según estado:
•	TRIAL (amarillo), ACTIVA (verde), ZOMBIE (rojo ladrillo), PAUSADA (gris).
Estilo
•	Card amplia con fondo blanco, borde negro 3 px.
•	Montos en tamaño dominante, centrados o alineados a la izquierda, con mucho espacio.
________________________________________
5. Bloque “Resumen de impacto”
Semántica
•	<section aria-labelledby="impacto-heading">.
•	H2: “Resumen de impacto”.
Contenido
Puedes usar una lista de definición <dl>:
•	“Comprometido este mes” → monto (Fira Code).
•	“Comprometido por año” → monto.
•	“Por persona” → pequeño subgrupo:
•	“Yo”, “Pareja”, “Familia” marcados si aplican, o un texto tipo “Esta suscripción está marcada para: Yo + Pareja”.
Estilo
•	Bloque con fondo gris muy claro #F3F4F6, borde negro 2 px.
•	Filas tipo dt/dd con montos alineados a la derecha para legibilidad.
________________________________________
6. Bloque “Detalles de facturación”
Semántica
•	<section aria-labelledby="facturacion-heading">.
•	H2: “Detalles de facturación”.
Contenido
De nuevo, un <dl> o lista clara con:
•	“Ciclo de cobro” → Mensual / Anual / Otro.
•	“Próximo cobro” → fecha (Fira Code).
•	“Fecha de alta” (si la guardas) → fecha.
•	“Método de pago” → texto tipo “Visa ***1234”, “Cuenta vista”, etc.
•	“Es trial” → Sí/No, y si Sí: “Termina el [fecha fin de trial]”.
Estilo
•	Card con fondo blanco, borde negro.
•	Icono pequeño o etiqueta fuerte para método de pago.
________________________________________
7. Bloque “Participantes / con quién se comparte”
Semántica
•	<section aria-labelledby="participantes-heading">.
•	H2: “Participantes”.
Contenido
•	Lista de chips con “Yo”, “Pareja”, “Familia”, “Otros” según se haya configurado.
•	Texto auxiliar (“Usamos esto para desglosar tus totales por persona”).
Estilo
•	Chips rectangulares con borde negro, relleno blanco o gris claro.
•	El bloque puede ser más pequeño, tipo “subcard” simple.
________________________________________
8. Bloque “Historial de cambios de precio”
Semántica
•	<section aria-labelledby="historial-precio-heading">.
•	H2: “Historial de precio”.
Contenido
•	Si hay datos:
•	Tabla simple (<table> con <thead> y <tbody>) o lista.
•	Columnas: “Desde”, “Monto”, “Moneda”.
•	Ej.:
•	Desde 01-01-2025 → $6.000.
•	Desde 01-03-2026 → $8.000.
•	Si no hay cambios registrados: texto vacío útil (“Aún no has cambiado el precio de esta suscripción”).
Estilo
•	Tabla brutalista:
•	Bordes negros en celdas, filas alternadas con fondo gris claro, montos en Fira Code.
________________________________________
9. Zona de acciones
En la parte baja de la vista.
Contenido
•	Botón principal: “Editar suscripción” → lleva a la vista de Editar Suscripción.
•	Botón secundario: “Marcar como cancelada” (o “Cancelar suscripción”), con estilo de botón de peligro.
•	Opcional: “Volver a la lista” si no usas solo la flecha del header.
Estilo
•	Botón principal:
•	Fondo #FF5A1F, texto negro, borde negro 2–3 px.
•	Botón “peligro”:
•	Fondo blanco, texto rojo ladrillo #D7263D, borde negro 2 px.
Ambos con transiciones breves y estados :hover y :active claros.
________________________________________
10. Accesibilidad y comportamiento
•	El botón “Atrás” debe ser un <button> o <a> con texto o aria-label claro.
•	Jerarquía de headings respetada (no saltar de H1 a H3).
•	Tab debe recorrer header → bloques → acciones de forma lógica.
•	:focus visible en todos los elementos interactivos (inputs no hay aquí, pero sí botones y enlaces).

