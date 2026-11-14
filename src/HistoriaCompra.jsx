import { useEffect, useRef, useState } from "react";

/*
 * La historia de Martín (Ale, 2026-10-28): el proceso de compra en 8 pasos, como
 * historias de Instagram. Pasa sola mientras está a la vista, se pausa con el
 * mouse encima y se avanza tocando, con las flechas o deslizando.
 *
 * 2026-11-14 (Ale): sin dibujos animados. Cada paso se muestra en un tablero
 * digital tipo instrumental de auto: un cuentavueltas de 8 segmentos que se va
 * encendiendo, la etapa (elección / financiación / entrega) y el avance real.
 * Todo es SVG dibujado acá: no carga imágenes (salvo el logo).
 * Lienzo: 640×380, centro del reloj en (320, 200).
 */

const R = "#DC2626", R2 = "#EF4444", BLANCO = "#F5F5F5", GRIS = "#8a8e98";
const LOGO = "/images/img_logo_tight.png"; // 1400×336
const DURACION = 6.5; // segundos por paso

const PASOS = [
  { t: "Llega a Norden", d: "Martín entra a nuestra oficina en Yerba Buena. Lo recibimos sin apuro y con un café." },
  { t: "Pregunta por un auto", d: "Viene por una SUV puntual que vio en Instagram. Lo asesoramos: versión, kilómetros, service y si es la que le conviene." },
  { t: "Le mostramos el auto", d: "Lo ve en persona, lo revisa y se sube. Sin vueltas y sin compromiso." },
  { t: "Anticipo + cuotas", d: "Quiere poner un anticipo y financiar el resto con crédito prendario. Le decimos que sí." },
  { t: "Elige su plan", d: "Le mostramos los planes de financiación. Elige el que entra en su presupuesto y en la cuota que quiere pagar por mes." },
  { t: "Anticipo y firma", d: "Paga el anticipo y firma el crédito. Todo por escrito, todo claro." },
  { t: "¡Las llaves!", d: "Le entregamos el auto con la documentación para circular. Se va manejando ese mismo día." },
  { t: "La transferencia", d: "Los papeles de la transferencia pasan a nuestros gestores, que hacen todo el trámite. Martín no tiene que hacer nada más." },
];
// Etapas reales del proceso (pasos 1-3, 4-6, 7-8)
const ETAPAS = ["Elección", "Financiación", "Entrega"];
const etapaDe = (n) => (n < 3 ? 0 : n < 6 ? 1 : 2);

// Íconos de línea (cuadro de 24) para cada paso
const ICONOS = [
  <><path d="M6 21V4h10v17"/><path d="M3.5 21h17"/><path d="M13 12.5h.01"/></>,                                   // puerta
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,                                        // consulta
  <><path d="M4 16.5h16"/><path d="M5.5 16.5 7 11.5h10l1.5 5"/><path d="M7.5 11.5 9 7.5h6l1.5 4"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/></>, // auto
  <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/></>,                               // tarjeta
  <><path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/></>,                                                                 // planes
  <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,                                  // firma
  <><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2M17 6l3 3M14.5 8.5l2 2"/></>,                      // llave
  <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 15l2 2 4-4"/></>,   // trámite
];

