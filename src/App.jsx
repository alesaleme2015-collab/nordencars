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
const SUPA_URL       = "https://crwcshjhzwbqpxsdhrrm.supabase.co";
const SUPA_KEY       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd2NzaGpoendicXB4c2RocnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODg1NzUsImV4cCI6MjA5MTA2NDU3NX0.dmpr2AR38XszZzbuZuJkQUyBLo8t7czRiRmthGMt8sg";


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
  {id:"l1",marca:"Volkswagen",modelo:"Vento GLI",version:"2.0 TSI DSG",anio:2018,tipo:"Usado",carroceria:"Sedán",precio_usd:21500,kilometraje:68000,color:"Blanco Perlado",descripcion:"Motor turbo 2.0 TSI, DSG 6 velocidades, interior deportivo con costuras rojas. Impecable.",destacado:true,fotos:[IMG_VW_FRONT,IMG_VW_INT]},
  {id:"l2",marca:"BMW",modelo:"M235i",version:"Coupé M Sport",anio:2016,tipo:"Usado",carroceria:"Coupé",precio_usd:28000,kilometraje:95000,color:"Estoril Blue",descripcion:"Motor inline 6 turbo 326cv, paquete M Sport, automático 8 velocidades. Una bestia.",destacado:true,fotos:[IMG_BMW_FULL,IMG_BMW_FRONT,IMG_BMW_INT]},
  {id:"l3",marca:"Toyota",modelo:"Hilux",version:"SRX 4x4 AT",anio:2022,tipo:"Usado",carroceria:"Pick-up",precio_usd:46000,kilometraje:52000,color:"Blanco",descripcion:"La pick-up más vendida del país. Full equipada, 4x4, automática.",destacado:false,fotos:[]},
  {id:"l4",marca:"Jeep",modelo:"Compass",version:"Trailhawk 4x4",anio:2022,tipo:"Usado",carroceria:"SUV",precio_usd:27500,kilometraje:38000,color:"Azul Hydro",descripcion:"SUV de lujo con 4x4 inteligente y cuero premium.",destacado:false,fotos:[]},
  {id:"l5",marca:"BYD",modelo:"Dolphin",version:"Plus",anio:2024,tipo:"0km",carroceria:"Hatchback",precio_usd:22000,kilometraje:0,color:"Azul Oceano",descripcion:"100% eléctrico. 204cv, carga rápida, 400km de autonomía.",destacado:false,fotos:[]},
  {id:"l6",marca:"Chevrolet",modelo:"Tracker",version:"Premier AT",anio:2024,tipo:"0km",carroceria:"SUV",precio_usd:24500,kilometraje:0,color:"Negro",descripcion:"SUV compacto 0km, motor turbo, cámara 360°.",destacado:false,fotos:[]},
];
const FAQ = [
  {k:"financiación financiamiento cuotas",a:"Sí, trabajamos con múltiples entidades financieras para que arranques a rodar sin preocupaciones."},
  {k:"permuta cambio parte pago",a:"¡Sí! Tomamos tu vehículo como parte de pago al mejor precio del mercado."},
  {k:"garantía garantia",a:"Los 0km tienen garantía de fábrica. Los usados tienen garantía según cada caso."},
  {k:"entrega provincia envío envio",a:"Coordinamos traslado a todo el país con transportistas de confianza."},
  {k:"transferencia papeles trámite tramite",a:"Nos encargamos de todo el papeleo de forma ágil y transparente."},
  {k:"separar reservar seña seña",a:"Sí, podés reservar con una seña. Consultanos por WhatsApp."},
  {k:"ubicación ubicacion donde dirección galería mercato",a:"📍 Galería Mercato, Casco Viejo, Yerba Buena, Tucumán. Lun–Sáb 9 a 20hs."},
  {k:"horario atienden abren",a:"Lunes a Sábado de 9:00 a 20:00hs. También respondemos por WhatsApp."},
  {k:"precio valor costo",a:"Los precios varían por vehículo. Mirá nuestro stock o consultanos por WhatsApp para más info."},
];

