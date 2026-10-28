import { useEffect, useRef, useState } from "react";

/*
 * La historia de Martín (Ale, 2026-10-28): el proceso de compra contado en 8
 * escenas de dibujo animado, como historias de Instagram. Pasa sola mientras
 * está a la vista, se pausa con el mouse encima y se avanza tocando, con las
 * flechas o deslizando. Todo es SVG dibujado acá: no carga imágenes.
 * Lienzo de cada escena: 640×380, piso en y=318.
 */

const R = "#DC2626", BLANCO = "#F5F5F5", GRIS = "#8a8e98";
const LOGO = "/images/img_logo_tight.png"; // 1400×336
const PIEL_M = "#E8B48A", PIEL_A = "#C98E62";
const PISO = 318;
const DURACION = 6.5; // segundos por escena

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

const CSS = `
.hc-wave,.hc-pop,.hc-tw,.hc-spin,.hc-conf{transform-box:fill-box}
.hc-walk{animation:hcWalk 1.7s cubic-bezier(.25,.7,.3,1) both}
@keyframes hcWalk{from{transform:translateX(-190px)}to{transform:none}}
.hc-wave{transform-origin:0% 100%;animation:hcWave .9s ease-in-out .3s 4 both}
@keyframes hcWave{0%,100%{transform:rotate(0)}50%{transform:rotate(-22deg)}}
.hc-pop{transform-origin:center;animation:hcPop .55s cubic-bezier(.2,1.5,.4,1) both}
@keyframes hcPop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
.hc-fade{animation:hcFade .7s both}
@keyframes hcFade{from{opacity:0}to{opacity:1}}
.hc-draw{stroke-dasharray:420;stroke-dashoffset:420;animation:hcDraw 1.8s ease 1s forwards}
@keyframes hcDraw{to{stroke-dashoffset:0}}
.hc-tw{transform-origin:center;animation:hcTw 1.6s ease-in-out infinite}
@keyframes hcTw{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
.hc-carin{animation:hcCarIn 1.3s cubic-bezier(.2,.8,.3,1) both}
@keyframes hcCarIn{from{opacity:0;transform:translateX(160px)}to{opacity:1;transform:none}}
.hc-drive{animation:hcDrive 2.6s cubic-bezier(.55,0,.8,.4) 2.4s both}
@keyframes hcDrive{to{transform:translateX(460px)}}
.hc-spin{transform-origin:center;animation:hcSpin .5s linear infinite}
@keyframes hcSpin{to{transform:rotate(360deg)}}
.hc-bob{animation:hcBob 1.4s ease-in-out infinite}
@keyframes hcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.hc-elige{animation:hcElige 2.6s cubic-bezier(.6,0,.3,1) .6s both}
@keyframes hcElige{0%,30%{transform:translateX(0)}55%{transform:translateX(212px)}80%,100%{transform:translateX(106px)}}
.hc-folder{animation:hcFolder 1.4s cubic-bezier(.3,.8,.3,1) .5s both}
@keyframes hcFolder{from{opacity:0;transform:translate(260px,-60px) rotate(12deg)}to{opacity:1;transform:none}}
.hc-conf{transform-origin:center;animation:hcConf 2.8s linear infinite}
@keyframes hcConf{from{transform:translateY(-40px) rotate(0)}to{transform:translateY(400px) rotate(540deg)}}
.hc-prog{animation:hcProg linear both}
@keyframes hcProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hcIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.hc-svg *{animation-duration:.01s!important;animation-iteration-count:1!important;animation-delay:0s!important}}
`;

const dl = (s) => ({ animationDelay: `${s}s` });
const txt = { fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 };

/* ─── Piezas ─────────────────────────────────────────────────────────────── */

// Logo de Norden (blanco y rojo, fondo transparente).
const Logo = ({ x, y, w }) => <image href={LOGO} x={x} y={y} width={w} height={w * 336 / 1400}/>;

// Cartel de la oficina: el logo en un panel con luz de fondo.
function Cartel({ x, y, w }) {
  const h = w * 336 / 1400;
  return (
    <g>
      <rect x={x - 14} y={y - 12} width={w + 28} height={h + 24} rx="6" fill="#0a0c10" stroke="#2a303b" strokeWidth="2"/>
      <rect x={x - 6} y={y + h + 8} width={w + 12} height="3" rx="1.5" fill={R} opacity=".55"/>
      <Logo x={x} y={y} w={w}/>
    </g>
  );
}