/* Geometría del reloj: arco de 270° abierto abajo (de 135° a 405°, y hacia abajo) */
const CX = 320, CY = 200, RAD = 118;
const INI = 135, BARRIDO = 270, SEG = BARRIDO / PASOS.length;
const pto = (ang, r) => [CX + r * Math.cos((ang * Math.PI) / 180), CY + r * Math.sin((ang * Math.PI) / 180)];
const arco = (a, b, r) => {
  const [x0, y0] = pto(a, r), [x1, y1] = pto(b, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const finDe = (n) => INI + SEG * (n + 1); // ángulo donde termina el segmento n

const CSS = `
.hc-seg{stroke-dasharray:1;stroke-dashoffset:1;animation:hcSeg .95s cubic-bezier(.16,1,.3,1) .12s forwards}
@keyframes hcSeg{to{stroke-dashoffset:0}}
.hc-marca{transform-box:view-box;transform-origin:${CX}px ${CY}px;animation:hcMarca 1.1s cubic-bezier(.16,1,.3,1) both}
@keyframes hcMarca{from{transform:rotate(var(--a0))}to{transform:rotate(var(--a1))}}
.hc-giro{transform-box:view-box;transform-origin:${CX}px ${CY}px;animation:hcGiro 80s linear infinite}
@keyframes hcGiro{to{transform:rotate(360deg)}}
.hc-pulso{transform-box:fill-box;transform-origin:center;animation:hcPulso 1.9s ease-out infinite}
@keyframes hcPulso{0%{opacity:.75;transform:scale(1)}100%{opacity:0;transform:scale(2.8)}}
.hc-up{animation:hcUp .7s cubic-bezier(.16,1,.3,1) both}
@keyframes hcUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.hc-barra{transform-box:fill-box;transform-origin:left center;animation:hcBarra 1s cubic-bezier(.16,1,.3,1) both}
@keyframes hcBarra{from{transform:scaleX(var(--f0))}to{transform:scaleX(1)}}
.hc-prog{animation:hcProg linear both}
@keyframes hcProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hcIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.hc-svg *{animation-duration:.01s!important;animation-iteration-count:1!important;animation-delay:0s!important}}
`;
const cond = { fontFamily: "'Barlow Condensed',sans-serif" };

/* ─── Tablero de un paso ─────────────────────────────────────────────────── */
function Tablero({ i, prev, mobile }) {
  const et = etapaDe(i), etPrev = etapaDe(prev);
  const avance = Math.round(((i + 1) / PASOS.length) * 100);
  const avancePrev = Math.round(((prev + 1) / PASOS.length) * 100);
  // En celular se recorta el lienzo al reloj (los paneles laterales no entran legibles)
  const izq = mobile ? 128 : 30, der = mobile ? 512 : 610;
  const tX0 = mobile ? 150 : 70, tX1 = mobile ? 490 : 570;
  const nodoX = (n) => tX0 + (n * (tX1 - tX0)) / (PASOS.length - 1);

  return (
    <>
      <defs>
        <radialGradient id="hcFondo" cx="50%" cy="52%" r="62%">
          <stop offset="0" stopColor="#1a0f12"/>
          <stop offset=".55" stopColor="#0e1117"/>
          <stop offset="1" stopColor="#080a0e"/>
        </radialGradient>
        <radialGradient id="hcHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={R} stopOpacity=".22"/>
          <stop offset="1" stopColor={R} stopOpacity="0"/>
        </radialGradient>
        <pattern id="hcGrilla" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,.035)" strokeWidth="1"/>
        </pattern>
        <filter id="hcBrillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo: degradé, grilla fina y halo rojo detrás del reloj */}
      <rect width="640" height="380" fill="url(#hcFondo)"/>
      <rect width="640" height="380" fill="url(#hcGrilla)"/>
      <circle cx={CX} cy={CY} r="190" fill="url(#hcHalo)"/>

      {/* Encabezado */}
      <image href={LOGO} x={izq} y="30" width="104" height={104 * 336 / 1400}/>
      <g style={{ ...cond, fontWeight: 600 }} fontSize="14" letterSpacing="3" fill={GRIS} textAnchor="end">
        <text x={der} y="47">PROCESO DE COMPRA</text>
      </g>
      <circle cx={der - 172} cy="42.5" r="3.5" fill={R}/>
      <circle className="hc-pulso" cx={der - 172} cy="42.5" r="3.5" fill={R}/>

      {/* Anillo exterior que gira lento + marcas de escala */}
      <circle className="hc-giro" cx={CX} cy={CY} r={RAD + 46} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" strokeDasharray="2 10"/>
      {Array.from({ length: PASOS.length * 4 + 1 }, (_, k) => {
        const a = INI + (k * SEG) / 4, mayor = k % 4 === 0;
        const [x0, y0] = pto(a, RAD + 13), [x1, y1] = pto(a, RAD + (mayor ? 24 : 18));
        return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={mayor ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.14)"} strokeWidth={mayor ? 1.6 : 1}/>;
      })}
      <circle cx={CX} cy={CY} r={RAD - 22} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>

      {/* Los 8 segmentos: hechos (rojo), actual (se dibuja y brilla), pendientes (apagados) */}
      {PASOS.map((_, n) => {
        const a = INI + n * SEG + 1.4, b = INI + (n + 1) * SEG - 1.4;
        const d = arco(a, b, RAD);
        if (n > i) return <path key={n} d={d} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="14"/>;
        if (n < i) return <path key={n} d={d} fill="none" stroke={R} strokeOpacity=".72" strokeWidth="14"/>;
        return (
          <g key={n}>
            <path d={d} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="14"/>
            <path className="hc-seg" pathLength="1" d={d} fill="none" stroke={R2} strokeWidth="14" filter="url(#hcBrillo)"/>
          </g>
        );
      })}

      {/* Números de cada paso alrededor del reloj */}
      {PASOS.map((_, n) => {
        const [x, y] = pto(INI + (n + .5) * SEG, RAD + 38);
        return <text key={n} x={x} y={y + 5} textAnchor="middle" style={{ ...cond, fontWeight: 700 }} fontSize="15"
          fill={n === i ? BLANCO : n < i ? "rgba(239,68,68,.85)" : "rgba(255,255,255,.3)"}>{n + 1}</text>;
      })}

      {/* Marca que viaja por el arco del paso anterior al actual */}
      <g key={`m${prev}-${i}`} className="hc-marca" style={{ "--a0": `${finDe(prev)}deg`, "--a1": `${finDe(i)}deg` }}>
        <circle cx={CX + RAD} cy={CY} r="9" fill={R} opacity=".35" filter="url(#hcBrillo)"/>
        <circle cx={CX + RAD} cy={CY} r="5.5" fill="#fff"/>
      </g>

      {/* Centro: ícono, número y nombre del paso */}
      <g key={`c${i}`} className="hc-up">
        <g transform={`translate(${CX - 15} 108) scale(1.25)`} fill="none" stroke={R2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{ICONOS[i]}</g>
        <text x={CX} y="158" textAnchor="middle" style={{ ...cond, fontWeight: 600 }} fontSize="14" letterSpacing="4" fill={GRIS}>PASO</text>
        <text x={CX - 4} y="226" textAnchor="middle" style={{ ...cond, fontWeight: 900 }} fontSize="76" letterSpacing="-2" fill={BLANCO}>{String(i + 1).padStart(2, "0")}</text>
        <text x={CX + 44} y="226" style={{ ...cond, fontWeight: 600 }} fontSize="20" fill={GRIS}>/08</text>
        <text x={CX} y="256" textAnchor="middle" style={{ ...cond, fontWeight: 700 }} fontSize="17" letterSpacing="1.5" fill={BLANCO}>{PASOS[i].t.toUpperCase()}</text>
      </g>

      {/* Paneles laterales (compu): etapa y avance */}
      {!mobile && (
        <>
          <g style={cond}>
            <text x={izq} y="150" fontSize="13" letterSpacing="3" fontWeight="600" fill={GRIS}>ETAPA</text>
            <text key={`e${et}`} className="hc-up" x={izq} y="180" fontSize="21" fontWeight="800" letterSpacing=".5" fill={BLANCO}>{ETAPAS[et].toUpperCase()}</text>
          </g>
          {ETAPAS.map((_, k) => (
            <rect key={k} x={izq + k * 40} y="194" width="34" height="4" rx="2"
              fill={k < et ? R : k === et ? R2 : "rgba(255,255,255,.12)"} opacity={k < et ? .7 : 1}/>
          ))}
          <g style={cond}>
            <text x={izq} y="224" fontSize="12" fill="rgba(255,255,255,.5)">{ETAPAS.map((e, k) => (k ? " · " : "") + e).join("")}</text>
          </g>

          <g style={cond} textAnchor="end">
            <text x={der} y="150" fontSize="13" letterSpacing="3" fontWeight="600" fill={GRIS}>AVANCE</text>
            <text key={`a${i}`} className="hc-up" x={der} y="186" fontSize="36" fontWeight="800" fill={BLANCO}>{avance}<tspan fontSize="20" fill={GRIS}>%</tspan></text>
          </g>
          <rect x={der - 110} y="194" width="110" height="4" rx="2" fill="rgba(255,255,255,.12)"/>
          <rect key={`b${i}`} className="hc-barra" x={der - 110} y="194" width={110 * avance / 100} height="4" rx="2" fill={R2}
            style={{ "--f0": avance ? Math.min(1, avancePrev / avance) : 0 }}/>
          <text x={der} y="224" textAnchor="end" style={cond} fontSize="12" fill="rgba(255,255,255,.5)">{et !== etPrev || i === 0 ? "Etapa nueva" : `Paso ${i + 1} de ${PASOS.length}`}</text>
        </>
      )}

      {/* Pista inferior: los 8 pasos en línea */}
      <line x1={tX0} y1="342" x2={tX1} y2="342" stroke="rgba(255,255,255,.1)" strokeWidth="2"/>
      <line key={`p${i}`} className="hc-barra" x1={tX0} y1="342" x2={nodoX(i)} y2="342" stroke={R} strokeWidth="2"
        style={{ "--f0": i ? Math.min(1, prev / i) : 0 }}/>
      {PASOS.map((_, n) => (
        <g key={n}>
          {n === i && <circle className="hc-pulso" cx={nodoX(n)} cy="342" r="6" fill={R}/>}
          <circle cx={nodoX(n)} cy="342" r={n === i ? 6 : n < i ? 4.5 : 3.5}
            fill={n === i ? "#fff" : n < i ? R : "#2a2f39"} stroke={n === i ? R : "none"} strokeWidth="3"/>
        </g>
      ))}
    </>
  );
}

/* ─── Componente ─────────────────────────────────────────────────────────── */

export default function HistoriaCompra({ mobile }) {
  // i = paso actual; prev = el anterior (para animar el tablero desde donde estaba)
  const [{ i, prev }, setPaso] = useState({ i: 0, prev: 0 });
  // Sin IntersectionObserver (navegadores muy viejos) se considera siempre a la vista.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");
  const [pausa, setPausa] = useState(false);
  const [fin, setFin] = useState(false);
  const ref = useRef(null);
  const toque = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: .45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ir = (n) => {
    setFin(false);
    const dest = Math.max(0, Math.min(PASOS.length - 1, n));
    setPaso((p) => (p.i === dest ? p : { i: dest, prev: p.i }));
  };
  const siguiente = () => (i === PASOS.length - 1 ? setFin(true) : ir(i + 1));
  const corre = visible && !pausa && !fin;

  return (
    <div ref={ref} onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}
      style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.45fr) minmax(0,1fr)", gap: mobile ? 18 : 44, alignItems: "center" }}>
      <style>{CSS}</style>

      {/* Tablero */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 80px rgba(0,0,0,.55), 0 0 60px rgba(220,38,38,.08), inset 0 1px 0 rgba(255,255,255,.06)", background: "#0b0d12", userSelect: "none" }}
        onTouchStart={(e) => { toque.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current; toque.current = null;
          if (Math.abs(dx) > 40) dx < 0 ? siguiente() : ir(i - 1);
        }}>
        {/* Barritas tipo historias */}
        <div style={{ position: "absolute", top: 10, left: 12, right: 12, display: "flex", gap: 4, zIndex: 2 }}>
          {PASOS.map((_, n) => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
              {n < i || (n === i && fin) ? <div style={{ height: "100%", background: "#fff" }}/>
                : n === i ? (
                  <div key={`p${i}`} className="hc-prog" onAnimationEnd={siguiente}
                    style={{ height: "100%", background: "#fff", transformOrigin: "left", animationDuration: `${DURACION}s`, animationPlayState: corre ? "running" : "paused" }}/>
                ) : null}
            </div>
          ))}
        </div>
        <svg className="hc-svg" viewBox={mobile ? "110 14 420 352" : "0 0 640 380"} style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`Paso ${i + 1} de ${PASOS.length}: ${PASOS[i].t}`}>
          <Tablero i={i} prev={prev} mobile={mobile}/>
        </svg>
        {/* Tocar a los costados: atrás / adelante */}
        <button aria-label="Paso anterior" onClick={() => ir(i - 1)} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", background: "transparent", border: "none" }}/>
        <button aria-label="Paso siguiente" onClick={siguiente} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%", background: "transparent", border: "none" }}/>
        {fin && (
          <button onClick={() => ir(0)} style={{ position: "absolute", right: 14, bottom: 14, zIndex: 3, background: "rgba(10,12,16,.85)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 30, padding: "8px 16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" }}>
            ↻ Ver de nuevo
          </button>
        )}
      </div>

      {/* Texto */}
      <div>
        <div key={`t${i}`} style={{ animation: "hcIn .5s both" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 3, color: R, marginBottom: 6 }}>
            PASO {String(i + 1).padStart(2, "0")} DE {String(PASOS.length).padStart(2, "0")}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: mobile ? 30 : 38, fontWeight: 900, textTransform: "uppercase", color: BLANCO, lineHeight: 1, marginBottom: 12, letterSpacing: -.5 }}>{PASOS[i].t}</div>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: "rgba(245,245,245,.68)", fontFamily: "sans-serif", minHeight: mobile ? 0 : 74, margin: 0 }}>{PASOS[i].d}</p>
        </div>
        {!mobile && (
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px" }}>
            {PASOS.map((p, n) => (
              <button key={n} onClick={() => ir(n)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,.06)", textAlign: "left", color: n === i ? BLANCO : GRIS, fontFamily: "sans-serif", fontSize: 13.5, transition: "color .3s" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: n === i ? R : n < i ? "rgba(220,38,38,.22)" : "rgba(255,255,255,.06)", color: n <= i ? "#fff" : GRIS, transition: "background .3s" }}>{n + 1}</span>
                {p.t}
              </button>
            ))}
          </div>
        )}
        {mobile && (
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => ir(i - 1)} disabled={i === 0} aria-label="Anterior" style={flecha(i === 0)}>←</button>
            <button onClick={siguiente} aria-label="Siguiente" style={flecha(false)}>→</button>
          </div>
        )}
        <p style={{ fontSize: 12, color: "#7a7f8a", fontFamily: "sans-serif", marginTop: 14 }}>Historia ilustrativa. Financiación sujeta a aprobación crediticia.</p>
      </div>
    </div>
  );
}

const flecha = (off) => ({ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,.18)", background: "transparent", color: off ? "#454953" : "#fff", fontSize: 18 });