/* ─── DESIGN TOKENS ────────────────────────────────────────────────────────── */
const C = {
  red:"#DC2626", red2:"#EF4444",
  bg:"#0c0c0c", carbon:"#0f0f0f", zinc:"#161616", zinc2:"#1d1d1d", zinc3:"#242424",
  white:"#F5F5F5", muted:"#888", muted2:"#444",
  border:"rgba(255,255,255,.055)", border2:"rgba(255,255,255,.10)",
};

/* ─── HOOKS ─────────────────────────────────────────────────────────────────── */
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
  const st = {
    width: full ? "100%" : "auto", display:"inline-block", textAlign:"center",
    fontSize: small ? 9 : 10, fontWeight:500, letterSpacing:2.5, textTransform:"uppercase",
    fontFamily:"sans-serif", padding: small ? "8px 16px" : "13px 30px",
    cursor: disabled ? "not-allowed" : "pointer", border:"none", transition:"all .3s",
    background: primary ? (hov ? C.red2 : C.red) : "transparent",
    color: C.white, opacity: disabled ? .5 : 1, textDecoration:"none",
    outline: primary ? "none" : `1px solid ${hov ? "rgba(245,245,245,.38)" : "rgba(245,245,245,.12)"}`,
    transform: primary && hov ? "translateY(-1px)" : "none",
    boxShadow: primary && hov ? "0 8px 28px rgba(220,38,38,.28)" : "none",
  };
  if (href) return <a href={href} target={target} rel="noreferrer" style={st} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</a>;
  return <button disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={st}>{children}</button>;
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
function FloatWa({ waAle = "5493814773142" }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={`https://wa.me/${waAle}?text=Hola%2C%20vengo%20de%20la%20web%20de%20Norden%20Cars...`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
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
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:300, background: scrolled ? "rgba(9,9,9,.97)" : "rgba(9,9,9,.55)", backdropFilter:"blur(20px)", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", transition:"all .4s" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 5vw", height:68 }}>
        <button onClick={() => navTo("home")} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <img src={IMG_LOGO} alt="NordenCars" style={{ height:36 }}/>
        </button>
        <div style={{ display:"flex", gap:26, alignItems:"center" }}>
          {[["home","Inicio"],["stock","Stock"],["nosotros","Nosotros"],["contacto","Contacto"]].map(([p,l]) => (
            <button key={p} onClick={() => navTo(p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, letterSpacing:3, textTransform:"uppercase", fontFamily:"sans-serif", color: page===p ? C.white : "rgba(245,245,245,.37)", transition:"color .3s", borderBottom: page===p ? `1px solid ${C.red}` : "1px solid transparent", paddingBottom:2 }}>{l}</button>
          ))}
          <button onClick={() => navTo("contacto")} style={{ background:C.red, border:"none", color:"#fff", padding:"9px 20px", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:500, cursor:"pointer" }}>Consultar</button>
          <button onClick={() => navTo("admin")} title="Panel de administración" style={{ background:"none", border:`1px solid ${C.border2}`, color:C.muted, padding:"7px 9px", cursor:"pointer", fontSize:11, lineHeight:1 }}>⚙</button>
        </div>
      </div>
    </nav>
  );
}

