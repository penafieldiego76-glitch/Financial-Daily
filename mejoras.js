(() => {
  // FORO: pega aquí tus códigos de https://giscus.app/es
  const REPO_ID = "";
  const CATEGORY_ID = "";

  const css = document.createElement("style");
  css.textContent = `
    html { scroll-behavior:smooth; }
    html.claro { --fondo:#f5eedc; --caja:#fffdf7; --texto:#222; --acento:#b8890b; }
    html.claro .tradingview-widget-container { background:#131722; border-radius:12px; }
    #menu { position:sticky; top:0; z-index:50; display:flex; gap:8px; overflow-x:auto; padding:10px; background:var(--portada); border-bottom:2px solid var(--acento); }
    #menu a, #menu button { white-space:nowrap; flex-shrink:0; color:white; background:transparent; border:1px solid var(--acento); border-radius:20px; padding:7px 14px; text-decoration:none; font-size:.9rem; }
    #menu a:first-child { margin-left:auto; }
    #menu button { margin-right:auto; }
    main, section { scroll-margin-top:70px; }
    .aprende { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:15px; }
    .aprende details, .convertidor { background:var(--caja); border-radius:12px; padding:18px; border-left:5px solid var(--acento); }
    .aprende summary { cursor:pointer; font-weight:bold; }
    .convertidor input, .convertidor select { margin:5px; max-width:100%; background:white; color:#222; }
    @media (max-width:700px) {
      main, .paneles { grid-template-columns:minmax(0,1fr) !important; }
      main, .extras, #mercados { padding:0 12px; }
      .texto { padding:16px; }
      .portada { min-height:260px; }
      h2 { font-size:1.5rem; }
      nav button, nav input { padding:8px; font-size:.9rem; }
      #juego .caja { padding:12px; }
      #menu a:first-child { margin-left:0; }
    }
  `;
  document.head.append(css);

  function seccion(id, html) {
    const s = document.createElement("section");
    s.id = id;
    s.className = "extras";
    s.innerHTML = html;
    document.querySelector("footer").before(s);
    return s;
  }

  // Aprende finanzas
  const temas = [
    ["📈 Inflación", "Es la subida general de precios. Con el mismo dinero compras menos."],
    ["❄️ Interés compuesto", "Los intereses generan nuevos intereses. El tiempo potencia el efecto, en ahorros y en deudas."],
    ["🏢 Acciones", "Son partes de una empresa. Su precio puede subir o bajar y puedes perder dinero."],
    ["📜 Bonos", "Son préstamos a gobiernos o empresas a cambio de intereses. También tienen riesgos."],
    ["🛟 Fondo de emergencia", "Dinero disponible para imprevistos. Una guía común es cubrir de 3 a 6 meses de gastos."],
    ["🕵️ Estafas", "Desconfía de ganancias garantizadas, urgencias y pagos por reclutar personas."]
  ];
  seccion("aprende", `<h2>📚 Aprende finanzas</h2><div class="aprende">${
    temas.map(([t, d]) => `<details><summary>${t}</summary><p>${d}</p></details>`).join("")
  }</div>`);

  // Convertidor
  seccion("convertidor", `<h2>💱 Convertidor</h2>
    <div class="convertidor">
      <label>US$ <input type="number" id="c-monto" value="100" min="0"></label>
      <label>a <select id="c-moneda">
        <option value="EUR">Euro</option><option value="COP">Peso colombiano</option>
        <option value="PEN">Sol peruano</option><option value="MXN">Peso mexicano</option>
        <option value="GBP">Libra esterlina</option></select></label>
      <h3 id="c-resultado">Cargando...</h3>
      <small><a href="https://www.exchangerate-api.com">Rates By Exchange Rate API</a></small>
    </div>`);
  const el = id => document.getElementById(id);
  fetch("https://open.er-api.com/v6/latest/USD")
    .then(r => r.json())
    .then(({ rates }) => {
      const convertir = () => {
        const m = el("c-moneda").value;
        el("c-resultado").textContent =
          `${(Number(el("c-monto").value) * rates[m]).toLocaleString("es-EC", { maximumFractionDigits: 2 })} ${m}`;
      };
      el("c-monto").oninput = el("c-moneda").onchange = convertir;
      convertir();
    })
    .catch(() => el("c-resultado").textContent = "No disponible");

  // Foro
  const foro = seccion("foro", `<h2>💬 Foro financiero</h2>
    <p>Inicia sesión con GitHub. Los comentarios son públicos: no compartas datos personales ni bancarios.</p>`);
  let claro = false;
  try { claro = localStorage.getItem("modo") === "claro"; } catch {}
  if (REPO_ID && CATEGORY_ID) {
    const g = document.createElement("script");
    g.src = "https://giscus.app/client.js";
    g.async = true;
    g.crossOrigin = "anonymous";
    Object.entries({
      repo: "penafieldiego76-glitch/Financial-Daily", "repo-id": REPO_ID,
      category: "General", "category-id": CATEGORY_ID,
      mapping: "specific", term: "Foro financiero",
      "reactions-enabled": "1", "input-position": "top",
      theme: claro ? "light" : "dark", lang: "es"
    }).forEach(([k, v]) => g.setAttribute("data-" + k, v));
    foro.append(g);
  } else {
    foro.insertAdjacentHTML("beforeend", "<p>🚧 El foro estará disponible pronto.</p>");
  }

  // Menú y modo claro/oscuro
  document.querySelector("main").id = "historia";
  el("lista2026")?.closest("section").setAttribute("id", "noticias");
  const menu = document.createElement("div");
  menu.id = "menu";
  [["historia", "📰 Historia"], ["mercados", "📈 Mercados"], ["noticias", "🗞️ Noticias"],
   ["juego", "🎮 Juego"], ["aprende", "📚 Aprende"], ["convertidor", "💱 Convertir"], ["foro", "💬 Foro"]]
    .forEach(([id, texto]) => {
      const a = document.createElement("a");
      a.href = "#" + id;
      a.textContent = texto;
      menu.append(a);
    });
  const modo = document.createElement("button");
  const aplicar = () => {
    document.documentElement.classList.toggle("claro", claro);
    modo.textContent = claro ? "🌙 Oscuro" : "☀️ Claro";
    document.querySelector(".giscus-frame")?.contentWindow.postMessage(
      { giscus: { setConfig: { theme: claro ? "light" : "dark" } } }, "https://giscus.app");
  };
  modo.onclick = () => {
    claro = !claro;
    try { localStorage.setItem("modo", claro ? "claro" : "oscuro"); } catch {}
    aplicar();
  };
  menu.append(modo);
  document.querySelector("header").after(menu);
  aplicar();
})();
