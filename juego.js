(() => {
  const estilo = document.createElement("style");
  estilo.textContent = `
    #juego .caja { background:var(--caja); border:2px solid var(--acento); border-radius:16px; padding:25px; text-align:center; }
    #juego button { margin:4px; }
    #juego button:disabled { opacity:.35; cursor:default; }
    .j-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin:18px 0; }
    .j-card { border:1px solid #8886; border-radius:12px; padding:14px; }
    .j-card b { display:block; font-size:1.3rem; color:var(--acento); }
    .j-aviso { background:#0003; border-radius:12px; padding:14px; margin:12px 0; }
    #juego svg { width:100%; height:130px; background:#0003; border-radius:12px; }
    #juego progress { width:180px; vertical-align:middle; }
  `;
  document.head.append(estilo);

  const seccion = document.createElement("section");
  seccion.className = "extras";
  seccion.id = "juego";
  seccion.innerHTML = `<div class="caja"><h2>🎮 Inversionista por un año</h2><div id="j-zona"></div></div>`;
  document.querySelector("footer").before(seccion);
  const zona = document.getElementById("j-zona");

  const dinero = v => "US$ " + Math.round(v).toLocaleString("es-EC");
  const azar = lista => lista[Math.floor(Math.random() * lista.length)];

  const activos = [
    { n: "🏦 Ahorro", d: "Seguro y lento", min: 0.3, max: 0.6 },
    { n: "📜 Bonos", d: "Riesgo bajo", min: -2, max: 3 },
    { n: "🏢 Acciones", d: "Riesgo medio", min: -9, max: 12 },
    { n: "🪙 Cripto", d: "Riesgo muy alto", min: -30, max: 38 }
  ];
  const personajes = [
    { n: "🎓 Estudiante", dinero: 500, sueldo: 60, meta: 1500 },
    { n: "👩‍💼 Empleado", dinero: 1000, sueldo: 150, meta: 3300 },
    { n: "🚀 Emprendedor", dinero: 3000, sueldo: 50, meta: 4500 }
  ];
  // efectos en %: [ahorro, bonos, acciones, cripto]
  const rumores = [
    ["Se habla de un auge tecnológico.", [0, 0, 10, 12]],
    ["Analistas temen una crisis bancaria.", [0, 1, -14, -10]],
    ["El banco central subiría las tasas.", [0.5, -3, -6, -12]],
    ["En redes dicen que las cripto se disparan.", [0, 0, 0, 30]],
    ["Se rumora un hackeo a una plataforma cripto.", [0, 0, 0, -28]],
    ["Las empresas anunciarían ganancias récord.", [0, 0, 11, 3]],
    ["Posible recesión: muchos buscan refugio.", [0, 3, -10, -15]]
  ];
  const imprevistos = [
    { t: "📱 Se dañó tu celular.", o: [["Comprar el último modelo", 400, 10], ["Repararlo", 90, 0], ["Aguantar así", 0, -15]] },
    { t: "🎉 Tus amigos planean un viaje.", o: [["Ir con todo", 300, 20], ["Plan económico", 100, 8], ["Quedarme", 0, -10]] },
    { t: "🏥 Una emergencia médica.", o: [["Buena atención", 250, 0], ["Opción básica", 120, -8], ["Ignorarlo", 0, -30]] },
    { t: "📚 Hay un curso que mejora tu sueldo.", o: [["Tomarlo (+US$ 50 al mes)", 200, 5, 50], ["Ahora no", 0, 0]] },
    { t: "🤑 Te ofrecen duplicar tu dinero en una semana.", o: [["Entrar con US$ 200", 200, -15, 0, "¡Era una estafa! Lo perdiste todo."], ["Rechazar", 0, 5, 0, "Bien hecho: era una estafa."]] }
  ];

  let s;

  function boton(padre, texto, accion, apagado = false) {
    const b = document.createElement("button");
    b.textContent = texto;
    b.disabled = apagado;
    b.onclick = accion;
    padre.append(b);
  }
  function nodo(padre, etiqueta, texto = "", clase = "") {
    const e = document.createElement(etiqueta);
    e.textContent = texto;
    e.className = clase;
    padre.append(e);
    return e;
  }
  const total = () => s.efectivo + s.inv.reduce((a, b) => a + b, 0) - s.deuda;

  function menu() {
    zona.replaceChildren();
    nodo(zona, "p", "Tienes 12 meses para alcanzar tu meta sin descuidar tu bienestar. Elige tu personaje:");
    const g = nodo(zona, "div", "", "j-grid");
    personajes.forEach(p => {
      const c = nodo(g, "div", "", "j-card");
      nodo(c, "b", p.n);
      nodo(c, "p", `Inicio: ${dinero(p.dinero)} · Sueldo libre: ${dinero(p.sueldo)} · Meta: ${dinero(p.meta)}`);
      boton(c, "Jugar", () => iniciar(p));
    });
    nodo(zona, "small", "Juego ficticio: no es una recomendación de inversión.");
  }

  function iniciar(p) {
    s = { p, efectivo: p.dinero, sueldo: p.sueldo, inv: [0, 0, 0, 0], deuda: 0, animo: 70,
      mes: 1, historial: [p.dinero], mensaje: "¡Empieza tu año! Reparte tu dinero.",
      rumor: azar(rumores), evento: null, endeudado: false, estafado: false };
    pintar();
  }

  function pintar() {
    zona.replaceChildren();
    nodo(zona, "h3", `${s.p.n} · Mes ${s.mes} de 12`);
    const g = nodo(zona, "div", "", "j-grid");
    [["Patrimonio", dinero(total())], ["Efectivo", dinero(s.efectivo)],
     ["Deuda", dinero(s.deuda)], ["Meta", dinero(s.p.meta)]].forEach(([t, v]) => {
      const c = nodo(g, "div", t, "j-card");
      nodo(c, "b", v);
    });
    const barra = nodo(zona, "p", `Bienestar ${s.animo}/100 `);
    const pr = nodo(barra, "progress");
    pr.max = 100;
    pr.value = s.animo;
    grafico();
    nodo(zona, "p", s.mensaje, "j-aviso").setAttribute("aria-live", "polite");

    if (s.evento) {
      nodo(zona, "h3", s.evento.t);
      s.evento.o.forEach(o => boton(zona, `${o[0]} (${dinero(o[1])})`, () => decidir(o)));
      return;
    }

    nodo(zona, "p", `🗣️ Rumor del mes: ${s.rumor[0]} (puede ser falso)`, "j-aviso");
    const cartera = nodo(zona, "div", "", "j-grid");
    activos.forEach((a, i) => {
      const c = nodo(cartera, "div", "", "j-card");
      nodo(c, "strong", a.n);
      nodo(c, "b", dinero(s.inv[i]));
      nodo(c, "p", a.d);
      boton(c, "+100", () => comprar(i, 100), s.efectivo < 1);
      boton(c, "Todo", () => comprar(i, s.efectivo), s.efectivo < 1);
      boton(c, "Vender", () => vender(i), s.inv[i] < 1);
    });
    if (s.deuda > 0) boton(zona, "💳 Pagar deuda", pagar, s.efectivo < 1);
    boton(zona, "⏭️ Avanzar al siguiente mes", avanzar);
  }

  function grafico() {
    const max = Math.max(...s.historial, s.p.meta, 1);
    const y = v => 120 - Math.max(0, v) / max * 110;
    const puntos = s.historial.map((v, i) => `${i * 50},${y(v)}`).join(" ");
    const caja = nodo(zona, "div");
    caja.innerHTML = `<svg viewBox="0 0 600 130" preserveAspectRatio="none" role="img" aria-label="Evolución de tu patrimonio">
      <line x1="0" x2="600" y1="${y(s.p.meta)}" y2="${y(s.p.meta)}" stroke="gray" stroke-dasharray="6"/>
      <polyline points="${puntos}" fill="none" stroke="var(--acento)" stroke-width="4"/></svg>
      <small>Tu patrimonio (línea punteada: meta)</small>`;
  }

  function comprar(i, monto) {
    const m = Math.min(monto, s.efectivo);
    s.efectivo -= m;
    s.inv[i] += m;
    pintar();
  }
  function vender(i) {
    s.efectivo += s.inv[i];
    s.inv[i] = 0;
    pintar();
  }
  function pagar() {
    const m = Math.min(s.deuda, s.efectivo);
    s.efectivo -= m;
    s.deuda -= m;
    pintar();
  }

  function decidir([nombre, costo, animo, extra = 0, nota = ""]) {
    // Usa efectivo, luego inversiones y, si no alcanza, deuda
    let falta = costo;
    const usado = Math.min(falta, s.efectivo);
    s.efectivo -= usado;
    falta -= usado;
    s.inv.forEach((v, i) => {
      const m = Math.min(falta, v);
      s.inv[i] -= m;
      falta -= m;
    });
    if (falta > 0) { s.deuda += falta; s.endeudado = true; }
    if (nombre.startsWith("Entrar")) s.estafado = true;
    s.sueldo += extra;
    s.animo = Math.max(0, Math.min(100, s.animo + animo));
    s.mensaje = nota || `Elegiste: ${nombre}.`;
    s.evento = null;
    pintar();
  }

  function avanzar() {
    const cierto = Math.random() < 0.65;
    const antes = total();
    const cambios = activos.map((a, i) => {
      const c = a.min + Math.random() * (a.max - a.min) + (cierto ? s.rumor[1][i] : 0);
      s.inv[i] = Math.max(0, s.inv[i] * (1 + c / 100));
      return `${a.n} ${c >= 0 ? "▲" : "▼"} ${Math.abs(c).toFixed(1)}%`;
    });
    s.deuda *= 1.05;
    const ganancia = total() - antes;
    s.efectivo += s.sueldo;
    s.historial.push(total());
    s.mensaje = `El rumor resultó ${cierto ? "CIERTO ✅" : "FALSO ❌"}. ${cambios.join(" · ")}. Resultado: ${ganancia >= 0 ? "+" : "-"}${dinero(Math.abs(ganancia))}. Cobraste ${dinero(s.sueldo)}.`;
    if (s.mes === 12) return terminar();
    s.mes++;
    s.rumor = azar(rumores);
    if (s.mes % 2 === 0) s.evento = azar(imprevistos);
    pintar();
  }

  function terminar() {
    const final = total();
    let record = 0;
    try { record = Number(localStorage.getItem("recordJuego2")) || 0; } catch {}
    if (final > record) {
      record = final;
      try { localStorage.setItem("recordJuego2", final); } catch {}
    }
    const logros = [
      final >= s.p.meta && "🏆 Meta cumplida",
      !s.endeudado && "🛡️ Un año sin deudas",
      !s.estafado && "🕵️ A prueba de estafas",
      s.animo >= 70 && "😊 Vida equilibrada",
      s.inv.filter(v => v > 1).length >= 3 && "🧺 Portafolio diversificado"
    ].filter(Boolean);
    zona.replaceChildren();
    nodo(zona, "h3", final >= s.p.meta ? "🎉 ¡Ganaste!" : "📚 No llegaste a la meta");
    nodo(zona, "p", s.mensaje, "j-aviso");
    grafico();
    nodo(zona, "p", `Patrimonio final: ${dinero(final)} · Meta: ${dinero(s.p.meta)} · Bienestar: ${s.animo}/100`);
    nodo(zona, "p", `Logros: ${logros.join(" · ") || "ninguno todavía"}`);
    nodo(zona, "p", `Tu mejor patrimonio: ${dinero(record)}`);
    boton(zona, "🔄 Jugar de nuevo", menu);
  }

  menu();
})();