function Fondo({ ventana = true, cartel = { x: 34, y: 34, w: 190 } }) {
  return (
    <g>
      <defs>
        <linearGradient id="hcPared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2029"/><stop offset="1" stopColor="#12151b"/></linearGradient>
        <linearGradient id="hcVidrio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#24456b"/><stop offset="1" stopColor="#0f1c2e"/></linearGradient>
      </defs>
      <rect width="640" height="380" fill="url(#hcPared)"/>
      {ventana && (
        <g>
          <rect x="404" y="38" width="196" height="150" rx="4" fill="url(#hcVidrio)" stroke="#2a303b" strokeWidth="5"/>
          <line x1="502" y1="40" x2="502" y2="186" stroke="#2a303b" strokeWidth="4"/>
          <path d="M420 60 L470 60 L430 130 Z" fill="#fff" opacity=".05"/>
          <circle cx="560" cy="78" r="16" fill="#fde68a" opacity=".55"/>
        </g>
      )}
      {cartel && <Cartel {...cartel}/>}
      <rect y={PISO} width="640" height={380 - PISO} fill="#0d1015"/>
      <line x1="0" y1={PISO} x2="640" y2={PISO} stroke="#2a303b" strokeWidth="2"/>
      <g>
        <rect x="598" y="286" width="30" height="32" rx="3" fill="#3f2a1d"/>
        <ellipse cx="606" cy="268" rx="9" ry="22" fill="#166534" transform="rotate(-20 606 268)"/>
        <ellipse cx="620" cy="266" rx="9" ry="24" fill="#15803d" transform="rotate(18 620 266)"/>
        <ellipse cx="613" cy="258" rx="8" ry="26" fill="#22863a"/>
      </g>
    </g>
  );
}

// Persona mirando a la derecha con los pies en (0,0); d=-1 la da vuelta.
function Persona({ x, d = 1, ropa, pantalon = "#1e293b", piel = PIEL_M, pelo = "#2b1d14", pose = "quieto", feliz, esc = 1, item, className, style }) {
  const oscura = "rgba(0,0,0,.25)";
  const brazo = (x1, y1, x2, y2) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ropa} strokeWidth="11" strokeLinecap="round"/>
      <circle cx={x2} cy={y2} r="5.5" fill={piel}/>
    </g>
  );
  const mano = { quieto: [16, -64], senala: [56, -112], sostiene: [47, -86], firma: [44, -80] }[pose] ?? [16, -64];
  return (
    <g className={className} style={style}>
      <g transform={`translate(${x} ${PISO}) scale(${d * esc} ${esc})`}>
        <ellipse cx="0" cy="2" rx="30" ry="5" fill="#000" opacity=".35"/>
        <rect x="-13" y="-62" width="11" height="60" rx="4" fill={pantalon}/>
        <rect x="2" y="-62" width="11" height="60" rx="4" fill={pantalon}/>
        <rect x="-17" y="-6" width="16" height="7" rx="3" fill="#0b0b0b"/>
        <rect x="1" y="-6" width="18" height="7" rx="3" fill="#0b0b0b"/>
        <line x1="-14" y1="-108" x2="-19" y2="-68" stroke={ropa} strokeWidth="11" strokeLinecap="round"/>
        <line x1="-14" y1="-108" x2="-19" y2="-68" stroke={oscura} strokeWidth="11" strokeLinecap="round"/>
        <circle cx="-19" cy="-66" r="5.5" fill={piel}/>
        <rect x="-21" y="-123" width="42" height="68" rx="15" fill={ropa}/>
        <rect x="-5" y="-131" width="10" height="10" fill={piel}/>
        <circle cx="0" cy="-149" r="20" fill={piel}/>
        <path d="M-20 -151 Q-22 -173 0 -172 Q23 -173 21 -153 Q12 -163 -2 -161 Q-14 -159 -20 -151 Z" fill={pelo}/>
        <circle cx="-3" cy="-150" r="2.3" fill="#111"/>
        <circle cx="9" cy="-150" r="2.3" fill="#111"/>
        <path d="M15 -149 q4 3 0 6" stroke="#8a5233" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {feliz
          ? <path d="M1 -140 Q8 -129 16 -141 Z" fill="#7a2b1f"/>
          : <path d="M2 -139 Q8 -134 14 -140" stroke="#7a3b1f" strokeWidth="2" fill="none" strokeLinecap="round"/>}
        {pose === "saluda" ? (
          <g className="hc-wave">{brazo(12, -110, 32, -152)}</g>
        ) : pose === "senala" ? brazo(12, -108, 56, -112)
          : pose === "sostiene" ? (
            <g>
              <path d={`M12 -108 L24 -84 L${mano[0]} ${mano[1]}`} stroke={ropa} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx={mano[0]} cy={mano[1]} r="5.5" fill={piel}/>
            </g>
          ) : pose === "firma" ? brazo(12, -108, 44, -80)
          : brazo(12, -108, 16, -66)}
        {item && <g transform={`translate(${mano[0]} ${mano[1]})`}>{item}</g>}
      </g>
    </g>
  );
}

