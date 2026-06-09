import React, { useState, useEffect, useRef, useCallback } from "react";
import './App.css';

// ═══════════════════════════════════════════════════════════
// NORDENCARS — Página web oficial + Panel de administración
// Supabase: https://crwcshjhzwbqpxsdhrrm.supabase.co
// ═══════════════════════════════════════════════════════════

// Imágenes embebidas (reemplazables por URLs reales)
const IMG_LOGO = "/images/img_logo.png";
const IMG_GONCHI = "/images/img_gonchi.jpg";
const IMG_VW_FRONT = "/images/img_vw_front.jpg";
const IMG_VW_INT = "/images/img_vw_int.jpg";
const IMG_BMW_FULL = "/images/img_bmw_full.jpg";
const IMG_BMW_FRONT = "/images/img_bmw_front.jpg";
const IMG_BMW_INT = "/images/img_bmw_int.jpg";
// WhatsApp único del negocio — reemplaza los números personales de Ale y Gonchi.
// Se centraliza acá para no volver a hardcodear el número en cada CTA.
const WA_NORDEN      = "5493816375262";
const WA_NORDEN_DISP = "+54 9 381 637-5262";
const SUPA_URL       = "https://crwcshjhzwbqpxsdhrrm.supabase.co";
const SUPA_KEY       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd2NzaGpoendicXB4c2RocnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODg1NzUsImV4cCI6MjA5MTA2NDU3NX0.dmpr2AR38XszZzbuZuJkQUyBLo8t7czRiRmthGMt8sg";

// ERP de NordenCars — fuente única de verdad del stock.
// Las tablas vehiculos / vehiculo_fotos del Supabase de la web quedaron
// en desuso. El admin de stock de esta web tambien (ver AdminPanel).
const ERP_URL = "https://sistema.nordencars.store";


/* ─── SUPABASE CLIENT LIVIANO ──────────────────────────────────────────────── */
function sbFetch(path, opts = {}) {
  return fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}
const db = {
  sel:  (t, q = "")       => sbFetch(`${t}?${q}`).then(r => r.json()),
  ins:  (t, d)            => sbFetch(t, { method:"POST", headers:{ Prefer:"return=minimal" }, body:JSON.stringify(d) }).then(r => ({ ok: r.ok, status: r.status })),
  upd:  (t, d, col, val)  => sbFetch(`${t}?${col}=eq.${encodeURIComponent(val)}`, { method:"PATCH", body:JSON.stringify(d) }).then(r => ({ ok: r.ok })),
  del:  (t, col, val)     => sbFetch(`${t}?${col}=eq.${encodeURIComponent(val)}`, { method:"DELETE" }).then(r => ({ ok: r.ok })),
};

/* ─── CONSTANTES ───────────────────────────────────────────────────────────── */
const MARCAS_0KM = ["Toyota","Fiat","Chevrolet","BAIC","BYD","Jeep","RAM","Volkswagen","Peugeot","Ford","Haval","Citroën","KIA","BMW","MINI","Audi","Hyundai"];
const CARROCERIAS = ["Todos","Sedán","SUV","Pick-up","Hatchback","Coupé","Otro"];
const ADMIN_PASS  = "norden2025";

const STOCK_LOCAL = [
  {id:"l1",marca:"Volkswagen",modelo:"Vento GLI",version:"2.0 TSI DSG",anio:2018,tipo:"Usado",carroceria:"Sedán",precio_usd:32000000,kilometraje:68000,color:"Blanco Perlado",descripcion:"Motor turbo 2.0 TSI, DSG 6 velocidades, interior deportivo con costuras rojas. Impecable.",destacado:true,fotos:[IMG_VW_FRONT,IMG_VW_INT]},
  {id:"l2",marca:"BMW",modelo:"M235i",version:"Coupé M Sport",anio:2016,tipo:"Usado",carroceria:"Coupé",precio_usd:48000000,kilometraje:95000,color:"Estoril Blue",descripcion:"Motor inline 6 turbo 326cv, paquete M Sport, automático 8 velocidades. Una bestia.",destacado:true,fotos:[IMG_BMW_FULL,IMG_BMW_FRONT,IMG_BMW_INT]},
  {id:"l3",marca:"Toyota",modelo:"Hilux",version:"SRX 4x4 AT",anio:2022,tipo:"Usado",carroceria:"Pick-up",precio_usd:78000000,kilometraje:52000,color:"Blanco",descripcion:"La pick-up más vendida del país. Full equipada, 4x4, automática.",destacado:false,fotos:[]},
  {id:"l4",marca:"Jeep",modelo:"Compass",version:"Trailhawk 4x4",anio:2022,tipo:"Usado",carroceria:"SUV",precio_usd:52000000,kilometraje:38000,color:"Azul Hydro",descripcion:"SUV de lujo con 4x4 inteligente y cuero premium.",destacado:false,fotos:[]},
  {id:"l5",marca:"BYD",modelo:"Dolphin",version:"Plus",anio:2024,tipo:"0km",carroceria:"Hatchback",precio_usd:38000000,kilometraje:0,color:"Azul Oceano",descripcion:"100% eléctrico. 204cv, carga rápida, 400km de autonomía.",destacado:false,fotos:[]},
  {id:"l6",marca:"Chevrolet",modelo:"Tracker",version:"Premier AT",anio:2024,tipo:"0km",carroceria:"SUV",precio_usd:42000000,kilometraje:0,color:"Negro",descripcion:"SUV compacto 0km, motor turbo, cámara 360°.",destacado:false,fotos:[]},
];

const BRAND_DOMAINS = {
  "Toyota":"toyota.com","Fiat":"fiat.com","Chevrolet":"chevrolet.com",
  "BAIC":"baicmotor.com","BYD":"byd.com","Jeep":"jeep.com","RAM":"ramtrucks.com",
  "Volkswagen":"volkswagen.com","Peugeot":"peugeot.com","Ford":"ford.com",
  "Haval":"haval.com","Citroën":"citroen.com","KIA":"kia.com",
  "BMW":"bmw.com","MINI":"mini.com","Audi":"audi.com","Hyundai":"hyundai.com",
};
const FAQ = [
  {k:"financiación financiamiento cuotas",a:"Sí, trabajamos con múltiples entidades financieras para que arranques a rodar sin preocupaciones."},
  {k:"permuta cambio parte pago",a:"¡Sí! Tomamos tu vehículo como parte de pago al mejor precio del mercado."},
  {k:"garantía garantia",a:"Los 0km tienen garantía de fábrica. Los usados tienen garantía según cada caso."},
  {k:"entrega provincia envío envio",a:"Coordinamos traslado a todo el país con transportistas de confianza."},
  {k:"transferencia papeles trámite tramite",a:"Nos encargamos de todo el papeleo de forma ágil y transparente."},
  {k:"separar reservar seña seña",a:"Sí, podés reservar con una seña. Consultanos por WhatsApp."},
  {k:"ubicación ubicacion donde dirección galería mercato",a:"📍 Galería Mercato, Casco Viejo, Yerba Buena, Tucumán. Lun a Vie 9–13 y 16:30–20:30hs · Sáb 9–12:30hs."},
  {k:"horario atienden abren",a:"Lunes a viernes de 9 a 13 y de 16:30 a 20:30hs. Sábados de 9 a 12:30hs. También respondemos por WhatsApp."},
  {k:"precio valor costo",a:"Los precios varían por vehículo. Mirá nuestro stock o consultanos por WhatsApp para más info."},
];

/* ─── DESIGN TOKENS ────────────────────────────────────────────────────────── */
// Paleta de negros con leve tonalidad azul-fría para sensación premium tipo
// Audi/Vercel. Cada nivel tiene más diferenciación que la paleta plana anterior.
const C = {
  red:"#DC2626", red2:"#EF4444", redDeep:"#B91C1C",
  bg:"#0a0c10",       // base global — antes #0c0c0c
  carbon:"#0d1015",   // secciones medias — antes #0f0f0f
  zinc:"#161a21",     // cards / superficies — antes #161616
  zinc2:"#1c212a",    // hover de cards — antes #1d1d1d
  zinc3:"#232a35",    // inputs / superficies altas — antes #242424
  white:"#F5F5F5", muted:"#8a8e98", muted2:"#454953",
  border:"rgba(255,255,255,.06)",
  border2:"rgba(255,255,255,.11)",
  borderStrong:"rgba(255,255,255,.18)",
  redGlowSoft:"rgba(220,38,38,.12)",
};

/* ─── HOOKS ─────────────────────────────────────────────────────────────────── */
function useCounter(target, duration = 1400) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const raf = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started, target, duration]);
  return [ref, count];
}

function useReveal(threshold = 0.07) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0 }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(26px)", transition: `opacity .72s cubic-bezier(.16,1,.3,1) ${delay}s, transform .72s cubic-bezier(.16,1,.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function StatCounter({ value, prefix = "", suffix = "", style = {}, duration = 1600 }) {
  const num = parseInt(value.replace(/\D/g,""), 10) || 0;
  const [ref, count] = useCounter(num, duration);
  return (
    <span ref={ref} style={style}>
      {prefix}{isNaN(num) || num === 0 ? value : count}{suffix}
    </span>
  );
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

