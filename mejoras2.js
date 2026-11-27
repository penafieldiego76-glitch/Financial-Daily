(() => {
  // Estadísticas: crea una cuenta en goatcounter.com y escribe tu código
  const GOATCOUNTER = "";

  const el = id => document.getElementById(id);
  const num = id => Math.max(0, Number(el(id).value) || 0);
  const usd = v => "US$ " + v.toLocaleString("es-EC", { maximumFractionDigits: 2 });
  const campo = (id, texto, valor) =>
    `<p><label>${texto} <input type="number" id="${id}" value="${valor}" min="0"></label></p>`;

  function seccion(id, html) {
    const s = document.createElement("section");
    s.id = id;
    s.className = "extras";
    s.innerHTML = html;
    document.querySelector("footer").before(s);
  }

  // Logo
  const logo = document.createElement("img");
  logo.src = "logo.svg";
  logo.alt = "Logo de Historias Financieras";
  logo.width = 80;
  document.querySelector("header").prepend(logo);

  // Racha y palabra del día
  const dia = f => `${f.getFullYear()}-${f.getMonth() + 1}-${f.getDate()}`;
  const ahora = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  let racha = 1;
  try {
    const g = JSON.parse(localStorage.getItem("racha") || "{}");
    if (g.fecha === dia(ahora)) racha = g.n;
    else if (g.fecha === dia(ayer)) racha = g.n + 1;
    localStorage.setItem("racha", JSON.stringify({ fecha: dia(ahora), n: racha }));
  } catch {}
  const medalla = racha >= 30 ? "🥇" : racha >= 7 ? "🥈" : racha >= 3 ? "🥉" : "🌱";
  const palabras = [
    ["Liquidez", "Facilidad para convertir algo en dinero sin perder mucho valor."],
    ["Activo", "Algo que posees y tiene valor económico."],
    ["Pasivo", "Una deuda u obligación de pago."],
    ["Dividendo", "Parte de las ganancias que una empresa reparte a sus accionistas."],
    ["Diversificación", "Repartir el dinero para reducir el riesgo."],
    ["Inflación", "Subida general y sostenida de los precios."],
    ["Presupuesto", "Plan de ingresos y gastos."],
    ["Rentabilidad", "Ganancia o pérdida en relación con lo invertido."],
    ["Patrimonio", "Lo que tienes menos lo que debes."],
    ["Amortización", "Pago gradual de una deuda."]
  ];
  const [palabra, definicion] = palabras[Math.floor(Date.now() / 86400000) % palabras.length];
  seccion("diario", `<div class="aprende">
    <div class="convertidor"><h3>${medalla} Tu racha: ${racha} día(s)</h3><p>Medallas a los 3, 7 y 30 días seguidos.</p></div>
    <div class="convertidor"><h3>📖 Palabra del día: ${palabra}</h3><p>${definicion}</p></div></div>`);

  // Calculadoras
  seccion("herramientas", `<h2>🧮 Herramientas</h2><div class="aprende">
    <div class="convertidor"><h3>Préstamo</h3>
      ${campo("p-monto", "Monto (US$)", 1000)}${campo("p-tasa", "Interés anual (%)", 15)}${campo("p-meses", "Meses", 12)}
      <p id="p-res"></p><small>Estimación sin seguros ni comisiones.</small></div>
    <div class="convertidor"><h3>Presupuesto 50/30/20</h3>
      ${campo("b-ing", "Ingreso mensual", 500)}${campo("b-gas", "Tus gastos al mes", 400)}
      <p id="b-res"></p></div>
    <div class="convertidor"><h3>Meta de ahorro</h3>
      ${campo("m-meta", "Quiero juntar", 600)}${campo("m-hay", "Ya tengo", 0)}${campo("m-meses", "En cuántos meses", 6)}
      <p id="m-res"></p></div></div>`);

  function calcular() {
    const m = num("p-monto"), r = num("p-tasa") / 1200, n = Math.floor(num("p-meses"));
    const cuota = n ? (r ? m * r / (1 - (1 + r) ** -n) : m / n) : 0;
    el("p-res").textContent = n ? `Cuota: ${usd(cuota)} · Intereses: ${usd(cuota * n - m)}` : "Indica los meses.";
    const i = num("b-ing"), saldo = i - num("b-gas");
    el("b-res").textContent = `Necesidades: ${usd(i * .5)} · Gustos: ${usd(i * .3)} · Ahorro: ${usd(i * .2)}. ${saldo >= 0 ? "Te sobran " + usd(saldo) : "Te faltan " + usd(-saldo)}.`;
    const falta = Math.max(0, num("m-meta") - num("m-hay")), t = Math.floor(num("m-meses"));
    el("m-res").textContent = t ? `Ahorra ${usd(falta / t)} al mes.` : "Indica los meses.";
  }
  el("herramientas").addEventListener("input", calcular);
  calcular();

  // Buscador
  seccion("buscar", `<h2>🔍 Buscar historias</h2><div class="convertidor">
    <input type="search" id="q" placeholder="Ej.: Bitcoin, crisis, euro"><div id="q-res"></div></div>`);
  const limpiar = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  fetch("efemerides.json").then(r => r.json()).then(datos => {
    el("q").oninput = () => {
      const q = limpiar(el("q").value.trim());
      const hallados = q.length < 3 ? [] : Object.entries(datos)
        .filter(([, h]) => limpiar(h.titulo + " " + [].concat(h.relato).join(" ")).includes(q)).sort();
      el("q-res").replaceChildren(...hallados.map(([f, h]) => {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = "?fecha=" + f;
        a.textContent = `${f.split("-").reverse().join("/")} · ${h.titulo}`;
        p.append(a);
        return p;
      }));
      if (q.length >= 3 && !hallados.length) el("q-res").textContent = "Sin resultados.";
    };
  }).catch(() => el("q-res").textContent = "No se pudo cargar el buscador.");

  // Quiénes somos, aviso legal e instalación
  seccion("acerca", `<h2>ℹ️ Quiénes somos</h2><div class="convertidor">
    <p>Historias Financieras es un proyecto para aprender sobre dinero a través de la historia.</p>
    <p><b>Aviso legal:</b> el contenido es educativo e informativo, no es asesoría financiera. Los datos pueden tener errores o retrasos. Consulta fuentes oficiales y a un profesional antes de decidir.</p>
    <p><b>Privacidad:</b> tu racha y tus récords se guardan en tu navegador. Los servicios externos de la página tienen sus propias políticas.</p>
    <button id="instalar" hidden>📲 Instalar como app</button>
    <p><small>En el celular también puedes usar el menú del navegador → "Añadir a pantalla de inicio".</small></p></div>`);
  let aviso;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    aviso = e;
    el("instalar").hidden = false;
  });
  el("instalar").onclick = () => { aviso.prompt(); el("instalar").hidden = true; };

  // Enlaces en el menú
  [["herramientas", "🧮 Herramientas"], ["buscar", "🔍 Buscar"], ["acerca", "ℹ️ Acerca"]].forEach(([id, texto]) => {
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = texto;
    el("menu")?.querySelector("button").before(a);
  });

  if (GOATCOUNTER) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
    document.body.append(s);
  }
})();