// Auto visto de costado, mirando a la derecha, ruedas apoyadas en (0,0).
function Auto({ x, color = "#E5E7EB", esc = 1, gira, moño, className, style, children }) {
  const rueda = (cx) => (
    <g>
      <circle cx={cx} cy="-22" r="27" fill="#0a0c10"/>
      <circle cx={cx} cy="-22" r="22" fill="#141414"/>
      <g className={gira ? "hc-spin" : undefined}>
        <circle cx={cx} cy="-22" r="11" fill="#9ca3af"/>
        <line x1={cx - 10} y1="-22" x2={cx + 10} y2="-22" stroke="#4b5563" strokeWidth="2.5"/>
        <line x1={cx} y1="-32" x2={cx} y2="-12" stroke="#4b5563" strokeWidth="2.5"/>
        <circle cx={cx} cy="-22" r="3" fill="#374151"/>
      </g>
    </g>
  );
  return (
    <g className={className} style={style}>
      <g transform={`translate(${x} ${PISO}) scale(${esc})`}>
        <ellipse cx="0" cy="2" rx="145" ry="8" fill="#000" opacity=".45"/>
        <path d="M-128 -32 L-128 -56 Q-126 -66 -110 -68 L-78 -72 L-46 -104 Q-40 -110 -30 -110 L52 -110 Q64 -110 72 -100 L98 -74 L120 -68 Q132 -64 132 -50 L132 -32 Q132 -24 124 -24 L-120 -24 Q-128 -24 -128 -32 Z" fill={color}/>
        <path d="M-128 -46 L132 -46" stroke="#000" strokeOpacity=".12" strokeWidth="3"/>
        <path d="M-38 -74 L-14 -102 L14 -102 L14 -74 Z" fill="#a5c4dc" opacity=".92"/>
        <path d="M22 -74 L22 -102 L50 -102 Q58 -102 64 -95 L86 -74 Z" fill="#a5c4dc" opacity=".92"/>
        <path d="M-30 -78 L-14 -98 L-6 -98 L-22 -78 Z" fill="#fff" opacity=".35"/>
        <line x1="18" y1="-74" x2="18" y2="-30" stroke="#000" strokeOpacity=".22" strokeWidth="2"/>
        <rect x="26" y="-66" width="12" height="3.5" rx="1.5" fill="#000" opacity=".3"/>
        <path d="M121 -66 L132 -60 L132 -53 L119 -57 Z" fill="#fde68a"/>
        <rect x="-130" y="-63" width="6" height="11" rx="2" fill={R}/>
        {children}
        {rueda(-80)}{rueda(84)}
        {moño && (
          <g className="hc-pop" style={dl(1.2)}>
            <path d="M8 -110 L-26 -132 L-24 -104 Z M8 -110 L42 -132 L40 -104 Z" fill="#facc15"/>
            <circle cx="8" cy="-112" r="8" fill="#eab308"/>
            <rect x="4" y="-110" width="8" height="86" fill="#facc15" opacity=".9"/>
          </g>
        )}
      </g>
    </g>
  );
}