/* ─── LOADING SCREEN ────────────────────────────────────────────────────────── */
function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => setFading(true), 380);
          setTimeout(() => onDone(), 1100);
          return 100;
        }
        return p + (p < 70 ? 3 : 1.2);
      });
    }, 40);
    return () => clearInterval(iv);
  }, [onDone]);
  const pct = Math.floor(progress).toString().padStart(2, "0");
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"radial-gradient(ellipse at center, #121010 0%, #060606 65%, #030303 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:36,
      opacity: fading ? 0 : 1,
      transform: fading ? "scale(1.05)" : "scale(1)",
      transition:"opacity .8s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)",
      pointerEvents: fading ? "none" : "auto",
      overflow:"hidden",
    }}>
      {/* Líneas decorativas en las esquinas */}
      <div style={{ position:"absolute", top:24, left:24, width:40, height:1, background:C.red, opacity:.7, animation:"fadeUp .6s .1s both" }}/>
      <div style={{ position:"absolute", top:24, left:24, width:1, height:40, background:C.red, opacity:.7, animation:"fadeUp .6s .15s both" }}/>
      <div style={{ position:"absolute", bottom:24, right:24, width:40, height:1, background:C.red, opacity:.7, animation:"fadeUp .6s .2s both" }}/>
      <div style={{ position:"absolute", bottom:24, right:24, width:1, height:40, background:C.red, opacity:.7, animation:"fadeUp .6s .25s both" }}/>

      {/* Logo con glow */}
      <div style={{ position:"relative", animation:"fadeUp .8s .1s both" }}>
        <div style={{
          position:"absolute", inset:-28,
          background:"radial-gradient(circle, rgba(220,38,38,.18), transparent 70%)",
          filter:"blur(14px)",
          animation:"glowPulse 3.2s ease-in-out infinite",
        }}/>
        <img src={IMG_LOGO} alt="NordenCars" style={{ height:78, position:"relative", zIndex:1 }}/>
      </div>

      {/* Tag */}
      <div style={{ fontSize:8, letterSpacing:6, textTransform:"uppercase", color:"rgba(245,245,245,.32)", fontFamily:"sans-serif", animation:"fadeUp .8s .3s both", display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ width:18, height:1, background:"rgba(220,38,38,.6)" }}/>
        Concesionaria · Tucumán
        <span style={{ width:18, height:1, background:"rgba(220,38,38,.6)" }}/>
      </div>

      {/* Barra de progreso con shimmer */}
      <div style={{ width:280, animation:"fadeUp .8s .42s both" }}>
        <div style={{ position:"relative", width:"100%", height:2, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${progress}%`, background:C.red,
            transition:"width .08s linear",
            boxShadow:"0 0 12px rgba(220,38,38,.6)",
          }}/>
          {/* Shimmer brillante recorriendo */}
          <div style={{
            position:"absolute", top:0, left:0, height:"100%", width:"30%",
            background:"linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)",
            animation:"loadShimmer 1.4s linear infinite",
          }}/>
        </div>
        {/* Porcentaje + label */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:10 }}>
          <div style={{ fontSize:8, letterSpacing:5, textTransform:"uppercase", color:"rgba(245,245,245,.32)", fontFamily:"sans-serif" }}>
            Cargando experiencia
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:C.white, letterSpacing:2, fontVariantNumeric:"tabular-nums" }}>
            {pct}<span style={{ color:C.red }}>%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CUSTOM CURSOR ──────────────────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let x = -200, y = -200, rx = -200, ry = -200, raf;
    let clicking = false;
    let hoverState = "default"; // "default" | "interactive" | "magnetic"
    let magnetRect = null;

    const isInteractive = (el) =>
      !!el?.closest?.("a, button, [role='button'], input, textarea, select, [data-cursor='link']");

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target;
      const magnet = t?.closest?.("[data-magnetic]");
      if (magnet) {
        magnetRect = magnet.getBoundingClientRect();
        hoverState = "magnetic";
      } else if (isInteractive(t)) {
        magnetRect = null;
        hoverState = "interactive";
      } else {
        magnetRect = null;
        hoverState = "default";
      }
    };
    const down = () => { clicking = true; };
    const up   = () => { clicking = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    const loop = () => {
      // Target del ring: si magnetic, centro del elemento; si no, el cursor
      let targetX = x, targetY = y;
      if (hoverState === "magnetic" && magnetRect) {
        const cx = magnetRect.left + magnetRect.width / 2;
        const cy = magnetRect.top + magnetRect.height / 2;
        // Mezcla 70% centro + 30% cursor para no quedar 100% pegado
        targetX = cx * 0.7 + x * 0.3;
        targetY = cy * 0.7 + y * 0.3;
      }
      const ease = hoverState === "magnetic" ? 0.18 : 0.1;
      rx += (targetX - rx) * ease;
      ry += (targetY - ry) * ease;

      // Tamaños/colores según estado
      const ringSize = hoverState === "magnetic" ? 64 : (hoverState === "interactive" ? 48 : 36);
      const ringOp   = hoverState === "magnetic" ? .85 : (hoverState === "interactive" ? .70 : .55);
      const ringBg   = hoverState === "magnetic" ? "rgba(220,38,38,.10)" : "transparent";
      const ringScale = clicking ? 1.5 : 1;

      const dotScale = hoverState === "default" ? (clicking ? 0.5 : 1) : 0;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px) scale(${dotScale})`;
      }
      if (ringRef.current) {
        ringRef.current.style.width  = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.background = ringBg;
        ringRef.current.style.borderColor = `rgba(220,38,38,${ringOp})`;
        ringRef.current.style.transform = `translate(${rx - ringSize/2}px, ${ry - ringSize/2}px) scale(${ringScale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); window.removeEventListener("mousedown", down); window.removeEventListener("mouseup", up); };
  }, []);
  return (
    <>
      <div ref={dotRef} style={{ position:"fixed", top:0, left:0, width:8, height:8, borderRadius:"50%", background:C.red, pointerEvents:"none", zIndex:99999, transition:"opacity .2s, background .2s", willChange:"transform" }}/>
      <div ref={ringRef} style={{ position:"fixed", top:0, left:0, width:36, height:36, borderRadius:"50%", border:`1.5px solid rgba(220,38,38,.55)`, pointerEvents:"none", zIndex:99998, transition:"width .25s cubic-bezier(.16,1,.3,1), height .25s cubic-bezier(.16,1,.3,1), background .25s, border-color .25s", willChange:"transform" }}/>
    </>
  );
}

/* ─── PARTICLES ─────────────────────────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let w = c.width = c.offsetWidth, h = c.height = c.offsetHeight;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*.2, vy: (Math.random()-.5)*.2,
      r: Math.random()*1.2+.3, o: Math.random()*.25+.04,
    }));
    const lines = Array.from({ length: 14 }, (_, i) => ({
      x: -250-i*40, y: 35+i*62, vx: .85+i*.1, len: 38+i*16, o: .018+i*.003,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      lines.forEach(l => {
        ctx.save(); ctx.strokeStyle = `rgba(220,38,38,${l.o})`; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x+l.len, l.y-11); ctx.stroke(); ctx.restore();
        l.x += l.vx*2.3; if (l.x > w+400) l.x = -400;
      });
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(220,38,38,${p.o})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; });
    ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1 }} />;
}

/* ─── SECTION DIVIDERS ──────────────────────────────────────────────────────── */
function SectionDivider({ color = "rgba(220,38,38,.4)", height = 1 }) {
  return (
    <div style={{
      height,
      background: `linear-gradient(to right, transparent, ${color} 28%, ${color} 72%, transparent)`,
      pointerEvents: "none",
    }}/>
  );
}

// Corner brackets tipo viewfinder de cámara — 4 "L" rojas en las esquinas
function CornerBrackets({ size = 18, color = "rgba(220,38,38,.7)", thickness = 1, inset = 14, opacity = 1 }) {
  const corners = [
    { top: inset, left: inset,                   bt: thickness, bl: thickness },
    { top: inset, right: inset,                  bt: thickness, br: thickness },
    { bottom: inset, left: inset,                bb: thickness, bl: thickness },
    { bottom: inset, right: inset,               bb: thickness, br: thickness },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <div key={i} style={{
          position:"absolute",
          width: size, height: size,
          top: c.top, bottom: c.bottom, left: c.left, right: c.right,
          borderTop:    c.bt ? `${c.bt}px solid ${color}` : "none",
          borderBottom: c.bb ? `${c.bb}px solid ${color}` : "none",
          borderLeft:   c.bl ? `${c.bl}px solid ${color}` : "none",
          borderRight:  c.br ? `${c.br}px solid ${color}` : "none",
          opacity,
          pointerEvents:"none",
          zIndex: 5,
        }}/>
      ))}
    </>
  );
}

/* ─── SHARED UI ──────────────────────────────────────────────────────────────── */
const Tag = ({ children }) => (
  <div style={{ fontSize:9, letterSpacing:5, textTransform:"uppercase", color:C.red, marginBottom:12, display:"flex", alignItems:"center", gap:10, fontFamily:"sans-serif" }}>
    <span style={{ width:22, height:1, background:C.red, flexShrink:0 }}/>{children}
  </div>
);
const Red = ({ children }) => <span style={{ color:C.red }}>{children}</span>;
const BigH = ({ children, sz = "clamp(52px,8.5vw,108px)", style = {} }) => (
  <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:sz, fontWeight:900, lineHeight:.88, letterSpacing:-3, textTransform:"uppercase", color:C.white, ...style }}>{children}</h1>
);
const SecH = ({ children, style = {} }) => (
  <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(30px,4vw,58px)", fontWeight:800, textTransform:"uppercase", lineHeight:.92, letterSpacing:-1, color:C.white, ...style }}>{children}</h2>
);

function Btn({ children, primary, full, small, onClick, disabled = false, href, target = "_blank" }) {
  const [hov, setHov] = useState(false);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const handleMove = (e) => {
    if (!primary || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Translación máx ~6px, escalado por proximidad al centro
    setTx((e.clientX - cx) * 0.18);
    setTy((e.clientY - cy) * 0.22);
  };
  const handleLeave = () => { setHov(false); setTx(0); setTy(0); };

  const st = {
    width: full ? "100%" : "auto", display:"inline-block", textAlign:"center",
    fontSize: small ? 9 : 10, fontWeight:500, letterSpacing:2.5, textTransform:"uppercase",
    fontFamily:"sans-serif", padding: small ? "8px 16px" : "13px 30px",
    cursor: disabled ? "not-allowed" : "pointer", border:"none",
    transition:"background .3s, color .3s, box-shadow .3s, transform .25s cubic-bezier(.16,1,.3,1), outline-color .3s",
    background: primary ? (hov ? C.red2 : C.red) : "transparent",
    color: C.white, opacity: disabled ? .5 : 1, textDecoration:"none",
    outline: primary ? "none" : `1px solid ${hov ? "rgba(245,245,245,.38)" : "rgba(245,245,245,.12)"}`,
    transform: primary
      ? `translate(${tx}px, ${ty - (hov ? 1 : 0)}px)`
      : "none",
    boxShadow: primary && hov ? "0 12px 32px rgba(220,38,38,.34)" : "none",
    willChange: primary ? "transform" : "auto",
  };

  const commonProps = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: handleLeave,
    onMouseMove: handleMove,
    style: st,
    ...(primary ? { "data-magnetic": "true" } : {}),
  };

  if (href) return <a href={href} target={target} rel="noreferrer" {...commonProps}>{children}</a>;
  return <button disabled={disabled} onClick={onClick} {...commonProps}>{children}</button>;
}

const WaSvg = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* ─── CHATBOT ────────────────────────────────────────────────────────────────── */
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from:"bot", text:"¡Hola! Soy el asistente de NordenCars 🏎️ ¿En qué te puedo ayudar?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  const send = useCallback((text) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { from:"user", text }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      const lo = text.toLowerCase();
      let reply = "No tengo info específica sobre eso, pero podés escribirnos por WhatsApp 😊";
      const found = FAQ.find(f => f.k.split(" ").some(k => lo.includes(k)));
      if (found) reply = found.a;
      else if (/hola|buenas/.test(lo)) reply = "¡Hola! ¿En qué te puedo ayudar con NordenCars?";
      setTyping(false);
      setMsgs(m => [...m, { from:"bot", text: reply }]);
    }, 820);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="Preguntas frecuentes" style={{
        position:"fixed", bottom:98, right:28, zIndex:600, width:50, height:50,
        borderRadius:"50%", border:"none", background:C.red, cursor:"pointer",
        boxShadow:"0 4px 22px rgba(220,38,38,.45)", display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all .3s", transform: open ? "scale(1.08) rotate(45deg)" : "scale(1)",
      }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          }
        </svg>
        {!open && <span style={{ position:"absolute", top:-3, right:-3, width:15, height:15, borderRadius:"50%", background:"#22c55e", border:"2px solid #090909", fontSize:7, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontFamily:"sans-serif" }}>?</span>}
      </button>

      {open && (
        <div style={{ position:"fixed", bottom:158, right:28, zIndex:601, width:315, background:C.zinc, border:`1px solid ${C.border2}`, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.85)" }}>
          {/* Header */}
          <div style={{ background:C.red, padding:"13px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"#fff", fontFamily:"sans-serif" }}>Asistente NordenCars</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.7)", display:"flex", alignItems:"center", gap:4, fontFamily:"sans-serif" }}>
                <span style={{ width:5, height:5, background:"#4ade80", borderRadius:"50%", display:"inline-block" }}/>En línea
              </div>
            </div>
          </div>
          {/* Quick chips */}
          <div style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, display:"flex", flexWrap:"wrap", gap:5 }}>
            {["Financiación","Permutas","Garantía","Ubicación","Entregas"].map(t => (
              <button key={t} onClick={() => send(t)} style={{ fontSize:9, padding:"4px 9px", background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.22)", color:C.red, cursor:"pointer", fontFamily:"sans-serif", borderRadius:2 }}>{t}</button>
            ))}
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8, maxHeight:255, minHeight:170 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.from==="user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth:"84%", padding:"8px 12px", fontSize:12, lineHeight:1.5, fontFamily:"sans-serif", background: m.from==="user" ? C.red : "rgba(255,255,255,.07)", color:C.white, borderRadius: m.from==="user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px" }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex" }}>
                <div style={{ padding:"8px 12px", background:"rgba(255,255,255,.07)", borderRadius:"10px 10px 10px 2px", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:5, height:5, background:C.muted, borderRadius:"50%", animation:`dot .9s ${i*.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
          {/* Input */}
          <div style={{ padding:"9px 11px", borderTop:`1px solid ${C.border}`, display:"flex", gap:7 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send(input)}
              placeholder="Escribí tu consulta..." style={{ flex:1, background:"rgba(255,255,255,.05)", border:`1px solid ${C.border2}`, color:C.white, padding:"8px 11px", fontSize:11, fontFamily:"sans-serif", outline:"none" }}/>
            <button onClick={() => send(input)} style={{ background:C.red, border:"none", color:"#fff", padding:"0 13px", cursor:"pointer", fontSize:14 }}>→</button>
          </div>
        </div>
      )}
      <style>{`@keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </>
  );
}

/* ─── FLOAT WA ──────────────────────────────────────────────────────────────── */
function FloatWa() {
  const [hov, setHov] = useState(false);
  return (
    <a href={`https://wa.me/${WA_NORDEN}?text=Hola%2C%20vengo%20de%20la%20web%20de%20Norden%20Cars...`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        position:"fixed", bottom:28, right:28, zIndex:600, width:54, height:54, borderRadius:"50%",
        background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: hov ? "0 8px 36px rgba(18,140,126,.7)" : "0 4px 24px rgba(18,140,126,.5)",
        transform: hov ? "scale(1.1)" : "scale(1)", transition:"all .3s", cursor:"pointer",
      }}><WaSvg size={23}/></div>
    </a>
  );
}

/* ─── NAV ───────────────────────────────────────────────────────────────────── */
function Nav({ page, navTo, scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (p) => { navTo(p); setMenuOpen(false); };
  const links = [["home","Inicio"],["stock","Stock"],["nosotros","Nosotros"],["contacto","Contacto"]];

  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:400, background: scrolled ? "rgba(9,9,9,.97)" : "rgba(9,9,9,.65)", backdropFilter:"blur(20px)", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", transition:"all .4s" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 5vw", height:64 }}>
          <button onClick={() => go("home")} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <img src={IMG_LOGO} alt="NordenCars" style={{ height:34 }}/>
          </button>
          {/* Hamburger — siempre visible */}
          <button onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú" aria-expanded={menuOpen}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 4px", display:"flex", flexDirection:"column", gap:5, zIndex:2 }}>
            <span style={{ display:"block", width:24, height:2, background:menuOpen?C.red:C.white, transform:menuOpen?"rotate(45deg) translateY(7px)":"none", transition:"all .32s cubic-bezier(.16,1,.3,1)", transformOrigin:"center" }}/>
            <span style={{ display:"block", width:24, height:2, background:menuOpen?"transparent":C.white, transition:"all .32s" }}/>
            <span style={{ display:"block", width:24, height:2, background:menuOpen?C.red:C.white, transform:menuOpen?"rotate(-45deg) translateY(-7px)":"none", transition:"all .32s cubic-bezier(.16,1,.3,1)", transformOrigin:"center" }}/>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div onClick={() => setMenuOpen(false)}
        style={{ position:"fixed", inset:0, zIndex:398, background:"rgba(0,0,0,.72)", opacity:menuOpen?1:0, pointerEvents:menuOpen?"auto":"none", transition:"opacity .35s" }}/>
      {/* Drawer */}
      <div style={{ position:"fixed", top:64, right:0, bottom:0, width:280, background:"#0e0e0e", borderLeft:`1px solid ${C.border2}`, zIndex:399, transform:menuOpen?"translateX(0)":"translateX(100%)", transition:"transform .4s cubic-bezier(.16,1,.3,1)", display:"flex", flexDirection:"column", padding:"32px 24px", gap:2, overflowY:"auto" }}>
        {links.map(([p,l],i) => (
          <button key={p} onClick={() => go(p)}
            style={{ background:page===p?"rgba(220,38,38,.1)":"none", border:"none", borderLeft:page===p?`3px solid ${C.red}`:"3px solid transparent", padding:"15px 18px", cursor:"pointer", textAlign:"left", fontSize:14, letterSpacing:2, textTransform:"uppercase", fontFamily:"sans-serif", color:page===p?C.white:"rgba(245,245,245,.45)", transition:"all .22s", animationDelay:`${i*.05}s` }}>
            {l}
          </button>
        ))}
        <div style={{ height:1, background:C.border, margin:"14px 0" }}/>
        <button onClick={() => go("contacto")} style={{ background:C.red, border:"none", color:"#fff", padding:"14px 18px", cursor:"pointer", fontSize:10, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:600 }}>Consultar ahora</button>
        <button onClick={() => go("admin")} style={{ background:"none", border:`1px solid ${C.border}`, color:"rgba(255,255,255,.22)", padding:"10px 18px", cursor:"pointer", fontSize:9, letterSpacing:2, textTransform:"uppercase", fontFamily:"sans-serif", marginTop:6 }}>⚙ Admin</button>
      </div>
    </>
  );
}