/* ─── MARQUEE ───────────────────────────────────────────────────────────────── */
function Marquee() {
  const items = ["Compra Garantizada","0km y Usados","Financiación","Permutas","Yerba Buena · Tucumán","Transparencia Total","Transferencia Ágil","Marcas Premium","Sin Letras Chicas"];
  return (
    <div style={{ overflow:"hidden", background:C.red, padding:"9px 0" }}>
      <div style={{ display:"flex", width:"max-content", animation:"marquee 36s linear infinite" }}>
        {[...Array(2)].flatMap(() => items.map((t, i) => (
          <div key={t+i} style={{ display:"flex", alignItems:"center", gap:18, padding:"0 30px", whiteSpace:"nowrap", fontSize:10, fontWeight:600, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,.88)", fontFamily:"sans-serif" }}>
            {t}<span style={{ width:4, height:4, background:"rgba(255,255,255,.4)", borderRadius:"50%", flexShrink:0 }}/>
          </div>
        )))}
      </div>
    </div>
  );
}

/* ─── CAR CARD ──────────────────────────────────────────────────────────────── */
function CarCard({ car, onClick }) {
  const [hov, setHov] = useState(false);
  const img = car.fotos && car.fotos.length ? car.fotos[0] : null;
  const precio = car.precio_usd ? `USD ${Number(car.precio_usd).toLocaleString("es-AR")}` : "Consultar";
  const km = car.kilometraje === 0 ? "0 km" : `${Number(car.kilometraje).toLocaleString("es-AR")} km`;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => onClick(car)}
      style={{ background:hov?C.zinc2:C.zinc, cursor:"pointer", position:"relative", overflow:"hidden",
        border:`1px solid ${hov?"rgba(220,38,38,.4)":C.border}`,
        transform:hov?"translateY(-6px)":"translateY(0)",
        boxShadow:hov?"0 20px 60px rgba(0,0,0,.65)":"none",
        transition:"all .4s cubic-bezier(.16,1,.3,1)" }}>
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
function CarModal({ car, onClose, waAle, waGonchi }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { document.body.style.overflow="hidden"; return () => { document.body.style.overflow=""; }; }, []);
  if (!car) return null;
  const fotos = car.fotos || [];
  const precio = car.precio_usd ? `USD ${Number(car.precio_usd).toLocaleString("es-AR")}` : "Consultar";
  const km = car.kilometraje===0 ? "0 km" : `${Number(car.kilometraje).toLocaleString("es-AR")} km`;
  const carEnc = encodeURIComponent(`${car.marca} ${car.modelo} ${car.anio}`);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,.9)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.zinc, width:"100%", maxWidth:820, maxHeight:"90vh", overflow:"auto", border:`1px solid ${C.border2}` }}>
        {fotos.length > 0 && (
          <div style={{ position:"relative", height:320, background:C.zinc3, overflow:"hidden" }}>
            <img src={fotos[idx]} alt={car.modelo} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
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
            <a href={`https://wa.me/${waAle||"5493814773142"}?text=Hola%20Alejandro%2C%20me%20interesa%20el%20${carEnc}`} target="_blank" rel="noreferrer"
              style={{ flex:1, background:C.red, color:"#fff", padding:"13px", textAlign:"center", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:500, textDecoration:"none", display:"block", minWidth:150 }}>
              Consultar con Alejandro
            </a>
            <a href={`https://wa.me/${waGonchi||"5493815184961"}?text=Hola%20Gonchi%2C%20me%20interesa%20el%20${carEnc}`} target="_blank" rel="noreferrer"
              style={{ flex:1, background:"rgba(255,255,255,.07)", border:`1px solid ${C.border2}`, color:"#fff", padding:"13px", textAlign:"center", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:500, textDecoration:"none", display:"block", minWidth:150 }}>
              Consultar con Gonchi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SERVICE TILE ──────────────────────────────────────────────────────────── */
function ServiceTile({ s }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov?C.zinc2:C.zinc, padding:"30px 22px", transition:"background .3s", position:"relative", overflow:"hidden" }}>
      <span style={{ fontSize:22, marginBottom:14, display:"block" }}>{s.i}</span>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:8 }}>{s.t}</div>
      <div style={{ fontSize:11, fontWeight:300, lineHeight:1.65, color:C.muted, fontFamily:"sans-serif" }}>{s.d}</div>
      <div style={{ position:"absolute", bottom:0, left:0, width:hov?"100%":"0%", height:2, background:C.red, transition:"width .42s cubic-bezier(.16,1,.3,1)" }}/>
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

/* ─── BRAND TILE ────────────────────────────────────────────────────────────── */
function BrandTile({ brand }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov?"#191919":"#111", padding:"17px 13px", display:"flex", flexDirection:"column", alignItems:"center", gap:5, cursor:"pointer", transition:"all .3s", border:`1px solid ${hov?"rgba(220,38,38,.2)":"transparent"}`, minWidth:92, flex:"0 0 auto" }}>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:hov?C.white:"#565656", transition:"color .3s" }}>{brand}</div>
    </div>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────────────────────── */