// Globo de diálogo; colaX es dónde apunta el piquito (en x del lienzo).
function Globo({ x, y, w, h, colaX, lineas, delay = 0, size = 20, fill = "#fff", color = "#111" }) {
  return (
    <g className="hc-pop" style={dl(delay)}>
      <rect x={x} y={y} width={w} height={h} rx="16" fill={fill}/>
      <path d={`M${colaX - 11} ${y + h - 1} L${colaX} ${y + h + 15} L${colaX + 11} ${y + h - 1} Z`} fill={fill}/>
      {lineas.map((l, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + (i - (lineas.length - 1) / 2) * (size + 2) + size * .35} textAnchor="middle" fill={color} style={txt} fontSize={size}>{l}</text>
      ))}
    </g>
  );
}

function Escritorio({ x, w, laptop, logo }) {
  return (
    <g>
      {laptop && (
        <g>
          <path d={`M${x + w / 2 - 34} 250 L${x + w / 2 - 26} 206 L${x + w / 2 + 30} 206 L${x + w / 2 + 24} 250 Z`} fill="#2a303b"/>
          <path d={`M${x + w / 2 - 20} 214 L${x + w / 2 + 22} 214 L${x + w / 2 + 18} 242 L${x + w / 2 - 25} 242 Z`} fill="#38557a"/>
        </g>
      )}
      <rect x={x} y="250" width={w} height="10" rx="2" fill="#343b48"/>
      <rect x={x + 8} y="260" width={w - 16} height={PISO - 260} fill="#1f242d"/>
      <line x1={x + 8} y1="262" x2={x + w - 8} y2="262" stroke="#000" strokeOpacity=".3" strokeWidth="3"/>
      {logo && <Logo x={x + w / 2 - Math.min(124, w - 40) / 2} y="276" w={Math.min(124, w - 40)}/>}
    </g>
  );
}

const Estrella = ({ x, y, s = 1, delay = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path className="hc-tw" style={dl(delay)} d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#fde68a"/>
  </g>
);

const Llaves = () => (
  <g>
    <circle cx="0" cy="0" r="7" fill="none" stroke="#facc15" strokeWidth="3"/>
    <rect x="5" y="-3" width="20" height="6" rx="2" fill="#facc15"/>
    <rect x="18" y="2" width="3" height="6" fill="#facc15"/>
    <rect x="-14" y="4" width="12" height="16" rx="4" fill="#111" stroke={R} strokeWidth="2"/>
  </g>
);

const Pildora = ({ x, y, w, h = 40, texto, fondo = R, color = "#fff", borde, delay = 0, size = 19 }) => (
  <g className="hc-pop" style={dl(delay)}>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fondo} stroke={borde} strokeWidth={borde ? 2 : 0}/>
    <text x={x + w / 2} y={y + h / 2 + size * .35} textAnchor="middle" fill={color} style={txt} fontSize={size} letterSpacing="1">{texto}</text>
  </g>
);

const MARTIN = { ropa: "#2563EB", piel: PIEL_M, pelo: "#2b1d14" };
const ASESOR = { ropa: R, pantalon: "#111827", piel: PIEL_A, pelo: "#111" };
const GESTOR = { ropa: "#475569", pantalon: "#1f2937", piel: "#D9A57A", pelo: "#3a2a1e" };

/* ─── Escenas ────────────────────────────────────────────────────────────── */

