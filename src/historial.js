import { useEffect, useRef } from "react";

/*
 * Botón / gesto "atrás" del navegador (Ale, 2026-10-30): la web es una sola
 * página y cambiaba de sección sin avisarle al navegador, así que "atrás" (la
 * flechita, el gesto de deslizar en el celular) te sacaba del sitio.
 *
 * Ahora:
 *  · Cada sección (Stock, 0km, Vendé tu auto…) es una entrada del historial
 *    (#stock, #okm…): "atrás" vuelve a la sección anterior.
 *  · Cada "capa" que se abre encima (la ficha de un auto, el comparador, el
 *    simulador, el menú del celular, el chat, los pasos de "Vendé tu auto")
 *    ocupa una entrada: "atrás" cierra la de arriba en vez de irse.
 * Es la API estándar del navegador (History API): anda igual en Chrome,
 * Safari, Firefox, Edge, Samsung Internet y el navegador de Instagram.
 */

const pila = [];      // capas abiertas, de abajo hacia arriba
let ocupado = 0;      // "atrás" que hicimos nosotros y todavía no llegaron
let porSacar = 0;     // entradas de capas cerradas desde la página, a sacar juntas
const cola = [];      // lo que espera a que el historial quede quieto
let alCambiarPagina = null;
let vigia = null;

const quieto = () => ocupado === 0 && porSacar === 0;
function correrCola() { while (cola.length && quieto()) cola.shift()(); }
function enCola(fn) { if (quieto()) fn(); else cola.push(fn); }

/** Saca n entradas nuestras del historial sin que eso cierre nada más. */
function sacar(n) {
  if (n <= 0) return;
  porSacar += n;
  if (porSacar !== n) return; // ya hay una vuelta programada: se suman
  setTimeout(() => {
    const k = porSacar;
    porSacar = 0;
    ocupado++;
    window.history.go(-k);
    // Si el navegador no avisa (no debería pasar), no dejar la cola trabada.
    clearTimeout(vigia);
    vigia = setTimeout(() => { if (ocupado) { ocupado = 0; correrCola(); } }, 800);
  }, 0);
}

if (typeof window !== "undefined") {
  try { window.history.scrollRestoration = "manual"; } catch { /* navegador viejo */ }
  window.addEventListener("popstate", (e) => {
    if (ocupado > 0) { ocupado--; if (!ocupado) clearTimeout(vigia); correrCola(); return; }
    const nivel = Number(e.state?.capa) || 0;
    if (pila.length > nivel) {
      while (pila.length > nivel) { const c = pila.pop(); c.viva = false; c.cerrar(); }
      return;
    }
    alCambiarPagina?.(e.state || {});
  });
}

/** Abre una capa: devuelve la función para cuando la página la cierra sola (X, Escape…). */
export function abrirCapa(cerrar) {
  const capa = { cerrar, viva: true, empujada: false };
  pila.push(capa);
  enCola(() => {
    if (!capa.viva) return;
    window.history.pushState({ ...(window.history.state || {}), capa: pila.indexOf(capa) + 1 }, "");
    capa.empujada = true;
  });
  return () => {
    if (!capa.viva) return; // ya la cerró el "atrás"
    capa.viva = false;
    const i = pila.indexOf(capa);
    if (i >= 0) pila.splice(i, 1);
    if (capa.empujada) sacar(1);
  };
}

/** Mientras `abierta` sea true, "atrás" la cierra llamando a `cerrar`. */
export function useCapaAtras(abierta, cerrar) {
  const ref = useRef(cerrar);
  useEffect(() => { ref.current = cerrar; });
  useEffect(() => {
    if (!abierta) return undefined;
    return abrirCapa(() => ref.current());
  }, [abierta]);
}

/** Lo llama la App: qué hacer cuando "atrás"/"adelante" cambia de sección. */
export function alNavegar(fn) { alCambiarPagina = fn; }

/** Ir a otra sección: cierra las capas abiertas y agrega la sección al historial. */
export function empujarPagina(estado, url) {
  let empujadas = 0;
  while (pila.length) { const c = pila.pop(); c.viva = false; if (c.empujada) empujadas++; c.cerrar(); }
  sacar(empujadas);
  enCola(() => {
    // Guardar dónde estaba la persona, para volver al mismo lugar con "atrás".
    try { window.history.replaceState({ ...(window.history.state || {}), scroll: window.scrollY }, ""); } catch { /* sin historial */ }
    window.history.pushState(estado, "", url);
  });
}

/** Sin sumar una entrada (al cargar la página o con un link directo). */
export function reemplazarPagina(estado, url) {
  enCola(() => window.history.replaceState({ ...(window.history.state || {}), ...estado }, "", url ?? window.location.href));
}