/* ─── MARQUEE ───────────────────────────────────────────────────────────────── */
function Marquee() {
  const itemsTop = ["Compra Garantizada","0km y Usados","Financiación","Permutas","Yerba Buena · Tucumán","Transparencia Total","Transferencia Ágil","Marcas Premium","Sin Letras Chicas"];
  const itemsBot = ["NordenCars","Atención presencial","Tasamos tu auto","Stock seleccionado","Lun–Vie 9–13 · 16:30–20:30","Sáb 9–12:30","Galería Mercato","Casco Viejo","Confianza local","Est. 2022"];
  return (
    <div style={{ background:C.red, position:"relative", overflow:"hidden" }}>
      {/* Línea superior — 36s, normal */}
      <div style={{ overflow:"hidden", padding:"7px 0", position:"relative" }}>
        <div style={{ display:"flex", width:"max-content", animation:"marquee 36s linear infinite" }}>
          {[...Array(2)].flatMap(() => itemsTop.map((t, i) => (
            <div key={"a"+t+i} style={{ display:"flex", alignItems:"center", gap:14, padding:"0 28px", whiteSpace:"nowrap", fontSize:10, fontWeight:600, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,.92)", fontFamily:"sans-serif" }}>
              <span style={{ width:3, height:3, background:"rgba(255,255,255,.65)", borderRadius:"50%", flexShrink:0 }}/>
              {t}
            </div>
          )))}
        </div>
      </div>
      {/* Divisor sutil */}
      <div style={{ height:1, background:"rgba(0,0,0,.18)" }}/>
      {/* Línea inferior — 52s, sentido inverso para dar profundidad */}
      <div style={{ overflow:"hidden", padding:"7px 0", position:"relative", background:"rgba(0,0,0,.08)" }}>
        <div style={{ display:"flex", width:"max-content", animation:"marqueeRev 52s linear infinite" }}>
          {[...Array(2)].flatMap(() => itemsBot.map((t, i) => (
            <div key={"b"+t+i} style={{ display:"flex", alignItems:"center", gap:14, padding:"0 28px", whiteSpace:"nowrap", fontSize:9, fontWeight:500, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(255,255,255,.65)", fontFamily:"sans-serif" }}>
              <span style={{ width:3, height:3, background:"rgba(255,255,255,.4)", borderRadius:"50%", flexShrink:0 }}/>
              {t}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}

/* ─── CAR CARD ──────────────────────────────────────────────────────────────── */
function CarCard({ car, onClick }) {
  const [hov, setHov] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const img = car.fotos && car.fotos.length ? car.fotos[0] : null;
  const precio = (car.precio_ars || car.precio_usd) ? `$ ${Number(car.precio_ars || car.precio_usd).toLocaleString("es-AR")}` : "Consultar";
  const km = car.kilometraje === 0 ? "0 km" : `${Number(car.kilometraje).toLocaleString("es-AR")} km`;

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    // rotateY mapea X (izq -> +°, der -> -°), rotateX mapea Y (arriba -> +°, abajo -> -°)
    const ry = (px - 0.5) * 6;
    const rx = (0.5 - py) * 6;
    setTilt({ rx, ry, mx: px * 100, my: py * 100 });
  };
  const handleLeave = () => {
    setHov(false);
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => onClick(car)}
      style={{
        background: hov ? C.zinc2 : C.zinc,
        cursor:"pointer", position:"relative", overflow:"hidden",
        border:`1px solid ${hov ? "rgba(220,38,38,.4)" : C.border}`,
        transformStyle:"preserve-3d",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px)`
          : "perspective(900px) rotateX(0) rotateY(0) translateY(0)",
        boxShadow: hov ? "0 24px 70px rgba(0,0,0,.7)" : "none",
        transition: hov
          ? "transform .12s linear, background .3s, border-color .3s, box-shadow .3s"
          : "transform .55s cubic-bezier(.16,1,.3,1), background .3s, border-color .3s, box-shadow .3s",
        willChange:"transform",
      }}>
      {/* Spotlight que sigue al cursor */}
      <div style={{
        position:"absolute", inset:0,
        background: `radial-gradient(420px circle at ${tilt.mx}% ${tilt.my}%, rgba(220,38,38,.10), transparent 55%)`,
        opacity: hov ? 1 : 0,
        transition:"opacity .35s",
        pointerEvents:"none", zIndex:3,
      }}/>
      {/* Image */}
      <div style={{ height:200, overflow:"hidden", position:"relative", background:C.zinc3 }}>
        {img
          ? <img src={img} alt={car.modelo} style={{ width:"100%", height:"100%", objectFit:"cover", transform:hov?"scale(1.07)":"scale(1)", transition:"transform .65s cubic-bezier(.16,1,.3,1)" }}/>
          : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:46, fontWeight:900, color:"rgba(255,255,255,.03)", letterSpacing:-3 }}>{car.marca}</div>
              <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,.11)", fontFamily:"sans-serif" }}>Foto próximamente</div>
            </div>
        }
        <span style={{ position:"absolute", top:11, left:11, fontSize:8, letterSpacing:2, textTransform:"uppercase", padding:"4px 9px", background:car.tipo==="0km"?C.red:"rgba(0,0,0,.82)", color:car.tipo==="0km"?"#fff":"rgba(255,255,255,.62)", border:car.tipo==="0km"?"none":`1px solid ${C.border2}`, fontFamily:"sans-serif" }}>{car.tipo}</span>
        {car.carroceria && <span style={{ position:"absolute", top:11, right:11, fontSize:8, letterSpacing:1.5, textTransform:"uppercase", padding:"4px 9px", background:"rgba(0,0,0,.78)", color:"rgba(255,255,255,.48)", fontFamily:"sans-serif" }}>{car.carroceria}</span>}
        <div style={{ position:"absolute", bottom:0, left:0, width:hov?"100%":"0%", height:2, background:C.red, transition:"width .42s cubic-bezier(.16,1,.3,1)" }}/>
      </div>
      {/* Body */}
      <div style={{ padding:"18px 20px" }}>
        <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:4, fontFamily:"sans-serif" }}>{car.marca}</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:25, fontWeight:700, textTransform:"uppercase", color:C.white, lineHeight:1, letterSpacing:-.5, marginBottom:2 }}>{car.modelo}</div>
        {car.version && <div style={{ fontSize:10, color:C.muted, marginBottom:2, fontFamily:"sans-serif" }}>{car.version}</div>}
        <div style={{ fontSize:10, color:C.muted2, marginBottom:15, fontFamily:"sans-serif" }}>{car.anio} · {km} · {car.color||""}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:13, borderTop:`1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:C.muted2, fontFamily:"sans-serif", marginBottom:2 }}>Precio</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:21, fontWeight:700, color:C.white }}>{precio}</div>
          </div>
          <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:hov?C.red:C.muted, fontFamily:"sans-serif", transition:"color .3s" }}>Ver más →</div>
        </div>
      </div>
    </div>
  );
}

/* ─── CAR MODAL ─────────────────────────────────────────────────────────────── */
function CarModal({ car, onClose }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { document.body.style.overflow="hidden"; return () => { document.body.style.overflow=""; }; }, []);
  if (!car) return null;
  const fotos = car.fotos || [];
  const precio = (car.precio_ars || car.precio_usd) ? `$ ${Number(car.precio_ars || car.precio_usd).toLocaleString("es-AR")}` : "Consultar";
  const km = car.kilometraje===0 ? "0 km" : `${Number(car.kilometraje).toLocaleString("es-AR")} km`;
  const carEnc = encodeURIComponent(`${car.marca} ${car.modelo} ${car.anio}`);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,.9)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.zinc, width:"100%", maxWidth:820, maxHeight:"90vh", overflow:"auto", border:`1px solid ${C.border2}` }}>
        {fotos.length > 0 && (
          <div style={{ position:"relative", height:"min(60vh,460px)", background:"#0a0c10", overflow:"hidden" }}>
            {/* Fondo borroso = la misma foto, para rellenar sin recortar la real */}
            <div style={{ position:"absolute", inset:0, backgroundImage:`url(${fotos[idx]})`, backgroundSize:"cover", backgroundPosition:"center", filter:"blur(28px) brightness(.45)", transform:"scale(1.18)" }}/>
            <img src={fotos[idx]} alt={car.modelo} style={{ position:"relative", width:"100%", height:"100%", objectFit:"contain", display:"block" }}/>
            {fotos.length > 1 && <>
              <button onClick={() => setIdx(i => (i-1+fotos.length)%fotos.length)} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,.72)", border:`1px solid ${C.border2}`, color:"#fff", width:34, height:34, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
              <button onClick={() => setIdx(i => (i+1)%fotos.length)} style={{ position:"absolute", right:50, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,.72)", border:`1px solid ${C.border2}`, color:"#fff", width:34, height:34, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
              <div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
                {fotos.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width:i===idx?18:6, height:6, background:i===idx?C.red:"rgba(255,255,255,.32)", border:"none", cursor:"pointer", borderRadius:3, transition:"all .3s" }}/>)}
              </div>
            </>}
            <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,.75)", border:`1px solid ${C.border2}`, color:"#fff", width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        )}
        <div style={{ padding:26 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, flexWrap:"wrap", gap:14 }}>
            <div>
              <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, fontFamily:"sans-serif", marginBottom:6 }}>{car.marca} · {car.carroceria||""}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:42, fontWeight:900, textTransform:"uppercase", color:C.white, lineHeight:.9, letterSpacing:-1 }}>{car.modelo}</div>
              {car.version && <div style={{ fontSize:13, color:C.muted, marginTop:6, fontFamily:"sans-serif" }}>{car.version} · {car.anio}</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:C.muted2, fontFamily:"sans-serif", marginBottom:3 }}>Precio</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:700, color:C.white }}>{precio}</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>{km}</div>
            </div>
          </div>
          {car.descripcion && <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(245,245,245,.5)", marginBottom:22, fontFamily:"sans-serif" }}>{car.descripcion}</p>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:C.border, marginBottom:22 }}>
            {[["Año",car.anio],["Kilómetros",km],["Color",car.color||"—"],["Tipo",car.tipo],["Carrocería",car.carroceria||"—"],["Marca",car.marca]].map(([k,v]) => (
              <div key={k} style={{ background:C.zinc, padding:"11px 14px" }}>
                <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:C.muted2, fontFamily:"sans-serif" }}>{k}</div>
                <div style={{ fontSize:12, color:C.white, marginTop:3, fontFamily:"sans-serif" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
            <a href={`https://wa.me/${WA_NORDEN}?text=Hola%20Norden%20Cars%2C%20me%20interesa%20el%20${carEnc}`} target="_blank" rel="noreferrer"
              style={{ flex:1, background:C.red, color:"#fff", padding:"15px", textAlign:"center", fontSize:10, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:600, textDecoration:"none", display:"block", minWidth:150 }}>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FLIP CARD (services) ──────────────────────────────────────────────────── */
function FlipCard({ s }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}
      style={{ perspective:1000, cursor:"pointer", height:186 }}>
      <div style={{
        position:"relative", width:"100%", height:"100%",
        transformStyle:"preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        transition:"transform .55s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Front */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          background:C.zinc, padding:"28px 22px",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          borderBottom:`2px solid transparent`,
        }}>
          <span style={{ fontSize:26, display:"block" }}>{s.i}</span>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:700, textTransform:"uppercase", color:C.white, lineHeight:1.1, marginBottom:8 }}>{s.t}</div>
            <div style={{ fontSize:8, letterSpacing:2, color:C.muted2, textTransform:"uppercase", fontFamily:"sans-serif" }}>Ver más →</div>
          </div>
        </div>
        {/* Back */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          background:C.red, padding:"28px 22px",
          transform:"rotateY(180deg)",
          display:"flex", alignItems:"center",
        }}>
          <p style={{ fontSize:13, fontWeight:300, lineHeight:1.7, color:"rgba(255,255,255,.92)", fontFamily:"sans-serif", margin:0 }}>{s.d}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── REVIEW TILE ───────────────────────────────────────────────────────────── */
function ReviewTile({ r }) {
  return (
    <div style={{ background:C.zinc, padding:"30px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-13, left:15, fontFamily:"'Barlow Condensed',sans-serif", fontSize:115, fontWeight:900, color:C.red, opacity:.055, lineHeight:1, pointerEvents:"none" }}>"</div>
      <div style={{ display:"flex", gap:3, marginBottom:14 }}>{[...Array(r.estrellas||5)].map((_,i)=><span key={i} style={{ color:C.red, fontSize:12 }}>★</span>)}</div>
      <div style={{ fontSize:13, fontWeight:300, lineHeight:1.75, color:"rgba(245,245,245,.5)", marginBottom:20, fontFamily:"sans-serif" }}>{r.texto}</div>
      <div style={{ display:"flex", alignItems:"center", gap:10, borderTop:`1px solid ${C.border}`, paddingTop:15 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:C.red, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{(r.nombre||"?").substring(0,2).toUpperCase()}</div>
        <div>
          <div style={{ fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:.5, color:C.white, fontFamily:"sans-serif" }}>{r.nombre}</div>
          <div style={{ fontSize:9, color:C.muted2, fontFamily:"sans-serif" }}>{r.detalle}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── BRAND CARD (marcas 0km) — estilo Apple/Porsche ───────────────────────── */
// Logo + nombre siempre visibles. Hover: logo se ilumina, línea roja crece, leve scale up.
function FlipBrandCard({ brand }) {
  const [hov, setHov] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const domain = BRAND_DOMAINS[brand] || `${brand.toLowerCase()}.com`;
  const logoSrc = `https://logo.clearbit.com/${domain}`;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative",
        background: hov
          ? "linear-gradient(180deg,#1c1c1c 0%,#131313 100%)"
          : "linear-gradient(180deg,#141414 0%,#0e0e0e 100%)",
        cursor:"pointer",
        height:130,
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        gap:14,
        padding:"18px 14px",
        overflow:"hidden",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition:"transform .4s cubic-bezier(.16,1,.3,1), background .4s cubic-bezier(.16,1,.3,1)",
      }}>
      {/* Logo */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", minHeight:0 }}>
        {imgOk ? (
          <img
            src={logoSrc}
            alt={brand}
            onError={() => setImgOk(false)}
            style={{
              maxWidth:"72%",
              maxHeight:46,
              objectFit:"contain",
              filter:"brightness(0) invert(1)",
              opacity: hov ? 1 : 0.42,
              transform: hov ? "scale(1.06)" : "scale(1)",
              transition:"opacity .4s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)",
            }}
          />
        ) : (
          <div style={{
            fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:24, fontWeight:900, letterSpacing:-1,
            color: hov ? C.white : "rgba(245,245,245,.45)",
            transition:"color .4s",
          }}>{brand.toUpperCase()}</div>
        )}
      </div>
      {/* Nombre */}
      <div style={{
        fontFamily:"'Barlow Condensed',sans-serif",
        fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:2.5,
        color: hov ? C.white : "rgba(245,245,245,.42)",
        transition:"color .35s",
      }}>{brand}</div>
      {/* Línea roja inferior creciendo */}
      <div style={{
        position:"absolute", bottom:0, left:0,
        width: hov ? "100%" : "0%",
        height:2, background:C.red,
        transition:"width .45s cubic-bezier(.16,1,.3,1)",
      }}/>
    </div>
  );
}

/* ─── CLIENTES CAROUSEL ─────────────────────────────────────────────────────── */
function ClientesCarousel({ fotos = [] }) {
  if (!fotos.length) return null;
  const doubled = [...fotos, ...fotos];
  return (
    <section style={{ padding:"80px 0 60px", background:C.carbon, borderTop:`1px solid ${C.border}`, overflow:"hidden" }}>
      <Reveal><div style={{ padding:"0 5vw", marginBottom:40 }}>
        <Tag>Clientes felices</Tag>
        <SecH>Entregas <Red>recientes</Red></SecH>
      </div></Reveal>
      <div style={{ display:"flex", width:"max-content", animation:"marquee 50s linear infinite", gap:3 }}>
        {doubled.map((f,i) => (
          <div key={i} style={{ flexShrink:0, width:300, height:220, overflow:"hidden" }}>
            <img src={f.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.82) saturate(.9)", transition:"filter .4s" }}
              onMouseEnter={e => e.currentTarget.style.filter="brightness(1) saturate(1)"}
              onMouseLeave={e => e.currentTarget.style.filter="brightness(.82) saturate(.9)"}/>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── VIDEOS SECTION ─────────────────────────────────────────────────────────── */
function VideosSection({ videos = [] }) {
  const active = videos.filter(v => v.activo !== false);
  if (!active.length) return null;
  const embed = (url) => {
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
    const ig = url.match(/instagram\.com\/(?:p|reel)\/([\w-]+)/);
    if (ig) return `https://www.instagram.com/p/${ig[1]}/embed/`;
    return url;
  };
  return (
    <section style={{ padding:"100px 5vw", background:"linear-gradient(to bottom,#080808,#0c0c0c)", borderTop:`1px solid ${C.border}` }}>
      <Reveal><Tag>Contenido</Tag></Reveal>
      <Reveal delay={.1}><SecH style={{ marginBottom:48 }}>Videos <Red>destacados</Red></SecH></Reveal>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:4 }}>
        {active.map((v,i) => (
          <Reveal key={i} delay={i*.07}>
            <div style={{ background:C.zinc, overflow:"hidden", border:`1px solid ${C.border}`, transition:"border-color .3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=C.red}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
              <div style={{ position:"relative", paddingTop:"56.25%" }}>
                <iframe src={embed(v.url)} title={v.titulo||`Video ${i+1}`}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"/>
              </div>
              {v.titulo && <div style={{ padding:"14px 16px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700, textTransform:"uppercase", color:C.white, letterSpacing:.5, borderTop:`1px solid ${C.border}` }}>{v.titulo}</div>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────────────────────── */
function FooterLink({ children, onClick, href }) {
  const [hov, setHov] = useState(false);
  const style = {
    background:"none", border:"none", cursor:"pointer", padding:0,
    fontSize:11, fontWeight:300,
    color: hov ? C.white : C.muted,
    fontFamily:"sans-serif", textDecoration:"none",
    display:"inline-flex", alignItems:"center", gap:8,
    transition:"color .3s, gap .3s",
  };
  const inner = (
    <>
      <span style={{
        width: hov ? 14 : 0, height:1, background:C.red,
        transition:"width .35s cubic-bezier(.16,1,.3,1)",
      }}/>
      {children}
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</a>;
  return <button onClick={onClick} style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</button>;
}

function Footer({ navTo }) {
  const [logoHov, setLogoHov] = useState(false);
  return (
    <footer style={{
      position:"relative",
      background:"linear-gradient(to bottom, #060606 0%, #020202 100%)",
      borderTop:`1px solid ${C.border}`,
      padding:"58px 5vw 28px",
      overflow:"hidden",
    }}>
      {/* Línea roja superior con gradient */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:1,
        background:"linear-gradient(to right, transparent, rgba(220,38,38,.55) 25%, rgba(220,38,38,.55) 75%, transparent)",
      }}/>
      {/* Glow rojo sutil de fondo */}
      <div style={{
        position:"absolute", top:-80, left:"50%", transform:"translateX(-50%)",
        width:600, height:160,
        background:"radial-gradient(ellipse, rgba(220,38,38,.10), transparent 70%)",
        pointerEvents:"none",
      }}/>

      <div style={{ position:"relative", display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48, paddingBottom:40, borderBottom:`1px solid ${C.border}`, marginBottom:26 }}>
        <div>
          <button
            onClick={() => navTo("home")}
            onMouseEnter={() => setLogoHov(true)}
            onMouseLeave={() => setLogoHov(false)}
            style={{
              background:"none", border:"none", padding:0, cursor:"pointer",
              transform: logoHov ? "scale(1.04)" : "scale(1)",
              filter: logoHov ? "drop-shadow(0 4px 16px rgba(220,38,38,.35))" : "none",
              transition:"transform .35s cubic-bezier(.16,1,.3,1), filter .35s",
              marginBottom:14, display:"block",
            }}>
            <img src={IMG_LOGO} alt="NordenCars" style={{ height:54 }}/>
          </button>
          <p style={{ fontSize:11, fontWeight:300, color:C.muted, lineHeight:1.7, maxWidth:280, fontFamily:"sans-serif" }}>
            Compraventa de vehículos 0km y usados premium. Galería Mercato, Casco Viejo, Yerba Buena, Tucumán.
          </p>
          <div style={{ display:"flex", gap:14, marginTop:18 }}>
            {[
              { href:"https://www.instagram.com/norden.cars/", label:"IG" },
              { href:`https://wa.me/${WA_NORDEN}`,            label:"WA" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                style={{
                  width:34, height:34, borderRadius:"50%",
                  border:`1px solid ${C.border2}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, letterSpacing:1.5, fontFamily:"sans-serif", fontWeight:600,
                  color:C.muted, textDecoration:"none",
                  transition:"all .3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.red; e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(220,38,38,.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.color=C.muted; e.currentTarget.style.background="transparent"; }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:14, fontFamily:"sans-serif" }}>Navegación</div>
          {[["home","Inicio"],["stock","Stock"],["nosotros","Nosotros"],["contacto","Contacto"]].map(([p,l]) => (
            <div key={p} style={{ marginBottom:9 }}>
              <FooterLink onClick={() => navTo(p)}>{l}</FooterLink>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:14, fontFamily:"sans-serif" }}>Contacto</div>
          {[["https://www.instagram.com/norden.cars/","@norden.cars"],[`https://wa.me/${WA_NORDEN}`,"WhatsApp Norden Cars"]].map(([href,l]) => (
            <div key={l} style={{ marginBottom:9 }}>
              <FooterLink href={href}>{l}</FooterLink>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div style={{ fontSize:9, color:"#2a2a2a", fontFamily:"sans-serif", letterSpacing:.5 }}>© 2025 NordenCars · Todos los derechos reservados</div>
        <div style={{ fontSize:9, color:"#2a2a2a", fontFamily:"sans-serif", letterSpacing:.5, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:1, background:C.red, opacity:.6 }}/>
          Yerba Buena, Tucumán
        </div>
      </div>
    </footer>
  );
}

/* ─── ADMIN PANEL ───────────────────────────────────────────────────────────── */
function AdminPanel({ onExit }) {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState("stock");
  const [vehiculos, setVehiculos] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editCar, setEditCar] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, c, r, cfg] = await Promise.all([
        db.sel("vehiculos", "order=created_at.desc"),
        db.sel("consultas", "order=created_at.desc"),
        db.sel("resenas", "order=orden.asc"),
        db.sel("configuracion"),
      ]);
      if (Array.isArray(v)) setVehiculos(v);
      if (Array.isArray(c)) setConsultas(c);
      if (Array.isArray(r)) setResenas(r);
      if (Array.isArray(cfg)) { const m = {}; cfg.forEach(x => { m[x.clave] = x.valor; }); setConfig(m); }
    } catch { showToast("Error conectando con Supabase. Verificá tu clave anon.", false); }
    setLoading(false);
  };

  useEffect(() => { if (auth) fetchAll(); }, [auth]);

  /* LOGIN */
  if (!auth) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.carbon }}>
      <div style={{ background:C.zinc, padding:36, border:`1px solid ${C.border2}`, width:340 }}>
        <img src={IMG_LOGO} alt="NordenCars" style={{ height:34, marginBottom:22 }}/>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:5 }}>Panel Admin</div>
        <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", marginBottom:22 }}>Ingresá la contraseña para continuar</div>
        <input type="password" placeholder="Contraseña..." value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key==="Enter" && (pass===ADMIN_PASS ? setAuth(true) : showToast("Contraseña incorrecta",false))}
          style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${C.border2}`, color:C.white, padding:"11px 13px", fontSize:13, fontFamily:"sans-serif", outline:"none", marginBottom:11, boxSizing:"border-box" }}/>
        <Btn primary full onClick={() => pass===ADMIN_PASS ? setAuth(true) : showToast("Contraseña incorrecta",false)}>Ingresar</Btn>
        <button onClick={onExit} style={{ marginTop:10, background:"none", border:"none", color:C.muted, fontSize:10, cursor:"pointer", fontFamily:"sans-serif", width:"100%" }}>← Volver a la página</button>
        {toast && <div style={{ marginTop:10, padding:"10px 13px", background:toast.ok?"#16a34a":C.red, color:"#fff", fontSize:12, fontFamily:"sans-serif" }}>{toast.msg}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.carbon }}>
      {toast && <div style={{ position:"fixed", top:18, right:18, zIndex:9999, padding:"11px 18px", background:toast.ok?"#16a34a":C.red, color:"#fff", fontSize:12, fontFamily:"sans-serif", boxShadow:"0 4px 20px rgba(0,0,0,.5)", maxWidth:300 }}>{toast.msg}</div>}

      {/* Admin Header */}
      <div style={{ background:C.zinc, borderBottom:`1px solid ${C.border}`, padding:"0 5vw", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          <img src={IMG_LOGO} alt="NordenCars" style={{ height:28 }}/>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, textTransform:"uppercase", color:C.white, letterSpacing:1 }}>Panel de Administración</span>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button onClick={fetchAll} style={{ background:"rgba(255,255,255,.06)", border:`1px solid ${C.border2}`, color:C.white, padding:"6px 13px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif" }}>{loading?"Cargando...":"↻ Actualizar"}</button>
          <button onClick={onExit} style={{ background:C.red, border:"none", color:"#fff", padding:"6px 13px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif" }}>← Salir</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:C.zinc2, borderBottom:`1px solid ${C.border}`, padding:"0 5vw", display:"flex", gap:1 }}>
        {[["stock","📦 Stock"],["consultas","📩 Consultas"],["resenas","⭐ Reseñas"],["config","⚙️ Configuración"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background:"none", border:"none", borderBottom:tab===k?`2px solid ${C.red}`:"2px solid transparent", color:tab===k?C.white:C.muted, padding:"12px 14px", cursor:"pointer", fontSize:11, fontFamily:"sans-serif", transition:"color .3s" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:"34px 5vw" }}>

        {/* ── STOCK TAB ── */}
        {tab==="stock" && <>
          {/* Aviso: el stock se gestiona ahora desde el ERP, no desde aca */}
          <div style={{
            background: "linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,138,0,.08))",
            border: `2px solid ${C.red}`,
            padding: "22px 26px",
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-start",
            gap: 16
          }}>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom: 6, letterSpacing: 1 }}>
                El stock se gestiona desde el ERP
              </div>
              <p style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif", lineHeight:1.6, margin: 0 }}>
                Esta sección está desactivada. La carga, edición y eliminación de vehículos del catálogo público ahora se hace desde el sistema NordenCars ERP. Los autos en estado <strong style={{color:C.white}}>Disponible</strong> o <strong style={{color:C.white}}>Reservado</strong> aparecen automáticamente en esta web.
              </p>
              <a href="https://sistema.nordencars.store/stock" target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  background: C.red,
                  color: "#fff",
                  padding: "9px 18px",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  fontFamily: "sans-serif",
                  textDecoration: "none",
                  fontWeight: 600
                }}>
                Ir al ERP →
              </a>
            </div>
          </div>

          {/* Listado y formulario antiguos: ocultos por seguridad. El stock real
              esta en el ERP. Si quedaran filas en la tabla `vehiculos` de este
              Supabase, no afectan a la web pero conviene limpiarlas manualmente. */}
          <div style={{ display: "none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:700, textTransform:"uppercase", color:C.white }}>Vehículos <Red>({vehiculos.length})</Red></div>
              <Btn primary small>+ Agregar vehículo</Btn>
            </div>
          {showForm && <CarForm car={editCar} onSave={async (data) => {
            setLoading(true);
            const op = editCar
              ? await db.upd("vehiculos", { ...data, updated_at: new Date().toISOString() }, "id", editCar.id)
              : await db.ins("vehiculos", { ...data, activo: true });
            if (!op.ok) showToast("Error guardando. Verificá que la tabla exista en Supabase.", false);
            else { showToast(editCar ? "✓ Vehículo actualizado" : "✓ Vehículo agregado"); setShowForm(false); fetchAll(); }
            setLoading(false);
          }} onCancel={() => setShowForm(false)}/>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:2, background:C.border }}>
            {vehiculos.map(v => (
              <AdminCarCard key={v.id} v={v}
                onEdit={() => { setEditCar(v); setShowForm(true); }}
                onDelete={async () => {
                  if (!window.confirm(`¿Eliminar ${v.marca} ${v.modelo}?`)) return;
                  const r = await db.del("vehiculos","id",v.id);
                  if (!r.ok) showToast("Error eliminando",false); else { showToast("✓ Eliminado"); fetchAll(); }
                }}
                onToggle={async () => { await db.upd("vehiculos",{activo:!v.activo},"id",v.id); fetchAll(); }}
              />
            ))}
            {vehiculos.length === 0 && !loading && (
              <div style={{ padding:"40px", color:C.muted, fontFamily:"sans-serif", fontSize:13, gridColumn:"1/-1" }}>
                No hay vehículos cargados. Hacé click en &quot;+ Agregar vehículo&quot; para empezar.
              </div>
            )}
          </div>
          </div>{/* /display:none */}
        </>}

        {/* ── CONSULTAS TAB ── */}
        {tab==="consultas" && <>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:20 }}>Consultas recibidas <Red>({consultas.length})</Red></div>
          {consultas.length === 0 && <div style={{ color:C.muted, fontFamily:"sans-serif", fontSize:13 }}>No hay consultas todavía. Aparecerán aquí cuando alguien complete el formulario de la web.</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:2, background:consultas.length?C.border:"transparent" }}>
            {consultas.map(c => (
              <div key={c.id} style={{ background:C.zinc, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:700, color:C.white }}>{c.nombre}</span>
                    <span style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", padding:"3px 8px", background:c.estado==="nueva"?C.red:"rgba(255,255,255,.07)", color:"#fff", fontFamily:"sans-serif" }}>{c.estado}</span>
                  </div>
                  {c.telefono && <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>📱 {c.telefono}</div>}
                  {c.email && <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>✉️ {c.email}</div>}
                  {c.vehiculo_interes && <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>🚗 {c.vehiculo_interes}</div>}
                  {c.mensaje && <div style={{ fontSize:12, color:"rgba(245,245,245,.45)", marginTop:7, fontFamily:"sans-serif", lineHeight:1.5 }}>{c.mensaje}</div>}
                  <div style={{ fontSize:9, color:C.muted2, marginTop:7, fontFamily:"sans-serif" }}>{new Date(c.created_at).toLocaleString("es-AR")}</div>
                </div>
                <div style={{ display:"flex", gap:5, flexDirection:"column", flexShrink:0 }}>
                  <a href={`https://wa.me/${(c.telefono||"").replace(/\D/g,"")||WA_NORDEN}?text=Hola%20${encodeURIComponent(c.nombre)}%2C%20te%20escribo%20de%20NordenCars!`} target="_blank" rel="noreferrer"
                    style={{ background:"#128C7E", color:"#fff", padding:"6px 10px", fontSize:9, fontFamily:"sans-serif", textDecoration:"none", textAlign:"center" }}>WA</a>
                  <select value={c.estado} onChange={async e => { await db.upd("consultas",{estado:e.target.value},"id",c.id); fetchAll(); }}
                    style={{ background:C.zinc2, border:`1px solid ${C.border2}`, color:C.white, padding:"5px", fontSize:9, fontFamily:"sans-serif", cursor:"pointer" }}>
                    {["nueva","vista","respondida","cerrada"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── RESEÑAS TAB ── */}
        {tab==="resenas" && <>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:20 }}>Reseñas <Red>({resenas.length})</Red></div>
          <div style={{ display:"flex", flexDirection:"column", gap:2, background:C.border }}>
            {resenas.map(r => (
              <div key={r.id} style={{ background:C.zinc, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:14 }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700, color:C.white }}>{r.nombre}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"sans-serif" }}>{r.detalle} · {"★".repeat(r.estrellas)}{"☆".repeat(5-r.estrellas)}</div>
                  <div style={{ fontSize:12, color:"rgba(245,245,245,.42)", marginTop:4, fontFamily:"sans-serif" }}>{r.texto}</div>
                </div>
                <button onClick={async () => { await db.upd("resenas",{activo:!r.activo},"id",r.id); fetchAll(); }}
                  style={{ background:r.activo?"rgba(22,163,74,.1)":"rgba(255,255,255,.04)", border:`1px solid ${r.activo?"#16a34a":C.border2}`, color:r.activo?"#4ade80":C.muted, padding:"5px 11px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif", whiteSpace:"nowrap" }}>
                  {r.activo?"✓ Activa":"○ Inactiva"}
                </button>
              </div>
            ))}
          </div>
        </>}

        {/* ── CONFIG TAB ── */}
        {tab==="config" && <>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:20 }}>Configuración de la página</div>
          <ConfigEditor config={config} showToast={showToast} onRefresh={fetchAll}/>
        </>}

      </div>
    </div>
  );
}

function AdminCarCard({ v, onEdit, onDelete, onToggle }) {
  return (
    <div style={{ background:C.zinc, padding:"16px 18px", opacity:v.activo?1:.45 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, fontFamily:"sans-serif" }}>{v.marca}</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:700, textTransform:"uppercase", color:C.white }}>{v.modelo}</div>
          <div style={{ fontSize:10, color:C.muted, fontFamily:"sans-serif" }}>{v.version||""} · {v.anio} · {v.tipo}</div>
        </div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:700, color:C.white }}>{v.precio_usd?`USD ${Number(v.precio_usd).toLocaleString("es-AR")}`:"—"}</div>
      </div>
      <div style={{ display:"flex", gap:5 }}>
        <button onClick={onEdit} style={{ background:"rgba(255,255,255,.06)", border:`1px solid ${C.border2}`, color:C.white, padding:"5px 12px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif", flex:1 }}>✏️ Editar</button>
        <button onClick={onToggle} style={{ background:v.activo?"rgba(255,255,255,.04)":"rgba(22,163,74,.1)", border:`1px solid ${v.activo?C.border2:"#16a34a"}`, color:v.activo?C.muted:"#4ade80", padding:"5px 10px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif" }}>{v.activo?"Ocultar":"Mostrar"}</button>
        <button onClick={onDelete} style={{ background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.28)", color:"#f87171", padding:"5px 10px", cursor:"pointer", fontSize:10 }}>🗑</button>
      </div>
    </div>
  );
}

/* ─── FORM FIELD — module level to prevent focus loss on keystroke ──────── */
function FormField({ label, k, type = "text", opts = null, d, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
      <label style={{ fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:C.muted, fontFamily:"sans-serif" }}>{label}</label>
      {opts
        ? <select value={d[k]||""} onChange={e => set(k, e.target.value)}
            style={{ background:C.zinc3, border:`1px solid ${C.border2}`, color:C.white, padding:"9px 11px", fontSize:11, fontFamily:"sans-serif", outline:"none" }}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input
            type={type}
            value={d[k]||""}
            onChange={e => set(k, type==="number" ? Number(e.target.value) : e.target.value)}
            style={{ background:C.zinc3, border:`1px solid ${C.border2}`, color:C.white, padding:"9px 11px", fontSize:11, fontFamily:"sans-serif", outline:"none", width:"100%", boxSizing:"border-box" }}
          />
      }
    </div>
  );
}

function CarForm({ car, onSave, onCancel }) {
  const blank = { marca:"",modelo:"",version:"",anio:new Date().getFullYear(),tipo:"Usado",carroceria:"Sedán",precio_usd:"",kilometraje:0,color:"",descripcion:"",destacado:false };
  const [d, setD] = useState(car ? { ...blank,...car } : blank);
  const set = (k,v) => setD(p => ({ ...p,[k]:v }));
  // FormField is defined at module level to avoid losing focus on every keystroke
  return (
    <div style={{ background:C.zinc2, border:`1px solid ${C.border2}`, padding:22, marginBottom:22 }}>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:18 }}>{car?"Editar vehículo":"Nuevo vehículo"}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <FormField label="Marca" k="marca" d={d} set={set}/>
        <FormField label="Modelo" k="modelo" d={d} set={set}/>
        <FormField label="Versión" k="version" d={d} set={set}/>
        <FormField label="Año" k="anio" type="number" d={d} set={set}/>
        <FormField label="Tipo" k="tipo" opts={["0km","Usado"]} d={d} set={set}/>
        <FormField label="Carrocería" k="carroceria" opts={["Sedán","SUV","Pick-up","Hatchback","Coupé","Otro"]} d={d} set={set}/>
        <FormField label="Precio ARS $" k="precio_usd" type="number" d={d} set={set}/>
        <FormField label="Kilómetros" k="kilometraje" type="number" d={d} set={set}/>
      </div>
      <FormField label="Color" k="color" d={d} set={set}/>
      <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
        <label style={{ fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:C.muted, fontFamily:"sans-serif" }}>Descripción</label>
        <textarea value={d.descripcion||""} onChange={e => set("descripcion",e.target.value)} rows={3}
          style={{ background:C.zinc3, border:`1px solid ${C.border2}`, color:C.white, padding:"9px 11px", fontSize:11, fontFamily:"sans-serif", resize:"vertical", outline:"none" }}/>
      </div>
      <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", marginBottom:14 }}>
        <input type="checkbox" checked={d.destacado||false} onChange={e => set("destacado",e.target.checked)}/>
        <span style={{ fontSize:11, color:C.white, fontFamily:"sans-serif" }}>Destacar en la página de inicio</span>
      </label>
      <div style={{ display:"flex", gap:9 }}>
        <Btn primary small onClick={() => onSave(d)}>💾 Guardar</Btn>
        <Btn small onClick={onCancel}>Cancelar</Btn>
      </div>
    </div>
  );
}

function ConfigEditor({ config, showToast, onRefresh }) {
  const [vals, setVals] = useState(config);
  useEffect(() => setVals(config), [config]);
  const save = async (clave, valor) => {
    const r = await db.upd("configuracion",{valor,updated_at:new Date().toISOString()},"clave",clave);
    if (!r.ok) showToast("Error guardando",false); else { showToast("✓ Guardado"); onRefresh(); }
  };
  const items = [
    ["hero_titulo","Título del Hero"],["hero_subtitulo","Subtítulo del Hero"],
    ["nosotros_texto","Texto de Nosotros"],["instagram","Instagram handle"],
    ["direccion","Dirección física"],["horario","Horario de atención"],
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {items.map(([k,label]) => (
        <div key={k} style={{ background:C.zinc, padding:"15px 18px", border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:C.muted, fontFamily:"sans-serif", marginBottom:6 }}>{label}</div>
          <div style={{ display:"flex", gap:9 }}>
            <input value={vals[k]||""} onChange={e => setVals(p => ({...p,[k]:e.target.value}))}
              style={{ flex:1, background:C.zinc2, border:`1px solid ${C.border2}`, color:C.white, padding:"9px 13px", fontSize:12, fontFamily:"sans-serif", outline:"none" }}/>
            <button onClick={() => save(k,vals[k])} style={{ background:C.red, border:"none", color:"#fff", padding:"9px 16px", cursor:"pointer", fontSize:9, fontFamily:"sans-serif" }}>Guardar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── NUMBER STAT TILE (numbers bar rojo) ───────────────────────────────── */
function NumberStatTile({ pre, n, suf, l }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, position:"relative", overflow:"hidden",
        background: hov ? "rgba(0,0,0,.22)" : "rgba(0,0,0,.13)",
        padding:"38px 16px", textAlign:"center",
        cursor:"default",
        transition:"background .35s",
      }}>
      {/* Línea blanca creciendo desde abajo en hover */}
      <div style={{
        position:"absolute", bottom:0, left:0, height:2,
        width: hov ? "100%" : "0%",
        background:"#fff",
        transition:"width .55s cubic-bezier(.16,1,.3,1)",
      }}/>
      <div style={{
        fontFamily:"'Barlow Condensed',sans-serif",
        fontSize:50, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:-2,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition:"transform .45s cubic-bezier(.16,1,.3,1)",
        fontVariantNumeric:"tabular-nums",
      }}>
        {pre}{<StatCounter value={n} duration={1600}/>}{suf}
      </div>
      <div style={{
        fontSize:8, letterSpacing:3, textTransform:"uppercase",
        color: hov ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.56)",
        marginTop:8, fontFamily:"sans-serif",
        transition:"color .35s",
      }}>{l}</div>
    </div>
  );
}

/* ─── HERO STAT ITEM (con divisor animado e indicador rojo en hover) ─────── */
function HeroStatItem({ pre, n, suf, l, last }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, padding:"18px 4vw", position:"relative",
        borderRight: !last ? `1px solid ${C.border}` : "none",
        cursor:"default",
        background: hov ? "rgba(220,38,38,.04)" : "transparent",
        transition:"background .35s",
      }}>
      {/* Línea roja superior creciendo en hover */}
      <div style={{
        position:"absolute", top:0, left:0, height:1,
        width: hov ? "100%" : "0%",
        background: C.red,
        transition:"width .55s cubic-bezier(.16,1,.3,1)",
      }}/>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:700, color:C.white, lineHeight:1 }}>
        {pre && <span style={{color:C.red}}>{pre}</span>}
        {isNaN(parseInt(n)) ? n : <StatCounter value={n} duration={1400}/>}
        {suf && <span style={{color:C.red}}>{suf}</span>}
      </div>
      <div style={{
        fontSize:8, letterSpacing:2, textTransform:"uppercase",
        color: hov ? "rgba(245,245,245,.78)" : C.muted,
        marginTop:4, fontFamily:"sans-serif",
        transition:"color .35s",
      }}>{l}</div>
    </div>
  );
}

