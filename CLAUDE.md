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
- Sin librería de Supabase: se usa `fetch` directo.
- Hosting: Vercel, auto-deploy desde GitHub `alesaleme2015-collab/nordencars` (repo **público** → nunca subir claves privadas; solo la anon key pública de Supabase).

## De dónde salen los datos

- **Stock de autos: viene del ERP**, no de la base de la web: `GET https://sistema.nordencars.store/api/publico/stock` (cache 60 s). Si falta un dato de un auto, el cambio va en el ERP (`nordencars-erp`), no acá.
- Supabase propio de la web (`crwcshjhzwbqpxsdhrrm`): solo `configuracion`, `fotos_clientes`, `videos`, `consultas`, `resenas`.

## Datos fijos

- WhatsApp único: +54 9 381 637-5262.
- Rojo de marca de la web: `#DC2626`. Fondo oscuro `#0a0c10`.
- Estética premium (hero con autos 3D, animaciones). Cuidar que todo funcione bien en celular.

## Proyecto hermano

El ERP está en `../nordencars-erp` (Next.js, rama `main`, otra base de Supabase). Son dos repos distintos: no mezclar cambios ni ramas.
