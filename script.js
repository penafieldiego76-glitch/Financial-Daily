const $ = id => document.getElementById(id);
const dos = n => String(n).padStart(2, "0");

// Para probar otra fecha: ?fecha=09-15
const hoy = new Date();
const prueba = new URLSearchParams(location.search).get("fecha");
if (/^\d{2}-\d{2}$/.test(prueba)) {
  const [m, d] = prueba.split("-").map(Number);
  hoy.setMonth(m - 1, d);
}
const mes = dos(hoy.getMonth() + 1);
const dia = dos(hoy.getDate());

$("fecha").textContent = hoy.toLocaleDateString("es-EC", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

async function pedir(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

async function cargarHistoria() {
  try {
    const propias = await pedir("efemerides.json").catch(() => ({}));
    const propia = propias[`${mes}-${dia}`];
    if (propia) {
      $("titulo").textContent = propia.titulo;
      $("relato").textContent = propia.relato;
      return;
    }
    const datos = await pedir(`https://es.wikipedia.org/api/rest_v1/feed/onthisday/events/${mes}/${dia}`);
    const claves = /\b(banc|bolsa|econom|financ|moneda|impuesto|comerci|deuda|inflacion|petroleo|oro\b|euro\b|dolar)/;
    const limpiar = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const financieros = datos.events.filter(e => claves.test(limpiar(e.text)));
    const evento = financieros[0] || datos.events[0];

    $("titulo").textContent = financieros.length
      ? `Año ${evento.year}`
      : `Año ${evento.year} (historia general)`;
    $("relato").textContent = evento.text;

    const pagina = evento.pages?.[0];
    if (pagina) {
      $("contexto").textContent = `Contexto (${pagina.titles?.normalized || pagina.title}): ${pagina.extract || ""}`;
      $("fuente").href = pagina.content_urls.desktop.page;
      $("fuente").hidden = false;
    }
  } catch {
    $("titulo").textContent = "No se pudo cargar la historia";
    $("relato").textContent = "Intenta recargar la página.";
  }
}

async function cargarMercados() {
  try {
    const { rates } = await pedir("https://open.er-api.com/v6/latest/USD");
    $("monedas").innerHTML = ["EUR", "COP", "PEN", "MXN"]
      .map(c => `<li>${rates[c].toFixed(2)} ${c}</li>`).join("");
  } catch {
    $("monedas").textContent = "No disponible";
  }
  try {
    const { data } = await pedir("https://api.coinbase.com/v2/prices/BTC-USD/spot");
    $("bitcoin").textContent = `US$ ${Number(data.amount).toLocaleString("es-EC", { maximumFractionDigits: 0 })}`;
  } catch {
    $("bitcoin").textContent = "No disponible";
  }
}

cargarHistoria();
cargarMercados();