function Footer({ navTo }) {
  return (
    <footer style={{ background:"#040404", borderTop:`1px solid ${C.border}`, padding:"48px 5vw 28px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48, paddingBottom:36, borderBottom:`1px solid ${C.border}`, marginBottom:24 }}>
        <div>
          <img src={IMG_LOGO} alt="NordenCars" style={{ height:32, marginBottom:13 }}/>
          <p style={{ fontSize:11, fontWeight:300, color:C.muted, lineHeight:1.7, maxWidth:250, fontFamily:"sans-serif" }}>Compraventa de vehículos 0km y usados premium. Galería Mercato, Casco Viejo, Yerba Buena, Tucumán.</p>
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:14, fontFamily:"sans-serif" }}>Navegación</div>
          {[["home","Inicio"],["stock","Stock"],["nosotros","Nosotros"],["contacto","Contacto"]].map(([p,l]) => (
            <div key={p} style={{ marginBottom:7 }}>
              <button onClick={() => navTo(p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, fontWeight:300, color:C.muted, fontFamily:"sans-serif", padding:0, transition:"color .3s" }}
                onMouseEnter={e => e.target.style.color=C.white} onMouseLeave={e => e.target.style.color=C.muted}>{l}</button>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:14, fontFamily:"sans-serif" }}>Contacto</div>
          {[["https://www.instagram.com/norden.cars/","@norden.cars"],["https://wa.me/5493814773142","Alejandro (WA)"],["https://wa.me/5493815184961","Gonchi (WA)"]].map(([href,l]) => (
            <div key={l} style={{ marginBottom:7 }}>
              <a href={href} target="_blank" rel="noreferrer" style={{ fontSize:11, fontWeight:300, color:C.muted, textDecoration:"none", transition:"color .3s" }}
                onMouseEnter={e => e.target.style.color=C.white} onMouseLeave={e => e.target.style.color=C.muted}>{l}</a>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:9, color:"#2a2a2a", fontFamily:"sans-serif" }}>© 2025 NordenCars · Todos los derechos reservados</div>
        <div style={{ fontSize:9, color:"#222", fontFamily:"sans-serif" }}>Yerba Buena, Tucumán</div>
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:700, textTransform:"uppercase", color:C.white }}>Vehículos <Red>({vehiculos.length})</Red></div>
            <Btn primary small onClick={() => { setEditCar(null); setShowForm(true); }}>+ Agregar vehículo</Btn>
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
                No hay vehículos cargados. Hacé click en "+ Agregar vehículo" para empezar.
              </div>
            )}
          </div>
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
                  <a href={`https://wa.me/${(c.telefono||"").replace(/\D/g,"")||"5493814773142"}?text=Hola%20${encodeURIComponent(c.nombre)}%2C%20te%20escribo%20de%20NordenCars!`} target="_blank" rel="noreferrer"
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
        <FormField label="Precio USD" k="precio_usd" type="number" d={d} set={set}/>
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
    ["nosotros_texto","Texto de Nosotros"],["whatsapp_ale","WhatsApp Alejandro"],
    ["whatsapp_gonchi","WhatsApp Gonchi"],["instagram","Instagram handle"],
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