/* ─── HOME PAGE ─────────────────────────────────────────────────────────────── */
function HomePage({ navTo, setSelectedCar, stockData, config, fotosClientes, videosData }) {
  const preview = stockData.filter(v => v.destacado).slice(0,4);
  const shown = preview.length >= 2 ? preview : stockData.slice(0,4);

  // Parallax del hero: leemos scrollY para mover el auto + opacar texto al scrollear
  const [heroScroll, setHeroScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => setHeroScroll(Math.min(window.scrollY, 800));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const heroOpacity = Math.max(0, 1 - heroScroll / 520);
  const heroLift = heroScroll * -0.18; // texto sube
  const carLift  = heroScroll * 0.28;  // auto baja

  // Título split por palabra para animación con stagger
  const titleLines = [
    { words: ["Tu", "próximo"], red: false },
    { words: ["vehículo"],       red: false },
    { words: ["fácil", "y"],     red: true  },
    { words: ["seguro."],        red: true  },
  ];
  let wIdx = 0;

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ position:"relative", height:"100vh", minHeight:680, display:"flex", alignItems:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#050505 0%,#100808 50%,#0c0c0c 100%)" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(220,38,38,.01) 0,rgba(220,38,38,.01) 1px,transparent 1px,transparent 74px)", pointerEvents:"none" }}/>
        <Particles/>
        {/* Left accent */}
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"linear-gradient(to bottom,transparent,#DC2626 22%,#DC2626 78%,transparent)" }}/>
        {/* BG car image con parallax + drift */}
        <div className="hero-bg-drift" style={{
          position:"absolute", right:0, top:0, bottom:0, width:"65%",
          backgroundImage:`url(${IMG_BMW_FULL})`, backgroundSize:"cover", backgroundPosition:"center center",
          maskImage:"linear-gradient(to right,transparent,rgba(0,0,0,.05) 12%,black 38%)",
          WebkitMaskImage:"linear-gradient(to right,transparent,rgba(0,0,0,.05) 12%,black 38%)",
          filter:"brightness(.55) saturate(.7)",
          transform:`translate3d(0, ${carLift}px, 0) scale(1.04)`,
          willChange:"transform",
        }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(5,5,5,1) 18%,rgba(5,5,5,.55) 46%,rgba(5,5,5,.08) 100%)" }}/>

        <div style={{
          position:"relative", zIndex:2, padding:"0 5vw", maxWidth:820, paddingTop:0,
          transform:`translate3d(0, ${heroLift}px, 0)`,
          opacity: heroOpacity,
          willChange:"transform, opacity",
        }}>
          <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:18, display:"flex", alignItems:"center", gap:12, fontFamily:"sans-serif", animation:"fadeUp .8s .15s both", flexWrap:"wrap", overflow:"visible" }}>
            <span style={{ width:24, height:1, background:C.red, flexShrink:0 }}/>Yerba Buena, Tucumán · Est. 2022
          </div>
          {/* Título con split + reveal palabra por palabra */}
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(56px,9.5vw,112px)", fontWeight:900, lineHeight:.88, letterSpacing:-3, textTransform:"uppercase", color:C.white, marginBottom:22 }}>
            {titleLines.map((line, li) => (
              <div key={li} style={{ display:"block", overflow:"hidden", paddingBottom:".06em" }}>
                {line.words.map((w, i) => {
                  const idx = wIdx++;
                  return (
                    <span key={`${li}-${i}`} style={{
                      display:"inline-block",
                      color: line.red ? C.red : "inherit",
                      animation:`heroWordRise .9s cubic-bezier(.16,1,.3,1) ${0.28 + idx * 0.075}s both`,
                      marginRight:"0.22em",
                    }}>{w}</span>
                  );
                })}
              </div>
            ))}
          </h1>
          <p style={{ fontSize:14, fontWeight:300, lineHeight:1.8, color:"rgba(245,245,245,.44)", maxWidth:450, marginBottom:42, fontFamily:"sans-serif", animation:"fadeUp .8s .85s both" }}>
            {config.hero_subtitulo || "Al precio justo, con la transparencia que merecés. 0km y usados seleccionados en Yerba Buena, Tucumán."}
          </p>
          <div style={{ display:"flex", gap:13, flexWrap:"wrap", animation:"fadeUp .8s 1s both" }}>
            <div className="btn-glow" style={{ display:"inline-block", borderRadius:2 }}><Btn primary onClick={() => navTo("stock")}>Ver Stock Disponible</Btn></div>
            <Btn onClick={() => navTo("contacto")}>Vender mi Auto</Btn>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", right:"5vw", bottom:88, display:"flex", flexDirection:"column", alignItems:"center", gap:9, zIndex:2, opacity: heroOpacity, transition:"opacity .25s" }}>
          <span style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"#2e2e2e", writingMode:"vertical-rl", fontFamily:"sans-serif" }}>Scroll</span>
          <div style={{ width:1, height:58, background:"linear-gradient(to bottom,#DC2626,transparent)", animation:"pulse 2s ease-in-out infinite" }}/>
        </div>

        {/* Stats bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, display:"flex", borderTop:`1px solid ${C.border}`, background:"rgba(5,5,5,.92)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", zIndex:2 }}>
          {[["+","100","","Vehículos vendidos"],["","100","%","Satisfacción"],["","17","","Marcas 0km"],["","Tucumán","","Yerba Buena"]].map(([pre,n,suf,l],i) => (
            <HeroStatItem key={i} pre={pre} n={n} suf={suf} l={l} last={i===3}/>
          ))}
        </div>
      </section>

      <Marquee/>

      {/* ── STOCK PREVIEW ── */}
      <section style={{ padding:"100px 5vw", background:"linear-gradient(to bottom,#0d0d0d,#111)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:18 }}>
          <div><Reveal><Tag>Stock destacado</Tag></Reveal><Reveal delay={.1}><SecH>Vehículos <Red>disponibles</Red></SecH></Reveal></div>
          <Reveal><Btn onClick={() => navTo("stock")}>Ver todo el stock →</Btn></Reveal>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:1, background:C.bg }}>
          {shown.map((car,i) => <Reveal key={car.id} delay={i*.07}><CarCard car={car} onClick={setSelectedCar}/></Reveal>)}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section style={{ padding:"100px 5vw", background:"linear-gradient(to bottom,#0d0d0d,#0a0a0a)", borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:44, flexWrap:"wrap", gap:18 }}>
          <div>
            <Reveal><Tag>Marcas oficiales</Tag></Reveal>
            <Reveal delay={.1}><SecH>Vendemos <Red>0km</Red></SecH></Reveal>
          </div>
          <Reveal delay={.2}>
            <p style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", letterSpacing:.3, lineHeight:1.6, maxWidth:340 }}>
              Trabajamos con las marcas líderes del mercado argentino. Pasá el cursor sobre cada una.
            </p>
          </Reveal>
        </div>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
          gap:1,
          background:"rgba(255,255,255,.04)",
        }}>
          {MARCAS_0KM.map((m,i) => <Reveal key={m} delay={i*.022}><FlipBrandCard brand={m}/></Reveal>)}
        </div>
      </section>

      {/* ── NUMBERS BAR ── */}
      <div style={{
        background:"linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #DC2626 100%)",
        display:"flex", gap:1, position:"relative", overflow:"hidden",
      }}>
        {/* Trama diagonal sutil para textura */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 60px)",
          pointerEvents:"none",
        }}/>
        {[["+","100","","Vehículos vendidos"],["","100","%","Satisfacción"],["","17","","Marcas 0km"],["","24","hs","Respuesta"]].map(([pre,n,suf,l],i) => (
          <NumberStatTile key={i} pre={pre} n={n} suf={suf} l={l}/>
        ))}
      </div>

      <SectionDivider/>

      {/* ── SERVICES (flip cards) — sección VIP con corner brackets ── */}
      <section style={{ padding:"100px 5vw", background:`linear-gradient(to bottom, ${C.bg} 0%, ${C.carbon} 100%)`, position:"relative", overflow:"hidden" }}>
        <CornerBrackets size={22} inset={28} color="rgba(220,38,38,.55)"/>
        {/* Mesh glow rojo arriba */}
        <div style={{
          position:"absolute", top:-120, left:"50%", transform:"translateX(-50%)",
          width:680, height:240,
          background:"radial-gradient(ellipse, rgba(220,38,38,.10), transparent 70%)",
          filter:"blur(24px)", pointerEvents:"none",
        }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <Reveal><Tag>Por qué elegirnos</Tag></Reveal>
          <Reveal delay={.1}><SecH style={{ marginBottom:12 }}>Nuestro <Red>compromiso</Red></SecH></Reveal>
          <Reveal delay={.15}><p style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif", marginBottom:44, letterSpacing:.5 }}>Pasá el cursor sobre cada tarjeta para conocer más.</p></Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(198px,1fr))", gap:1, background:C.borderStrong }}>
            {[{i:"🔍",t:"Stock seleccionado",d:"Cada auto pasa una revisión rigurosa antes de entrar al catálogo. Solo publicamos lo que recomendaríamos a un amigo."},
              {i:"📋",t:"Transparencia total",d:"Historial completo y documentación en orden. Sin letras chicas, sin sorpresas. Lo que acordamos es lo que firmamos."},
              {i:"💳",t:"Financiación",d:"Trabajamos con múltiples entidades. Te armamos el plan de cuotas que mejor se ajuste a tus posibilidades."},
              {i:"🔄",t:"Permutas",d:"Tomamos tu auto como parte de pago al mejor precio del mercado. Simple, rápido y sin vueltas."},
              {i:"⚡",t:"Gestión ágil",d:"Transferencia y trámites resueltos rápido. Vos solo te preocupás por estrenar tu nuevo vehículo."},
              {i:"📍",t:"Presencia local",d:"Galería Mercato, Yerba Buena. Atención presencial, personalizada y sin apuros. También por WhatsApp."},
            ].map((s,i) => <Reveal key={i} delay={i*.055}><FlipCard s={s}/></Reveal>)}
          </div>
        </div>
      </section>

      <SectionDivider/>

      {/* ── PROCESO DE COMPRA ── */}
      <section style={{ padding:"100px 5vw", background:C.bg }}>
        <Reveal><Tag>Cómo funciona</Tag></Reveal>
        <Reveal delay={.1}><SecH style={{ marginBottom:56 }}>El proceso de <Red>compra</Red></SecH></Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:1, background:C.bg }}>
          {[
            { n:"01", t:"Elegí tu auto",    d:"Explorá nuestro stock online o visitanos en Galería Mercato, Yerba Buena. Amplio catálogo 0km y usados." },
            { n:"02", t:"Consultanos",       d:"Escribinos por WhatsApp o completá el formulario. Respondemos en menos de 2 horas, lunes a sábado." },
            { n:"03", t:"Cerramos el trato", d:"Acordamos precio, método de pago y condiciones. Sin sorpresas ni letras chicas. Tu tranquilidad primero." },
            { n:"04", t:"¡A manejar!",       d:"Trámites en orden, transferencia ágil. Ya podés salir manejando tu nuevo vehículo. Así de simple." },
          ].map((s, i) => (
            <Reveal key={i} delay={i * .09}>
              <div style={{ background:C.zinc, padding:"36px 28px", position:"relative", overflow:"hidden", height:"100%" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:88, fontWeight:900, color:"rgba(220,38,38,.055)", lineHeight:1, position:"absolute", top:4, right:10, letterSpacing:-5, pointerEvents:"none", userSelect:"none" }}>{s.n}</div>
                <div style={{ width:32, height:3, background:C.red, marginBottom:20 }}/>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:10, fontFamily:"sans-serif" }}>Paso {s.n}</div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:21, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:12, lineHeight:1.05, position:"relative" }}>{s.t}</div>
                <div style={{ fontSize:12, fontWeight:300, lineHeight:1.72, color:C.muted, fontFamily:"sans-serif", position:"relative" }}>{s.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={.4}>
          <div style={{ marginTop:38, display:"flex", gap:13, flexWrap:"wrap" }}>
            <Btn primary onClick={() => navTo("stock")}>Ver stock disponible</Btn>
            <Btn href={`https://wa.me/${WA_NORDEN}?text=Hola%2C%20quiero%20empezar%20el%20proceso%20de%20compra...`}>Empezar por WhatsApp</Btn>
          </div>
        </Reveal>
      </section>

      <SectionDivider/>

      {/* ── PHOTO STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", height:210, overflow:"hidden", gap:1 }}>
        {[IMG_BMW_FULL,IMG_BMW_FRONT,IMG_VW_FRONT,IMG_VW_INT].map((img,i) => (
          <div key={i} style={{ overflow:"hidden" }}>
            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.48) saturate(.72)" }}/>
          </div>
        ))}
      </div>

      <SectionDivider/>

      {/* ── NOSOTROS PREVIEW ── */}
      <section style={{ padding:"100px 5vw", background:`linear-gradient(to bottom, ${C.bg} 0%, ${C.carbon} 100%)` }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
          <Reveal>
            <div style={{ position:"relative" }}>
              <img src={IMG_GONCHI} alt="Alejandro y Gonchi — NordenCars" style={{ width:"100%", display:"block", objectFit:"cover" }}/>
              <div style={{ position:"absolute", top:-8, right:-8, width:"36%", height:"36%", border:`2px solid ${C.red}`, zIndex:-1 }}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top,rgba(0,0,0,.88),transparent)", padding:"18px" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, textTransform:"uppercase", color:"#fff", letterSpacing:1 }}>Alejandro <Red>&</Red> Gonchi · Fundadores</div>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal><Tag>Quiénes somos</Tag></Reveal>
            <Reveal delay={.1}><SecH style={{ marginBottom:20 }}>La historia <Red>real</Red></SecH></Reveal>
            <div style={{ width:36, height:2, background:C.red, marginBottom:20 }}/>
            <Reveal delay={.2}><p style={{ fontSize:14, fontWeight:300, lineHeight:1.85, color:"rgba(245,245,245,.46)", marginBottom:18, fontFamily:"sans-serif" }}>"Hola a todos. Somos Gonchi y Ale. Lo que empezó como una pasión por los autos se formaliza con este paso. Nuestro objetivo: ayudarte a encontrar el vehículo que buscás, al precio justo y con la transparencia que merecés."</p></Reveal>
            <Reveal delay={.3}><Btn primary onClick={() => navTo("nosotros")}>Conocer nuestra historia</Btn></Reveal>
          </div>
        </div>
      </section>

      {/* ── CLIENTES FELICES ── */}
      <ClientesCarousel fotos={fotosClientes}/>

      {/* ── VIDEOS ── */}
      <VideosSection videos={videosData}/>

      <SectionDivider/>

      {/* ── LOCATION ── */}
      <section style={{ padding:"80px 5vw", background:C.zinc2, position:"relative", overflow:"hidden" }}>
        <CornerBrackets size={20} inset={26} color="rgba(220,38,38,.45)" opacity={.85}/>
        <div style={{
          position:"absolute", top:-60, right:-60,
          width:340, height:240,
          background:"radial-gradient(ellipse, rgba(220,38,38,.10), transparent 70%)",
          filter:"blur(20px)", pointerEvents:"none",
        }}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <div>
            <Reveal><Tag>Ubicación</Tag></Reveal>
            <Reveal delay={.1}><SecH style={{ marginBottom:18 }}>Encontranos en <Red>Yerba Buena</Red></SecH></Reveal>
            <Reveal delay={.2}>
              <p style={{ fontSize:14, fontWeight:300, color:"rgba(245,245,245,.46)", lineHeight:1.75, marginBottom:26, fontFamily:"sans-serif" }}>
                📍 <strong style={{ color:C.white }}>Galería Mercato, Casco Viejo</strong><br/>Yerba Buena, Tucumán, Argentina.<br/><br/>
                🕐 Lunes a viernes · 9 a 13 y 16:30 a 20:30hs<br/>Sábados · 9 a 12:30hs
              </p>
              <Btn href="https://maps.google.com/?q=Galeria+Mercato+Yerba+Buena+Tucuman">Ver en Google Maps</Btn>
            </Reveal>
          </div>
          <Reveal delay={.2}>
            <div style={{ border:`1px solid ${C.border}`, overflow:"hidden", aspectRatio:"4/3" }}>
              <iframe
                src="https://maps.google.com/maps?q=San+Lorenzo+y+Cariola,+Yerba+Buena,+Tucum%C3%A1n,+Argentina&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%" height="100%" style={{ border:0, display:"block", filter:"invert(.88) hue-rotate(180deg) saturate(.55) brightness(.8)" }}
                allowFullScreen loading="lazy"/>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection navTo={navTo}/>

      {/* ── IG STRIP ── */}
      <div style={{ background:"#030303", padding:"50px 5vw", textAlign:"center", borderTop:`1px solid ${C.border}` }}>
        <Reveal>
          <div style={{ fontSize:8, letterSpacing:5, textTransform:"uppercase", color:C.muted, marginBottom:10, fontFamily:"sans-serif" }}>Seguinos en Instagram</div>
          <a href="https://www.instagram.com/norden.cars/" target="_blank" rel="noreferrer"
            style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(36px,6vw,70px)", fontWeight:900, textTransform:"uppercase", letterSpacing:-2, color:C.white, display:"inline-block", transition:"color .3s", textDecoration:"none" }}
            onMouseEnter={e => e.currentTarget.style.color=C.red} onMouseLeave={e => e.currentTarget.style.color=C.white}>
            @norden.cars
          </a>
        </Reveal>
      </div>

      <Footer navTo={navTo}/>
    </>
  );
}

