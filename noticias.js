(async () => {
  const lista = document.getElementById("lista2026");
  try {
    const r = await fetch("noticias2026.json", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    const noticias = await r.json();
    noticias
      .filter(n => new Date(n.fecha + "T00:00:00") <= new Date())
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .forEach(n => {
        const caja = document.createElement("div");
        caja.className = "noticia";
        const fecha = document.createElement("small");
        fecha.textContent = new Date(n.fecha + "T12:00:00")
          .toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" });
        const h = document.createElement("h3");
        h.textContent = n.titulo;
        const p = document.createElement("p");
        p.textContent = n.texto;
        caja.append(fecha, h, p);
        lista.append(caja);
      });
  } catch (e) {
    console.error(e);
    lista.textContent = "No se pudieron cargar las noticias.";
  }

  const s = document.createElement("script");
  s.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
  s.async = true;
  s.textContent = JSON.stringify({
    feedMode: "all_symbols", colorTheme: "dark", locale: "es",
    isTransparent: true, displayMode: "regular", width: "100%", height: 600
  });
  const w = document.createElement("div");
  w.className = "tradingview-widget-container__widget";
  document.getElementById("ultimas").append(w, s);
})();
