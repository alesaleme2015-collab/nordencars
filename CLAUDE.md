# NordenCars Web pública — instrucciones para Claude

Sitio público de NordenCars (concesionaria de 0km y usados en Yerba Buena, Tucumán).
Producción: https://www.nordencars.com.ar (el dominio sin www redirige a www).

## Quién lo usa y cómo trabajar

- El dueño (Ale Saleme) **no es técnico y no usa la terminal**. Nunca pedirle que corra comandos.
- Hablar en español argentino, conciso. Explicar lo técnico en palabras simples.
- Para mostrarle cambios: levantar `npm run dev` (http://localhost:5173) y que lo mire en vivo.
- Commit + push a **`master`** (no `main`) lo hace Claude. Un commit por cambio. Vercel publica solo en ~2-3 min.

## Stack

- **Vite + React 19, JavaScript (no TypeScript, no Next.js).** No hay chequeo de tipos: validar con `npm run build` y mirando la consola del dev server.
- Casi todo el sitio vive en un solo archivo: `src/App.jsx` (estilos inline, paleta en un objeto de colores al principio). Imágenes en `public/images/`.
- `src/HistoriaCompra.jsx`: "La historia de Martín" de la home (8 escenas SVG dibujadas en código, tipo historias de Instagram).
- `api/auto.js` + `vercel.json`: única función de servidor. `www.nordencars.com.ar/auto/<id>` devuelve las etiquetas og (foto, modelo, precio) para la vista previa al compartir por WhatsApp/redes y redirige a `/?auto=<id>`. La foto liviana la arma el ERP (`/api/publico/foto-og/<id>`).
- Botón "atrás" del navegador (2026-10-30, `src/historial.js`): cada sección es una entrada del historial (`#stock`, `#okm`…, se navega con `navTo`) y toda capa nueva (modal, menú, chat, pasos de un formulario) llama a `useCapaAtras(abierta, cerrar)` para que "atrás" la cierre en vez de salir de la web.
- Overlays fijos (modales, comparador, cursor): siempre con `createPortal` a `document.body` (el wrapper de la página tiene `transform` y `#root` tiene z-index).
- Legibilidad (pedido de Ale): ningún texto por debajo de ~11 px; etiquetas en `C.muted`/`C.muted2`, nada más oscuro.
- Sin librería de Supabase: todo por `fetch` a las APIs públicas del ERP.
- Hosting: Vercel, auto-deploy desde GitHub `alesaleme2015-collab/nordencars` (repo **público** → nunca subir claves privadas; solo la anon key pública de Supabase).

## De dónde salen los datos

- **Stock de autos: viene del ERP**, no de la base de la web: `GET https://sistema.nordencars.store/api/publico/stock` (cache 60 s). Si falta un dato de un auto, el cambio va en el ERP (`nordencars-erp`), no acá. El precio va en `precio_usd` (nombre viejo) con su moneda en `precio_moneda`: mostrarlo siempre con `precioDe()`.
- También del ERP: 0km (`/api/publico/okm`, solo versiones con precio revisado), simulador Teilen (`/api/publico/teilen`), perfil de Instagram (`/api/publico/instagram`) y "Vendé tu auto" (`POST /api/publico/vender-auto`, con el tasador de estado en `tasacion`; las claves del cuestionario tienen que coincidir con las del ERP).
- **La web ya no tiene base propia**: el Supabase `crwcshjhzwbqpxsdhrrm` dejó de existir (detectado en la auditoría del 2026-10-29) y se sacó su panel admin. Todo sale del ERP: stock, 0km, Instagram, "Vendé tu auto" y el formulario de Contacto (`POST /api/publico/consulta`).

## Datos fijos

- WhatsApp único: +54 9 381 637-5262.
- Rojo de marca de la web: `#DC2626`. Fondo oscuro `#0a0c10`.
- Estética premium (hero con autos 3D, animaciones). Cuidar que todo funcione bien en celular.

## Proyecto hermano

El ERP está en `../nordencars-erp` (Next.js, rama `main`, otra base de Supabase). Son dos repos distintos: no mezclar cambios ni ramas.