/* ─── FAQ ITEM (acordeón refinado) ───────────────────────────────────────── */
function FAQItem({ faq, isOpen, onToggle }) {
  const [hov, setHov] = useState(false);
  const contentRef = useRef(null);
  const [maxH, setMaxH] = useState(0);
  useEffect(() => {
    if (!contentRef.current) return;
    setMaxH(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen, faq.a]);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom:`1px solid ${isOpen || hov ? "rgba(220,38,38,.45)" : C.border}`,
        transition:"border-color .35s",
      }}>
      <button
        onClick={onToggle}
        style={{
          width:"100%", background:"none", border:"none", cursor:"pointer",
          padding:"22px 0", display:"flex", justifyContent:"space-between",
          alignItems:"center", gap:18, textAlign:"left",
        }}>
        <span style={{
          fontSize:14, fontWeight:400,
          color: isOpen ? C.white : (hov ? "rgba(245,245,245,.85)" : "rgba(245,245,245,.58)"),
          fontFamily:"sans-serif", transition:"color .3s, transform .35s",
          transform: isOpen || hov ? "translateX(6px)" : "translateX(0)",
          lineHeight:1.45,
        }}>{faq.q}</span>
        {/* Botón circular del "+" */}
        <span style={{
          flexShrink:0, width:30, height:30, borderRadius:"50%",
          background: isOpen ? C.red : (hov ? "rgba(220,38,38,.18)" : "rgba(255,255,255,.04)"),
          border: `1px solid ${isOpen ? C.red : (hov ? "rgba(220,38,38,.45)" : C.border2)}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: isOpen ? "#fff" : C.red,
          fontSize:18, lineHeight:1, fontFamily:"sans-serif",
          transform: isOpen ? "rotate(45deg) scale(1.06)" : (hov ? "scale(1.08)" : "scale(1)"),
          transition:"transform .42s cubic-bezier(.34,1.56,.64,1), background .3s, border-color .3s, color .3s",
        }}>+</span>
      </button>
      <div style={{
        overflow:"hidden",
        maxHeight: maxH,
        opacity: isOpen ? 1 : 0,
        transition:"max-height .5s cubic-bezier(.16,1,.3,1), opacity .35s ease",
      }}>
        <div ref={contentRef}>
          <p style={{
            fontSize:13, fontWeight:300, lineHeight:1.72, color:C.muted,
            fontFamily:"sans-serif", paddingBottom:20, paddingLeft:14,
            borderLeft:`2px solid ${C.red}`, margin:0,
          }}>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ SECTION ───────────────────────────────────────────────────────────── */
function FAQSection({ navTo }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"¿Financian la compra?",            a:"Sí, trabajamos con múltiples entidades financieras para que arranques a rodar sin preocupaciones. Consultanos y te armamos la mejor opción." },
    { q:"¿Toman mi auto como parte de pago?",a:"¡Sí! Tomamos tu vehículo como parte de pago al mejor precio del mercado. Traélo para tasarlo sin compromiso." },
    { q:"¿Los vehículos tienen garantía?",   a:"Los 0km tienen garantía de fábrica. Los usados tienen garantía según cada caso — te informamos antes de cerrar el trato." },
    { q:"¿Hacen entregas a otras provincias?",a:"Coordinamos traslado a todo el país con transportistas de confianza. El envío tiene costo adicional según destino." },
    { q:"¿Se encargan del papeleo y la transferencia?", a:"Nos encargamos de todo el papeleo de forma ágil y transparente. Vos solo manejás." },
    { q:"¿Puedo reservar un vehículo con seña?",a:"Sí, podés reservar con una seña y lo apartamos para vos. Consultanos por WhatsApp para acordar los detalles." },
    { q:"¿Dónde están ubicados?",            a:"📍 Galería Mercato, Casco Viejo, Yerba Buena, Tucumán. Atendemos lunes a viernes de 9 a 13 y de 16:30 a 20:30hs, y sábados de 9 a 12:30hs. Por WhatsApp respondemos todo el día." },
    { q:"¿Cuánto tarda el trámite de transferencia?",a:"Normalmente entre 24 y 72 horas hábiles una vez acordado el precio y verificada la documentación." },
  ];
  return (
    <section style={{ padding:"100px 5vw", background:"#090909", borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.55fr", gap:88, alignItems:"start" }}>
        <div style={{ position:"sticky", top:90 }}>
          <Reveal><Tag>Preguntas frecuentes</Tag></Reveal>
          <Reveal delay={.1}><SecH>Todo lo que<br/><Red>necesitás</Red><br/>saber</SecH></Reveal>
          <Reveal delay={.2}><p style={{ fontSize:13, fontWeight:300, color:C.muted, lineHeight:1.75, marginTop:20, marginBottom:28, fontFamily:"sans-serif" }}>¿Tenés más dudas? Escribinos directo y respondemos a la brevedad, lunes a sábado.</p></Reveal>
          <Reveal delay={.3}><Btn primary href={`https://wa.me/${WA_NORDEN}?text=Hola%2C%20tengo%20una%20consulta...`}>Consultanos por WhatsApp</Btn></Reveal>
        </div>
        <div>
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * .04}>
              <FAQItem faq={faq} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)}/>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE HEADER — header rico para subpáginas ─────────────────────── */