/* ─── HOME PAGE ─────────────────────────────────────────────────────────────── */
function HomePage({ navTo, setSelectedCar, stockData, config }) {
  const waAle = config.whatsapp_ale || "5493814773142";
  const [reviews, setReviews] = useState([
    {id:1,nombre:"Martín L.",detalle:"Tucumán · VW Vento 2018",texto:"Compré el Vento con ellos y fue increíble. Todo transparente, sin vueltas. Impecable.",estrellas:5},
    {id:2,nombre:"Sofía R.",detalle:"Yerba Buena · BYD 0km",texto:"Me asesoraron perfecto para mi primer 0km. Me fui con el auto que quería dentro del presupuesto.",estrellas:5},
    {id:3,nombre:"Federico P.",detalle:"San Miguel · BMW M235i",texto:"El BMW que compré con Ale es una bestia. Papeles en orden y transferencia rapidísima.",estrellas:5},
  ]);
  useEffect(() => {
    db.sel("resenas","activo=eq.true&order=orden.asc").then(data => { if (Array.isArray(data) && data.length) setReviews(data); });
  }, []);
  const preview = stockData.filter(v => v.destacado).slice(0,4);
  const shown = preview.length >= 2 ? preview : stockData.slice(0,4);

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ position:"relative", height:"100vh", minHeight:680, display:"flex", alignItems:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#050505 0%,#100808 50%,#0c0c0c 100%)" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(220,38,38,.01) 0,rgba(220,38,38,.01) 1px,transparent 1px,transparent 74px)", pointerEvents:"none" }}/>
        <Particles/>
        {/* Left accent */}
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"linear-gradient(to bottom,transparent,#DC2626 22%,#DC2626 78%,transparent)" }}/>
        {/* BG car image — centrado y visible */}
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"65%", backgroundImage:`url(${IMG_BMW_FULL})`, backgroundSize:"cover", backgroundPosition:"center center", maskImage:"linear-gradient(to right,transparent,rgba(0,0,0,.05) 12%,black 38%)", WebkitMaskImage:"linear-gradient(to right,transparent,rgba(0,0,0,.05) 12%,black 38%)", filter:"brightness(.55) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(5,5,5,1) 18%,rgba(5,5,5,.55) 46%,rgba(5,5,5,.08) 100%)" }}/>

        <div style={{ position:"relative", zIndex:2, padding:"0 5vw", maxWidth:820 }}>
          <div style={{ fontSize:9, letterSpacing:5, textTransform:"uppercase", color:C.red, marginBottom:18, display:"flex", alignItems:"center", gap:12, fontFamily:"sans-serif", animation:"fadeUp .8s .15s both" }}>
            <span style={{ width:30, height:1, background:C.red, flexShrink:0 }}/>Yerba Buena, Tucumán · Est. 2022
          </div>
          <BigH sz="clamp(56px,9.5vw,112px)" style={{ marginBottom:22, animation:"fadeUp .8s .3s both" }}>
            Tu próximo<br/>vehículo<br/><Red>premium.</Red>
          </BigH>
          <p style={{ fontSize:14, fontWeight:300, lineHeight:1.8, color:"rgba(245,245,245,.44)", maxWidth:450, marginBottom:42, fontFamily:"sans-serif", animation:"fadeUp .8s .45s both" }}>
            {config.hero_subtitulo || "Al precio justo, con la transparencia que merecés. 0km y usados seleccionados en Yerba Buena, Tucumán."}
          </p>
          <div style={{ display:"flex", gap:13, flexWrap:"wrap", animation:"fadeUp .8s .6s both" }}>
            <Btn primary onClick={() => navTo("stock")}>Ver Stock Disponible</Btn>
            <Btn onClick={() => navTo("contacto")}>Vender mi Auto</Btn>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", right:"5vw", bottom:88, display:"flex", flexDirection:"column", alignItems:"center", gap:9, zIndex:2 }}>
          <span style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"#2e2e2e", writingMode:"vertical-rl", fontFamily:"sans-serif" }}>Scroll</span>
          <div style={{ width:1, height:58, background:"linear-gradient(to bottom,#DC2626,transparent)", animation:"pulse 2s ease-in-out infinite" }}/>
        </div>

        {/* Stats bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, display:"flex", borderTop:`1px solid ${C.border}`, background:"rgba(5,5,5,.9)", zIndex:2 }}>
          {[["120+","Vehículos vendidos"],["100%","Satisfacción"],["17","Marcas 0km"],["Tucumán","Yerba Buena"]].map(([n,l],i) => (
            <div key={i} style={{ flex:1, padding:"17px 4vw", borderRight:i<3?`1px solid ${C.border}`:"none" }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:700, color:C.white, lineHeight:1 }}>
                {n.replace(/[+%]/g,"")}<span style={{ color:C.red }}>{n.match(/[+%]/)?.[0]||""}</span>
              </div>
              <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:C.muted, marginTop:3, fontFamily:"sans-serif" }}>{l}</div>
            </div>
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
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:1, background:C.border }}>
          {shown.map((car,i) => <Reveal key={car.id} delay={i*.07}><CarCard car={car} onClick={setSelectedCar}/></Reveal>)}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section style={{ padding:"80px 5vw", background:C.carbon, borderTop:`1px solid ${C.border}` }}>
        <Reveal><Tag>Marcas oficiales</Tag></Reveal>
        <Reveal delay={.1}><SecH style={{ marginBottom:44 }}>Vendemos <Red>0km</Red></SecH></Reveal>
        <div style={{ overflowX:"auto", paddingBottom:4 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:1, background:C.border, minWidth:600 }}>
            {MARCAS_0KM.map((m,i) => <Reveal key={m} delay={i*.022}><BrandTile brand={m}/></Reveal>)}
          </div>
        </div>
      </section>

      {/* ── NUMBERS BAR ── */}
      <div style={{ background:C.red, display:"flex", gap:1 }}>
        {[["120+","Vehículos vendidos"],["100%","Satisfacción"],["17","Marcas 0km"],["24hs","Respuesta"]].map(([v,l],i) => (
          <div key={i} style={{ flex:1, background:"rgba(0,0,0,.13)", padding:"36px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:50, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:-2 }}>{v}</div>
            <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,.56)", marginTop:7, fontFamily:"sans-serif" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section style={{ padding:"100px 5vw", background:"linear-gradient(to bottom,#0b0b0b,#0f0f0f)" }}>
        <Reveal><Tag>Por qué elegirnos</Tag></Reveal>
        <Reveal delay={.1}><SecH style={{ marginBottom:48 }}>Nuestro <Red>compromiso</Red></SecH></Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(198px,1fr))", gap:1, background:C.border }}>
          {[{i:"🔍",t:"Stock seleccionado",d:"Cada auto pasa revisión rigurosa antes de entrar al catálogo."},
            {i:"📋",t:"Transparencia",d:"Historial completo y documentación en orden. Sin letras chicas."},
            {i:"💳",t:"Financiación",d:"Opciones flexibles para que arranques sin preocupaciones."},
            {i:"🔄",t:"Permutas",d:"Tomamos tu auto como parte de pago al mejor precio del mercado."},
            {i:"⚡",t:"Gestión ágil",d:"Transferencia y trámites resueltos rápido para que solo manejes."},
            {i:"📍",t:"Presencia local",d:"Galería Mercato, Yerba Buena. Atención presencial y personalizada."},
          ].map((s,i) => <Reveal key={i} delay={i*.055}><ServiceTile s={s}/></Reveal>)}
        </div>
      </section>

      {/* ── PHOTO STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", height:210, overflow:"hidden", gap:1 }}>
        {[IMG_BMW_FULL,IMG_BMW_FRONT,IMG_VW_FRONT,IMG_VW_INT].map((img,i) => (
          <div key={i} style={{ overflow:"hidden" }}>
            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.48) saturate(.72)" }}/>
          </div>
        ))}
      </div>

      {/* ── REVIEWS ── */}
      <section style={{ padding:"100px 5vw", background:C.carbon }}>
        <Reveal><Tag>Testimonios</Tag></Reveal>
        <Reveal delay={.1}><SecH style={{ marginBottom:48 }}>Lo que dicen <Red>nuestros clientes</Red></SecH></Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))", gap:1, background:C.border }}>
          {reviews.map((r,i) => <Reveal key={r.id} delay={i*.08}><ReviewTile r={r}/></Reveal>)}
        </div>
      </section>

      {/* ── NOSOTROS PREVIEW ── */}
      <section style={{ padding:"100px 5vw", background:"linear-gradient(to bottom,#0b0b0b,#0f0f0f)" }}>
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

      {/* ── LOCATION ── */}
      <section style={{ padding:"80px 5vw", background:C.zinc2, borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <div>
            <Reveal><Tag>Ubicación</Tag></Reveal>
            <Reveal delay={.1}><SecH style={{ marginBottom:18 }}>Encontranos en <Red>Yerba Buena</Red></SecH></Reveal>
            <Reveal delay={.2}>
              <p style={{ fontSize:14, fontWeight:300, color:"rgba(245,245,245,.46)", lineHeight:1.75, marginBottom:26, fontFamily:"sans-serif" }}>
                📍 <strong style={{ color:C.white }}>Galería Mercato, Casco Viejo</strong><br/>Yerba Buena, Tucumán, Argentina.<br/><br/>
                🕐 Lunes a Sábado · 9:00 a 20:00hs
              </p>
              <Btn href="https://maps.google.com/?q=Galeria+Mercato+Yerba+Buena+Tucuman">Ver en Google Maps</Btn>
            </Reveal>
          </div>
          <Reveal delay={.2}>
            <div style={{ border:`1px solid ${C.border}`, overflow:"hidden", aspectRatio:"4/3" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3561.5!2d-65.285!3d-26.816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225c3898b91b1f%3A0x2b20f1cbf1fa0e27!2sGaler%C3%ADa%20Mercato!5e0!3m2!1ses!2sar!4v1"
                width="100%" height="100%" style={{ border:0, display:"block", filter:"invert(.88) hue-rotate(180deg) saturate(.55) brightness(.8)" }}
                allowFullScreen loading="lazy"/>
            </div>
          </Reveal>
        </div>
      </section>

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
      <div style={{ position:"relative", background:"linear-gradient(to bottom,#060606,#0f0f0f)", padding:"65px 5vw 46px", borderBottom:`1px solid ${C.border}`, overflow:"hidden" }}>
        <Particles/>
        <div style={{ position:"relative", zIndex:2 }}>
          <Tag>Catálogo completo</Tag>
          <BigH sz="clamp(38px,7vw,76px)" style={{ marginBottom:8 }}>Stock <Red>NordenCars</Red></BigH>
          <p style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif" }}>{loading?"Cargando vehículos...":`${filtered.length} vehículo${filtered.length!==1?"s":""} disponible${filtered.length!==1?"s":""}`}</p>
        </div>
      </div>
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
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:1, background:C.border }}>
              {filtered.map(car => <CarCard key={car.id} car={car} onClick={setSelectedCar}/>)}
            </div>
        }
        <div style={{ marginTop:36, padding:"24px", background:C.zinc, border:`1px solid ${C.border}`, display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:19, fontWeight:700, textTransform:"uppercase", color:C.white, marginBottom:3 }}>¿No encontrás lo que buscás?</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif" }}>Consultanos y buscamos el vehículo ideal para vos.</div>
          </div>
          <Btn primary href="https://wa.me/5493814773142?text=Hola%2C%20busco%20un%20veh%C3%ADculo%20espec%C3%ADfico...">Consultanos →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── NOSOTROS PAGE ──────────────────────────────────────────────────────────── */
function NosotrosPage({ navTo }) {
  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ position:"relative", background:"linear-gradient(135deg,#050505,#100808)", padding:"75px 5vw 56px", overflow:"hidden" }}>
        <Particles/>
        <div style={{ position:"relative", zIndex:2 }}>
          <Tag>Quiénes somos</Tag>
          <BigH sz="clamp(38px,7vw,76px)">La historia <Red>real</Red></BigH>
        </div>
      </div>
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
                {[{init:"AL",name:"Alejandro",href:"https://wa.me/5493814773142?text=Hola%20Alejandro..."},
                  {init:"GO",name:"Gonchi",href:"https://wa.me/5493815184961?text=Hola%20Gonchi..."},
                ].map(f => (
                  <a key={f.name} href={f.href} target="_blank" rel="noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 16px", border:`1px solid ${C.border}`, flex:1, textDecoration:"none", transition:"border-color .3s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor=C.red} onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:C.red, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>{f.init}</div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:500, letterSpacing:1, textTransform:"uppercase", color:C.white, fontFamily:"sans-serif" }}>{f.name}</div>
                      <div style={{ fontSize:9, color:C.muted, fontFamily:"sans-serif" }}>WhatsApp directo</div>
                    </div>
                  </a>
                ))}
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
  const waAle = config.whatsapp_ale || "5493814773142";
  const waGonchi = config.whatsapp_gonchi || "5493815184961";
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
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.muted, marginBottom:3, fontFamily:"sans-serif" }}>Co-fundador</div>
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
      <div style={{ position:"relative", background:"linear-gradient(135deg,#050505,#100808)", padding:"75px 5vw 56px", overflow:"hidden" }}>
        <Particles/>
        <div style={{ position:"relative", zIndex:2 }}>
          <Tag>Contacto directo</Tag>
          <BigH sz="clamp(38px,7vw,76px)">Hablemos <Red>hoy mismo</Red></BigH>
        </div>
      </div>
      <div style={{ padding:"70px 5vw", background:"#0c0c0c" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"start" }}>
          <div>
            <Reveal><Tag>WhatsApp directo</Tag></Reveal>
            <Reveal delay={.1}><p style={{ fontSize:13, fontWeight:300, color:"rgba(245,245,245,.44)", lineHeight:1.7, marginBottom:30, fontFamily:"sans-serif" }}>Escribinos directo a cualquiera de los dos fundadores. Respondemos a la brevedad.</p></Reveal>
            <Reveal delay={.2}><WaBtn href={`https://wa.me/${waAle}?text=Hola%20Alejandro%2C%20vengo%20de%20la%20web%20de%20Norden%20Cars...`} name="Alejandro" phone="+54 9 381 477-3142"/></Reveal>
            <Reveal delay={.3}><WaBtn href={`https://wa.me/${waGonchi}?text=Hola%20Gonchi%2C%20vengo%20de%20la%20web%20de%20Norden%20Cars...`} name="Gonchi" phone="+54 9 381 518-4961"/></Reveal>
            <Reveal delay={.4}>
              <div style={{ marginTop:26, padding:"20px", background:C.zinc, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:C.red, marginBottom:10, fontFamily:"sans-serif" }}>Ubicación</div>
                <div style={{ fontSize:13, fontWeight:300, color:"rgba(245,245,245,.58)", lineHeight:1.7, fontFamily:"sans-serif" }}>
                  📍 Galería Mercato, Casco Viejo<br/>Yerba Buena, Tucumán, Argentina<br/><br/>
                  🕐 Lun–Sáb: 9:00 a 20:00hs
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
  const [scrolled, setScrolled] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [stockData, setStockData] = useState(STOCK_LOCAL);
  const [config, setConfig] = useState({});
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    // Load config
    db.sel("configuracion").then(data => {
      if (Array.isArray(data) && data.length) {
        const m = {}; data.forEach(x => { m[x.clave] = x.valor; }); setConfig(m);
      }
    });
    // Load stock + fotos
    setLoadingStock(true);
    db.sel("vehiculos","activo=eq.true&order=orden.asc,created_at.desc").then(async data => {
      if (Array.isArray(data) && data.length) {
        const withFotos = await Promise.all(data.map(async v => {
          const fotos = await db.sel("vehiculo_fotos", `vehiculo_id=eq.${v.id}&order=orden.asc`);
          return { ...v, fotos: Array.isArray(fotos) ? fotos.map(f => f.url) : [] };
        }));
        setStockData(withFotos);
      }
      setLoadingStock(false);
    }).catch(() => setLoadingStock(false));
  }, []);

  const navTo = (p) => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };

  if (page === "admin") return <AdminPanel onExit={() => navTo("home")}/>;

  return (
    <div style={{ background:C.bg, color:C.white, minHeight:"100vh", fontFamily:"'Barlow',sans-serif", fontWeight:300, overflowX:"hidden" }}>
      <style>{`
        @keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
      `}</style>

      <Nav page={page} navTo={navTo} scrolled={scrolled}/>

      {page==="home"     && <HomePage navTo={navTo} setSelectedCar={setSelectedCar} stockData={stockData} config={config}/>}
      {page==="stock"    && <StockPage stockData={stockData} setSelectedCar={setSelectedCar} loading={loadingStock}/>}
      {page==="nosotros" && <NosotrosPage navTo={navTo}/>}
      {page==="contacto" && <ContactoPage config={config} navTo={navTo}/>}

      {selectedCar && <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} waAle={config.whatsapp_ale} waGonchi={config.whatsapp_gonchi}/>}

      <FloatWa waAle={config.whatsapp_ale}/>
      <Chatbot/>
    </div>
  );
}