const ESCENAS = [
  () => (
    <g>
      <Fondo/>
      <rect x="150" y="140" width="92" height="178" fill="#0a0c10" stroke="#2a303b" strokeWidth="5"/>
      <path d="M242 140 L276 152 L276 312 L242 318 Z" fill="#232a35"/>
      <path d="M150 318 L242 318 L330 380 L60 380 Z" fill="#fde68a" opacity=".05"/>
      <Persona x={300} {...MARTIN} className="hc-walk"/>
      <Persona x={470} d={-1} {...ASESOR} pose="saluda" feliz/>
      <Globo x={360} y={66} w={210} h={50} colaX={455} lineas={["¡Bienvenido a Norden!"]} delay={1.5}/>
    </g>
  ),
  () => (
    <g>
      <Fondo cartel={false}/>
      <Escritorio x={255} w={150} laptop logo/>
      <Persona x={195} {...MARTIN}/>
      <Persona x={470} d={-1} {...ASESOR} pose="senala"/>
      <Globo x={50} y={40} w={230} h={72} colaX={185} lineas={["¿Tienen la SUV", "que vi en Instagram?"]} delay={.3}/>
      <Globo x={350} y={60} w={240} h={72} colaX={462} lineas={["¡Sí! Te cuento versión,", "km y service."]} delay={1.8} fill={R} color="#fff"/>
    </g>
  ),
  () => (
    <g>
      <Fondo/>
      <Auto x={330} esc={1.12} className="hc-carin"/>
      <Estrella x={215} y={180} delay={1.2}/>
      <Estrella x={440} y={150} s={1.3} delay={1.6}/>
      <Estrella x={395} y={232} s={.8} delay={2}/>
      <Persona x={95} {...ASESOR} pose="senala"/>
      <Persona x={565} d={-1} {...MARTIN} feliz/>
      <Globo x={448} y={42} w={170} h={50} colaX={556} lineas={["¡Esa quiero!"]} delay={1.8}/>
    </g>
  ),
  () => (
    <g>
      <Fondo ventana={false} cartel={false}/>
      <Escritorio x={250} w={160} laptop logo/>
      <Persona x={185} {...MARTIN}/>
      <Persona x={475} d={-1} {...ASESOR}/>
      <Pildora x={150} y={40} w={150} texto="ANTICIPO" delay={.4}/>
      <text className="hc-pop" style={{ ...txt, ...dl(.9) }} x="322" y="70" textAnchor="middle" fill={BLANCO} fontSize="30">+</text>
      <Pildora x={345} y={40} w={150} texto="CUOTAS" fondo="transparent" borde={BLANCO} delay={1.2}/>
      <Pildora x={195} y={98} w={260} h={38} texto="CRÉDITO PRENDARIO ✓" fondo="#16a34a" delay={2.1} size={18}/>
    </g>
  ),
  () => (
    <g>
      <Fondo ventana={false} cartel={false}/>
      <rect x="150" y="34" width="340" height="196" rx="8" fill="#0a0c10" stroke="#2a303b" strokeWidth="6"/>
      <rect x="306" y="230" width="28" height="22" fill="#2a303b"/>
      <text x="170" y="62" fill={GRIS} style={txt} fontSize="14" letterSpacing="3">PLANES</text>
      <Logo x={244} y={46} w={96}/>
      {["12 cuotas", "24 cuotas", "36 cuotas"].map((p, i) => {
        const cx = 172 + i * 106, alto = [74, 52, 36][i];
        return (
          <g key={p} className="hc-fade" style={dl(.2 + i * .15)}>
            <rect x={cx} y="74" width="92" height="140" rx="6" fill="#1c212a"/>
            <text x={cx + 46} y="98" textAnchor="middle" fill={BLANCO} style={txt} fontSize="17">{p}</text>
            <rect x={cx + 26} y={198 - alto} width="40" height={alto} rx="3" fill={R} opacity=".8"/>
            <text x={cx + 46} y={192 - alto} textAnchor="middle" fill={GRIS} style={txt} fontSize="12">cuota</text>
          </g>
        );
      })}
      <rect className="hc-elige" x="170" y="72" width="96" height="144" rx="8" fill="none" stroke="#22c55e" strokeWidth="4"/>
      <g className="hc-pop" style={dl(3.1)}>
        <circle cx="362" cy="76" r="14" fill="#22c55e"/>
        <path d="M355 76 L360 81 L369 71" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <Persona x={95} {...MARTIN} pose="senala" esc={.92} feliz/>
      <Persona x={560} d={-1} {...ASESOR} esc={.92}/>
      <Globo x={8} y={64} w={130} h={68} colaX={90} lineas={["¡Esa me", "cierra!"]} delay={3.4}/>
    </g>
  ),
  () => (
    <g>
      <Fondo ventana={false} cartel={{ x: 30, y: 34, w: 170 }}/>
      <Escritorio x={175} w={290} logo/>
      <g className="hc-fade" style={dl(.1)} transform="rotate(-3 320 140)">
        <rect x="232" y="44" width="180" height="176" rx="6" fill={BLANCO}/>
        <text x="322" y="72" textAnchor="middle" fill="#111" style={txt} fontSize="15" letterSpacing="1">CRÉDITO PRENDARIO</text>
        {[90, 104, 118, 132, 146].map((y, i) => <rect key={y} x="250" y={y} width={i % 2 ? 120 : 144} height="5" rx="2" fill="#d1d5db"/>)}
        <line x1="254" y1="196" x2="390" y2="196" stroke="#9ca3af" strokeWidth="1.5"/>
        <path className="hc-draw" d="M258 190 c10 -22 18 8 28 -6 s14 -16 22 2 s16 -10 28 -4 s12 8 22 -2 s8 -6 18 0" stroke="#1d4ed8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
      <g className="hc-pop" style={dl(.6)}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${468 + i * 4} ${118 - i * 8})`}>
            <rect width="70" height="34" rx="4" fill="#16a34a" stroke="#14532d" strokeWidth="1.5"/>
            <circle cx="35" cy="17" r="9" fill="#22c55e"/>
            <text x="35" y="22" textAnchor="middle" fill="#14532d" style={txt} fontSize="14">$</text>
          </g>
        ))}
      </g>
      <g transform="rotate(-8 505 80)"><g className="hc-pop" style={dl(3)}>
        <rect x="440" y="62" width="132" height="34" rx="4" fill="none" stroke={R} strokeWidth="3"/>
        <text x="506" y="86" textAnchor="middle" fill={R} style={txt} fontSize="18" letterSpacing="2">ANTICIPO ✓</text>
      </g></g>
      <Persona x={130} {...MARTIN} pose="firma" item={<rect x="-2" y="-16" width="4" height="22" rx="2" fill="#1d4ed8" transform="rotate(25)"/>}/>
      <Persona x={570} d={-1} {...ASESOR} feliz/>
    </g>
  ),
  () => (
    <g>
      <Fondo cartel={{ x: 44, y: 98, w: 160 }}/>
      <Auto x={460} color={R} esc={.95} moño/>
      <Persona x={150} {...MARTIN} pose="sostiene" feliz/>
      <Persona x={262} d={-1} {...ASESOR} pose="sostiene" feliz/>
      <g transform="translate(203 226)"><g className="hc-bob"><Llaves/></g></g>
      <Pildora x={60} y={34} w={270} h={38} texto="LLAVES + PAPELES PARA CIRCULAR" fondo="#fff" color="#111" delay={.8} size={16}/>
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} className="hc-conf" style={{ animationDelay: `${(i * .37) % 2.8}s` }} x={(i * 53) % 640} y="-10" width="7" height="12" rx="1.5"
          fill={[R, "#facc15", "#22c55e", "#3b82f6", BLANCO][i % 5]}/>
      ))}
    </g>
  ),
  () => (
    <g>
      <Fondo ventana={false} cartel={false}/>
      <Pildora x={52} y={36} w={170} h={36} texto="GESTORÍA NORDEN" fondo="#475569" delay={.2} size={16}/>
      <Persona x={78} {...GESTOR}/>
      <Persona x={196} d={-1} {...GESTOR} pelo="#111" piel="#C08A5E"/>
      <Escritorio x={40} w={200} logo/>
      <g className="hc-folder">
        <rect x="104" y="232" width="74" height="18" rx="2" fill="#d6a85c"/>
        <path d="M104 232 L104 226 L128 226 L134 232 Z" fill="#c4964c"/>
      </g>
      <g transform="rotate(-7 138 110)"><g className="hc-pop" style={dl(1.8)}>
        <rect x="40" y="92" width="196" height="38" rx="4" fill="rgba(220,38,38,.1)" stroke={R} strokeWidth="3"/>
        <text x="138" y="118" textAnchor="middle" fill={R} style={txt} fontSize="17" letterSpacing="1">TRANSFERENCIA EN MARCHA</text>
      </g></g>
      <g className="hc-drive">
        <path d="M300 250 L340 250 M290 270 L335 270 M305 290 L338 290" stroke={GRIS} strokeWidth="3" strokeLinecap="round" opacity=".5"/>
        <Auto x={470} color={R} esc={.9} gira>
          <circle cx="40" cy="-88" r="11" fill={PIEL_M}/>
          <path d="M29 -90 Q29 -101 40 -100 Q52 -101 51 -91 Q45 -96 38 -95 Z" fill="#2b1d14"/>
        </Auto>
        <Globo x={400} y={92} w={190} h={48} colaX={500} lineas={["¡Gracias, Norden!"]} delay={.9}/>
      </g>
    </g>
  ),
];

/* ─── Componente ─────────────────────────────────────────────────────────── */

export default function HistoriaCompra({ mobile }) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [fin, setFin] = useState(false);
  const ref = useRef(null);
  const toque = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: .45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ir = (n) => { setFin(false); setI(Math.max(0, Math.min(PASOS.length - 1, n))); };
  const siguiente = () => (i === PASOS.length - 1 ? setFin(true) : ir(i + 1));
  const corre = visible && !pausa && !fin;
  const Escena = ESCENAS[i];

  return (
    <div ref={ref} onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}
      style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.45fr) minmax(0,1fr)", gap: mobile ? 18 : 44, alignItems: "center" }}>
      <style>{CSS}</style>

      {/* Escena */}
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 80px rgba(0,0,0,.5), 0 0 60px rgba(220,38,38,.08)", background: "#12151b", userSelect: "none" }}
        onTouchStart={(e) => { toque.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current; toque.current = null;
          if (Math.abs(dx) > 40) dx < 0 ? siguiente() : ir(i - 1);
        }}>
        {/* Barritas tipo historias */}
        <div style={{ position: "absolute", top: 10, left: 12, right: 12, display: "flex", gap: 4, zIndex: 2 }}>
          {PASOS.map((_, n) => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,.22)", overflow: "hidden" }}>
              {n < i || (n === i && fin) ? <div style={{ height: "100%", background: "#fff" }}/>
                : n === i ? (
                  <div key={`p${i}`} className="hc-prog" onAnimationEnd={siguiente}
                    style={{ height: "100%", background: "#fff", transformOrigin: "left", animationDuration: `${DURACION}s`, animationPlayState: corre ? "running" : "paused" }}/>
                ) : null}
            </div>
          ))}
        </div>
        <svg key={i} className="hc-svg" viewBox="0 0 640 380" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`Paso ${i + 1}: ${PASOS[i].t}`}>
          <Escena/>
        </svg>
        {/* Tocar a los costados: atrás / adelante */}
        <button aria-label="Escena anterior" onClick={() => ir(i - 1)} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", background: "transparent", border: "none" }}/>
        <button aria-label="Escena siguiente" onClick={siguiente} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%", background: "transparent", border: "none" }}/>
        {fin && (
          <button onClick={() => ir(0)} style={{ position: "absolute", right: 14, bottom: 14, zIndex: 3, background: "rgba(10,12,16,.85)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 30, padding: "8px 16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" }}>
            ↻ Ver de nuevo
          </button>
        )}
      </div>

      {/* Texto */}
      <div>
        <div key={`t${i}`} style={{ animation: "hcIn .5s both" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: R, marginBottom: 6 }}>
            PASO {String(i + 1).padStart(2, "0")} DE {String(PASOS.length).padStart(2, "0")}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: mobile ? 30 : 38, fontWeight: 900, textTransform: "uppercase", color: BLANCO, lineHeight: 1, marginBottom: 12, letterSpacing: -.5 }}>{PASOS[i].t}</div>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: "rgba(245,245,245,.68)", fontFamily: "sans-serif", minHeight: mobile ? 0 : 74, margin: 0 }}>{PASOS[i].d}</p>
        </div>
        {!mobile && (
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px" }}>
            {PASOS.map((p, n) => (
              <button key={n} onClick={() => ir(n)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,.06)", textAlign: "left", color: n === i ? BLANCO : GRIS, fontFamily: "sans-serif", fontSize: 12.5, transition: "color .3s" }}>
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
        <p style={{ fontSize: 10.5, color: "#5b606b", fontFamily: "sans-serif", marginTop: 14 }}>Historia ilustrativa. Financiación sujeta a aprobación crediticia.</p>
      </div>
    </div>
  );
}

const flecha = (off) => ({ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,.18)", background: "transparent", color: off ? "#454953" : "#fff", fontSize: 18 });