function PageHeader({ tag, bgWord, subtitle, children }) {
  return (
    <div style={{
      position:"relative",
      padding:"82px 5vw 64px",
      borderBottom:`1px solid ${C.border}`,
      overflow:"hidden",
      minHeight:260,
      isolation:"isolate",
    }}>
      {/* Base gradient */}
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        background:"linear-gradient(135deg,#060606 0%,#100808 45%,#0a0a0a 100%)",
      }}/>

      {/* Grid sutil */}
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        backgroundImage:"linear-gradient(to right, rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.025) 1px, transparent 1px)",
        backgroundSize:"64px 64px",
        maskImage:"radial-gradient(ellipse at center, black 30%, transparent 80%)",
        WebkitMaskImage:"radial-gradient(ellipse at center, black 30%, transparent 80%)",
        pointerEvents:"none",
      }}/>

      {/* Mesh gradient rojo en esquina superior derecha */}
      <div style={{
        position:"absolute", top:-120, right:-100, zIndex:0,
        width:540, height:420,
        background:"radial-gradient(ellipse, rgba(220,38,38,.22) 0%, rgba(220,38,38,.08) 35%, transparent 70%)",
        filter:"blur(20px)",
        pointerEvents:"none",
      }}/>
      {/* Mesh gradient secundario en esquina inferior izquierda */}
      <div style={{
        position:"absolute", bottom:-160, left:-80, zIndex:0,
        width:380, height:300,
        background:"radial-gradient(ellipse, rgba(220,38,38,.12) 0%, transparent 65%)",
        filter:"blur(28px)",
        pointerEvents:"none",
      }}/>

      {/* Big word de fondo con drift suave */}
      {bgWord && (
        <div style={{
          position:"absolute", inset:0, zIndex:0,
          display:"flex", alignItems:"center", justifyContent:"flex-end",
          paddingRight:"3vw",
          overflow:"hidden",
          pointerEvents:"none",
          maskImage:"linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
          WebkitMaskImage:"linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
        }}>
          <span style={{
            fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:"clamp(160px, 26vw, 360px)",
            fontWeight:900, letterSpacing:-12, lineHeight:.78,
            color:"transparent",
            WebkitTextStroke:"1px rgba(220,38,38,.20)",
            textTransform:"uppercase",
            whiteSpace:"nowrap",
            animation:"bgWordDrift 22s ease-in-out infinite",
            userSelect:"none",
          }}>{bgWord}</span>
        </div>
      )}

      {/* Speed lines diagonales rojas */}
      <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
        {[
          { top:"22%",  delay:"0s",   dur:"7.5s", op:.55, w:140 },
          { top:"48%",  delay:"2.4s", dur:"9s",   op:.32, w:200 },
          { top:"68%",  delay:"4.1s", dur:"6.8s", op:.42, w:170 },
          { top:"86%",  delay:"1.2s", dur:"10s",  op:.22, w:240 },
        ].map((l, i) => (
          <div key={i} style={{
            position:"absolute", top:l.top, left:0,
            width:l.w, height:1,
            background:`linear-gradient(to right, transparent, rgba(220,38,38,${l.op}), transparent)`,
            transform:"rotate(-8deg)",
            animation:`speedLine ${l.dur} linear ${l.delay} infinite`,
          }}/>
        ))}
      </div>

      {/* Partículas existentes */}
      <Particles/>

      {/* Línea roja inferior con fade lateral */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:1, zIndex:1,
        background:"linear-gradient(to right, transparent, rgba(220,38,38,.55) 30%, rgba(220,38,38,.55) 70%, transparent)",
      }}/>

      {/* Acento vertical izquierdo */}
      <div style={{
        position:"absolute", left:0, top:"22%", bottom:"22%", width:2, zIndex:1,
        background:"linear-gradient(to bottom, transparent, #DC2626 25%, #DC2626 75%, transparent)",
      }}/>

      {/* Content */}
      <div style={{ position:"relative", zIndex:3 }}>
        {tag && <Tag>{tag}</Tag>}
        <BigH sz="clamp(38px,7vw,76px)" style={{ marginBottom: subtitle ? 10 : 0 }}>{children}</BigH>
        {subtitle && (
          <p style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif", letterSpacing:.5 }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─── STOCK FILTER BAR — module level ───────────────────────────────────── */
function StockFilterBar({ label, opts, val, set }) {
  return (
    <div>
      <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.muted2, marginBottom:7, fontFamily:"sans-serif" }}>{label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
        {opts.map(o => (
          <button key={o} onClick={() => set(o)} style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"sans-serif", padding:"5px 11px", cursor:"pointer", border:"none", transition:"all .2s", background:val===o?C.red:"rgba(255,255,255,.05)", color:val===o?"#fff":C.muted }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── STOCK PAGE ─────────────────────────────────────────────────────────────── */
function StockPage({ stockData, setSelectedCar, loading }) {
  const [fType, setFType] = useState("Todos");
  const [fBrand, setFBrand] = useState("Todas");
  const [fBody, setFBody] = useState("Todos");
  const [fYear, setFYear] = useState("Todos");
  const years = ["Todos",...Array.from(new Set(stockData.map(c=>String(c.anio)))).sort((a,b)=>b-a)];
  const brands = ["Todas",...Array.from(new Set(stockData.map(c=>c.marca))).sort()];
  const filtered = stockData.filter(c => {
    if (fType!=="Todos" && c.tipo!==fType) return false;
    if (fBrand!=="Todas" && c.marca!==fBrand) return false;
    if (fBody!=="Todos" && c.carroceria!==fBody) return false;
    if (fYear!=="Todos" && String(c.anio)!==fYear) return false;
    return true;
  });
  return (
    <div style={{ paddingTop:68 }}>
      <PageHeader
        tag="Catálogo completo"
        bgWord="STOCK"
        subtitle={loading ? "Cargando vehículos..." : `${filtered.length} vehículo${filtered.length!==1?"s":""} disponible${filtered.length!==1?"s":""}`}
      >
        Stock <Red>NordenCars</Red>
      </PageHeader>
      {/* Filters */}
      <div style={{ background:"#0a0a0a", padding:"18px 5vw", borderBottom:`1px solid ${C.border}`, display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
        <StockFilterBar label="Tipo" opts={["Todos","0km","Usado"]} val={fType} set={setFType}/>
        <StockFilterBar label="Marca" opts={brands} val={fBrand} set={setFBrand}/>
        <StockFilterBar label="Carrocería" opts={CARROCERIAS} val={fBody} set={setFBody}/>
        <StockFilterBar label="Año" opts={years} val={fYear} set={setFYear}/>
        <button onClick={() => { setFType("Todos");setFBrand("Todas");setFBody("Todos");setFYear("Todos"); }}
          style={{ alignSelf:"flex-end", background:"none", border:`1px solid ${C.border2}`, color:C.muted, padding:"5px 13px", fontSize:8, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontFamily:"sans-serif" }}>× Limpiar</button>
      </div>
      {/* Grid */}
      <div style={{ padding:"46px 5vw", background:"linear-gradient(to bottom,#0d0d0d,#111)" }}>
        {filtered.length === 0
          ? <div style={{ textAlign:"center", padding:"70px 0", color:C.muted, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>🔍</div>
              <div style={{ fontSize:15, marginBottom:5 }}>No hay vehículos con esos filtros</div>
              <div style={{ fontSize:11, color:C.muted2 }}>Probá otros filtros o consultanos directamente</div>
            </div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:1, background:C.bg }}>
              {filtered.map(car => <CarCard key={car.id} car={car} onClick={setSelectedCar}/>)}
            </div>
        }
        <div style={{ marginTop:36, padding:"24px", background:C.zinc, border:`1px solid ${C.border}`, display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:19, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:3 }}>¿No encontrás lo que buscás?</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>Consultanos y buscamos el vehículo ideal para vos.</div>
          </div>
          <Btn primary href={`https://wa.me/${WA_NORDEN}?text=Hola%2C%20busco%20un%20veh%C3%ADculo%20espec%C3%ADfico...`}>Consultanos →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── NOSOTROS PAGE ──────────────────────────────────────────────────────────── */
function NosotrosPage({ navTo }) {
  return (
    <div style={{ paddingTop:68 }}>
      <PageHeader tag="Quiénes somos" bgWord="NOSOTROS">
        La historia <Red>real</Red>
      </PageHeader>
      <section style={{ padding:"80px 5vw", background:"#0c0c0c" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:76, alignItems:"start" }}>
          <Reveal>
            <div style={{ position:"relative" }}>
              <img src={IMG_GONCHI} alt="Alejandro y Gonchi — NordenCars" style={{ width:"100%", display:"block", objectFit:"cover" }}/>
              <div style={{ position:"absolute", top:-9, right:-9, width:"36%", height:"36%", border:`2px solid ${C.red}`, zIndex:-1 }}/>
              <div style={{ position:"absolute", bottom:-9, left:-9, width:"28%", height:"22%", background:C.red, zIndex:-1, opacity:.5 }}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px", background:"linear-gradient(to top,rgba(0,0,0,.9),transparent)" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, textTransform:"uppercase", color:"#fff", letterSpacing:1 }}>Alejandro <Red>&</Red> Gonchi · Fundadores NordenCars</div>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal><Tag>Nuestra historia</Tag></Reveal>
            <Reveal delay={.1}><SecH style={{ marginBottom:22 }}>Pasión por <Red>los autos</Red></SecH></Reveal>
            <div style={{ width:36, height:2, background:C.red, marginBottom:22 }}/>
            {["Hola a todos. Somos Gonchi y Ale, y esto es Norden Cars. Lo que empezó hace unos años como una pasión compartida por los autos y un camino recorrido en la compra-venta, se formaliza con este paso.",
              "¿Nuestro objetivo? Ayudarte a encontrar ese 0km o usado que buscás, al precio justo y con la transparencia que te merecés. No solo vendemos autos y camionetas; brindamos el servicio y la confianza que a nosotros nos gustaría recibir.",
              "Nos podés encontrar en nuestra oficina comercial en Galería Mercato, Casco Viejo, Yerba Buena, Tucumán. ¡Bienvenidos a la comunidad de Norden Cars!"
            ].map((t,i) => <Reveal key={i} delay={i*.12}><p style={{ fontSize:14, fontWeight:300, lineHeight:1.85, color:"rgba(245,245,245,.46)", marginBottom:16, fontFamily:"sans-serif" }}>"{t}"</p></Reveal>)}
            <Reveal delay={.42}>
              <div style={{ display:"flex", gap:10, marginTop:28 }}>
                <a href={`https://wa.me/${WA_NORDEN}?text=Hola%20Norden%20Cars%2C%20vengo%20de%20la%20web...`} target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"15px 18px", border:`1px solid ${C.border}`, flex:1, textDecoration:"none", transition:"border-color .3s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=C.red} onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><WaSvg size={19}/></div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, letterSpacing:1, textTransform:"uppercase", color:C.white, fontFamily:"sans-serif" }}>WhatsApp Norden Cars</div>
                    <div style={{ fontSize:10, color:C.muted, fontFamily:"sans-serif" }}>{WA_NORDEN_DISP}</div>
                  </div>
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Photo grid */}
        <div style={{ marginTop:72, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:C.border }}>
          {[IMG_BMW_FULL,IMG_BMW_INT,IMG_VW_FRONT].map((img,i) => (
            <div key={i} style={{ overflow:"hidden", aspectRatio:"4/3" }}>
              <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.55) saturate(.8)", transition:"transform .6s" }}
                onMouseEnter={e => e.target.style.transform="scale(1.05)"} onMouseLeave={e => e.target.style.transform="scale(1)"}/>
            </div>
          ))}
        </div>
      </section>
      <Footer navTo={navTo}/>
    </div>
  );
}

/* ─── CONTACT FORM FIELD — module level ─────────────────────────────────── */
function ContactFormField({ label, fkey, type = "text", form, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:11 }}>
      <label style={{ fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:C.muted, fontFamily:"sans-serif" }}>{label}</label>
      <input
        type={type}
        value={form[fkey]}
        onChange={e => set(fkey, e.target.value)}
        style={{ background:"rgba(255,255,255,.03)", border:`1px solid ${C.border2}`, color:C.white, padding:"10px 12px", fontSize:12, fontFamily:"sans-serif", outline:"none", width:"100%" }}
        onFocus={e => e.target.style.borderColor=C.red}
        onBlur={e => e.target.style.borderColor=C.border2}
      />
    </div>
  );
}

/* ─── CONTACTO PAGE ──────────────────────────────────────────────────────────── */
function ContactoPage({ config, navTo }) {
  const [form, setForm] = useState({ nombre:"",telefono:"",email:"",vehiculo_interes:"",mensaje:"" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async () => {
    if (!form.nombre.trim()) return;
    setSending(true);
    const r = await db.ins("consultas", form);
    if (r.ok) { setSent(true); setForm({ nombre:"",telefono:"",email:"",vehiculo_interes:"",mensaje:"" }); }
    setSending(false);
  };

  function WaBtn({ href, name, phone }) {
    const [hov, setHov] = useState(false);
    return (
      <a href={href} target="_blank" rel="noreferrer" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 20px", background:hov?C.zinc2:C.zinc, border:`1px solid ${hov?C.red:C.border}`, transform:hov?"translateX(6px)":"translateX(0)", transition:"all .3s", cursor:"pointer", textDecoration:"none", color:"inherit", marginBottom:2 }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transform:hov?"scale(1.08)":"scale(1)", transition:"transform .3s" }}><WaSvg size={21}/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.muted, marginBottom:3, fontFamily:"sans-serif" }}>WhatsApp oficial</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:700, textTransform:"uppercase", color:C.white }}>{name}</div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>{phone}</div>
        </div>
        <span style={{ fontSize:16, color:hov?C.red:C.muted, transition:"all .3s", transform:hov?"translateX(3px)":"none" }}>→</span>
      </a>
    );
  }

  // ContactFormField used instead (module-level component below)

  return (
    <div style={{ paddingTop:68 }}>
      <PageHeader tag="Contacto directo" bgWord="CONTACTO">
        Hablemos <Red>hoy mismo</Red>
      </PageHeader>
      <div style={{ padding:"70px 5vw", background:"#0c0c0c" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"start" }}>
          <div>
            <Reveal><Tag>WhatsApp directo</Tag></Reveal>
            <Reveal delay={.1}><p style={{ fontSize:13, fontWeight:300, color:"rgba(245,245,245,.44)", lineHeight:1.7, marginBottom:30, fontFamily:"sans-serif" }}>Escribinos directo por WhatsApp. Respondemos a la brevedad.</p></Reveal>
            <Reveal delay={.2}><WaBtn href={`https://wa.me/${WA_NORDEN}?text=Hola%20Norden%20Cars%2C%20vengo%20de%20la%20web%20de%20Norden%20Cars...`} name="Norden Cars" phone={WA_NORDEN_DISP}/></Reveal>
            <Reveal delay={.4}>
              <div style={{ marginTop:26, padding:"20px", background:C.zinc, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:10, fontFamily:"sans-serif" }}>Ubicación</div>
                <div style={{ fontSize:13, fontWeight:300, color:"rgba(245,245,245,.58)", lineHeight:1.7, fontFamily:"sans-serif" }}>
                  📍 Galería Mercato, Casco Viejo<br/>Yerba Buena, Tucumán, Argentina<br/><br/>
                  🕐 Lun a Vie: 9–13 y 16:30–20:30hs<br/>Sáb: 9–12:30hs
                </div>
                <a href="https://www.instagram.com/norden.cars/" target="_blank" rel="noreferrer" style={{ display:"block", marginTop:10, fontSize:12, color:C.red, fontFamily:"sans-serif", textDecoration:"none" }}>📷 @norden.cars</a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={.2}>
            <Tag>Formulario de consulta</Tag>
            <SecH style={{ marginBottom:7 }}>Envianos tu <Red>consulta</Red></SecH>
            <p style={{ fontSize:11, color:C.muted, marginBottom:24, fontFamily:"sans-serif", lineHeight:1.6 }}>Tu consulta queda registrada y te respondemos en menos de 2 horas, lunes a sábado.</p>
            {sent
              ? <div style={{ padding:"22px", background:"rgba(22,163,74,.1)", border:"1px solid #16a34a", color:"#4ade80", fontFamily:"sans-serif", fontSize:13 }}>✅ ¡Consulta enviada! Te contactamos a la brevedad.</div>
              : <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <ContactFormField label="Nombre *" fkey="nombre" form={form} set={set}/> <ContactFormField label="Teléfono" fkey="telefono" type="tel" form={form} set={set}/>
                  </div>
                  <ContactFormField label="Email" fkey="email" type="email" form={form} set={set}/>
                  <ContactFormField label="¿Qué vehículo buscás?" fkey="vehiculo_interes" form={form} set={set}/>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:11 }}>
                    <label style={{ fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:C.muted, fontFamily:"sans-serif" }}>Mensaje</label>
                    <textarea value={form.mensaje} onChange={e => set("mensaje",e.target.value)} rows={4} placeholder="Contanos más..."
                      style={{ background:"rgba(255,255,255,.03)", border:`1px solid ${C.border2}`, color:C.white, padding:"10px 12px", fontSize:12, fontFamily:"sans-serif", resize:"vertical", outline:"none" }}
                      onFocus={e => e.target.style.borderColor=C.red} onBlur={e => e.target.style.borderColor=C.border2}/>
                  </div>
                  <Btn primary full onClick={submit} disabled={sending}>{sending?"Enviando...":"Enviar consulta"}</Btn>
                </>
            }
          </Reveal>
        </div>
      </div>
      <Footer navTo={navTo}/>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  const [pageAnim, setPageAnim] = useState("in"); // "in" | "out"
  const [scrolled, setScrolled] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [stockData, setStockData] = useState(STOCK_LOCAL);
  const [config, setConfig] = useState({});
  const [loadingStock, setLoadingStock] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [fotosClientes, setFotosClientes] = useState([]);
  const [videosData, setVideosData] = useState([]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Smooth scroll mejorado con rueda + lerp para sensación premium
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return; // mobile/touch: scroll nativo
    const html = document.documentElement;
    const original = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    let target = window.scrollY;
    let current = window.scrollY;
    let raf = null;
    let active = false;
    const ease = 0.12;

    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        current = target;
        window.scrollTo(0, current);
        active = false;
        return;
      }
      current += diff * ease;
      window.scrollTo(0, current);
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      // No interceptar si hay un scroll interno (modal, chatbox)
      const path = e.composedPath ? e.composedPath() : [];
      for (const el of path) {
        if (!(el instanceof HTMLElement)) continue;
        const ov = getComputedStyle(el).overflowY;
        if ((ov === "auto" || ov === "scroll") && el.scrollHeight > el.clientHeight && el !== document.body && el !== html) {
          return;
        }
      }
      e.preventDefault();
      const max = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      target = Math.max(0, Math.min(max, target + e.deltaY));
      if (!active) { active = true; current = window.scrollY; raf = requestAnimationFrame(tick); }
    };
    const sync = () => { target = window.scrollY; current = window.scrollY; };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", sync);
      if (raf) cancelAnimationFrame(raf);
      html.style.scrollBehavior = original;
    };
  }, []);

  useEffect(() => {
    // Load config
    db.sel("configuracion").then(data => {
      if (Array.isArray(data) && data.length) {
        const m = {}; data.forEach(x => { m[x.clave] = x.valor; }); setConfig(m);
      }
    });
    // Cargar fotos clientes y videos en paralelo
    db.sel("fotos_clientes","activo=eq.true&order=orden.asc,created_at.desc").then(d => { if (Array.isArray(d)) setFotosClientes(d); });
    db.sel("videos","activo=eq.true&order=orden.asc,created_at.desc").then(d => { if (Array.isArray(d)) setVideosData(d); });
    // Load stock + fotos desde el ERP (fuente unica de verdad).
    // Si por algun motivo el ERP no responde, mantenemos STOCK_LOCAL como
    // fallback para que la web nunca se quede sin contenido.
    setLoadingStock(true);
    fetch(`${ERP_URL}/api/publico/stock`, { headers: { Accept: "application/json" } })
      .then(r => {
        if (!r.ok) throw new Error("ERP respondio " + r.status);
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length) {
          // El endpoint del ERP ya devuelve los campos en el formato que
          // esta web espera (marca, modelo, version, anio, kilometraje,
          // tipo, carroceria, precio_usd, color, descripcion, destacado,
          // fotos[]). No hace falta transformar aca.
          setStockData(data);
        }
        setLoadingStock(false);
      })
      .catch((e) => {
        console.warn("[NordenCars] No se pudo cargar stock del ERP:", e);
        setLoadingStock(false);
      });
  }, []);

  const navTo = (p) => {
    if (p === page) { window.scrollTo({ top:0, behavior:"smooth" }); return; }
    if (p === "admin") { setPage(p); return; } // admin sin animación
    setPageAnim("out");
    setTimeout(() => {
      setPage(p);
      window.scrollTo({ top:0, behavior:"auto" });
      requestAnimationFrame(() => setPageAnim("in"));
    }, 240);
  };

  if (page === "admin") return <AdminPanel onExit={() => { setPage("home"); setPageAnim("in"); }}/>;

  const pageStyle = {
    opacity: pageAnim === "in" ? 1 : 0,
    transform: pageAnim === "in" ? "translateY(0) scale(1)" : "translateY(14px) scale(.992)",
    transition: "opacity .42s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)",
    willChange: "opacity, transform",
  };

  return (
    <div style={{ background:C.bg, color:C.white, minHeight:"100vh", fontFamily:"'Barlow',sans-serif", fontWeight:300, overflowX:"hidden", cursor:"none" }}>
      <style>{`
        @keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
        *, *::before, *::after { cursor: none !important; }
      `}</style>

      {appLoading && <LoadingScreen onDone={() => setAppLoading(false)}/>}
      <CustomCursor/>

      <Nav page={page} navTo={navTo} scrolled={scrolled}/>

      <div style={pageStyle}>
        {page==="home"     && <HomePage navTo={navTo} setSelectedCar={setSelectedCar} stockData={stockData} config={config} fotosClientes={fotosClientes} videosData={videosData}/>}
        {page==="stock"    && <StockPage stockData={stockData} setSelectedCar={setSelectedCar} loading={loadingStock}/>}
        {page==="nosotros" && <NosotrosPage navTo={navTo}/>}
        {page==="contacto" && <ContactoPage config={config} navTo={navTo}/>}
      </div>

      {selectedCar && <CarModal car={selectedCar} onClose={() => setSelectedCar(null)}/>}

      <FloatWa/>
      <Chatbot/>
    </div>
  );
}