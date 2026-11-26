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

function parrafos(id, textos) {
  $(id).replaceChildren(...textos.filter(Boolean).map(t => {
    const p = document.createElement("p");
    p.textContent = t;
    return p;
  }));
}

async function cargarHistoria() {
  const temas = {
    "01-01": "Euro", "01-03": "Bitcoin", "01-09": "Dolarización",
    "05-17": "Bolsa de Nueva York", "08-15": "Patrón oro",
    "09-15": "Lehman Brothers", "10-19": "Dow Jones",
    "10-24": "Crac del 29", "11-26": "Bolsa de valores",
    "11-27": "Alfred Nobel"
  };
  try {
    const fecha = `${mes}-${dia}`;
    const propias = await pedir("efemerides.json").catch(e => {
      console.error("Error en efemerides.json:", e);
      return {};
    });
    const propia = propias[fecha];
    let tema;

    if (propia) {
      $("titulo").textContent = propia.titulo;
      parrafos("relato", [].concat(propia.relato));
      tema = propia.wiki || temas[fecha];
    } else {
      const datos = await pedir(`https://es.wikipedia.org/api/rest_v1/feed/onthisday/events/${mes}/${dia}`);
      const claves = /\b(banc|bolsa|econom|financ|moneda|impuesto|comerci|deuda|inflacion|petroleo|oro\b|euro\b|dolar)/;
      const limpiar = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const financiero = datos.events.find(e => claves.test(limpiar(e.text)));
      const evento = financiero || datos.events[0];
      $("titulo").textContent = `Año ${evento.year}${financiero ? "" : " (historia general)"}`;
      parrafos("relato", [evento.text]);
      const pagina = evento.pages?.find(p => claves.test(limpiar(p.title))) || evento.pages?.[0];
      tema = pagina?.title;
    }
    if (!tema) return;

    const url = "https://es.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&redirects=1&prop=extracts%7Cpageimages%7Cinfo&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=1200&inprop=url&titles=";
    const info = await pedir(url + encodeURIComponent(tema)).catch(() => null);
    const pag = info?.query?.pages?.[0];
    if (!pag || pag.missing) return;

    parrafos("contexto", (pag.extract || "").split("\n"));
    if (pag.extract) {
      const h = document.createElement("h3");
      h.textContent = `Para entenderlo mejor: ${pag.title}`;
      $("contexto").prepend(h);
    }
    if (pag.thumbnail) {
      $("foto").src = pag.thumbnail.source;
      $("foto").alt = pag.title;
      $("foto").hidden = false;
    }
    $("fuente").href = pag.fullurl;
    $("fuente").hidden = false;
  } catch (e) {
    console.error(e);
    $("titulo").textContent = "No se pudo cargar la historia";
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
