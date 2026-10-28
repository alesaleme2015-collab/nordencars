// Vista previa al compartir un auto (Ale, 2026-10-28): WhatsApp, Facebook e
// Instagram no corren JavaScript, así que leen las etiquetas og:* de esta página
// (foto, modelo, año, km y precio del auto). A una persona la manda directo a la
// ficha del auto en la web. Ruta pública: /auto/<id> (ver vercel.json).
const ERP_URL = "https://sistema.nordencars.store";
const SITIO = "https://www.nordencars.com.ar";
const PORTADA = `${SITIO}/images/og-cover.jpg`;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const miles = (n) => Math.round(Number(n)).toLocaleString("es-AR");

export default async function handler(req, res) {
  const id = String(req.query?.id ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const destino = id ? `${SITIO}/?auto=${id}` : SITIO;

  let auto = null;
  try {
    const r = await fetch(`${ERP_URL}/api/publico/stock`, { headers: { Accept: "application/json" } });
    if (r.ok) auto = (await r.json()).find((c) => String(c.id) === id) ?? null;
  } catch { /* sin datos: sale la vista previa general */ }

  let titulo = "Norden Cars · 0km y usados en Yerba Buena, Tucumán";
  let descripcion = "Tu próximo vehículo, fácil y seguro. Financiación, permutas y transferencia ágil.";
  let imagen = PORTADA;
  if (auto) {
    const precio = Number(auto.precio_usd) > 0 ? `${auto.precio_moneda === "USD" ? "US$" : "$"} ${miles(auto.precio_usd)}` : "Consultá el precio";
    const km = Number(auto.kilometraje) === 0 ? "0 km" : `${miles(auto.kilometraje)} km`;
    titulo = `${auto.marca} ${auto.modelo} ${auto.anio ?? ""} · ${precio}`.replace(/\s+/g, " ").trim();
    descripcion = [auto.version, km, auto.transmision, auto.combustible].filter(Boolean).join(" · ")
      + (auto.bajo_precio ? " · ¡Bajó de precio!" : "") + " — Norden Cars, Yerba Buena.";
    // Versión liviana 1200×630 con la patente tapada (la arma el ERP).
    if (auto.fotos?.[0]) imagen = `${ERP_URL}/api/publico/foto-og/${id}`;
  }

  const html = `<!doctype html>
<html lang="es-AR"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Norden Cars"/>
<meta property="og:locale" content="es_AR"/>
<meta property="og:title" content="${esc(titulo)}"/>
<meta property="og:description" content="${esc(descripcion)}"/>
<meta property="og:image" content="${esc(imagen)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${esc(`${SITIO}/auto/${id}`)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="${esc(imagen)}"/>
<meta http-equiv="refresh" content="0;url=${esc(destino)}"/>
<link rel="canonical" href="${esc(destino)}"/>
</head><body style="background:#0a0c10;color:#f5f5f5;font-family:sans-serif">
<script>location.replace(${JSON.stringify(destino)});</script>
<p><a href="${esc(destino)}" style="color:#ef4444">Ver ${esc(titulo)} en Norden Cars</a></p>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(html);
}
