(() => {
  const estilo = document.createElement("style");
  estilo.textContent = `
    #juego { text-align:center; }
    #juego .caja { background:var(--caja); border:2px solid var(--acento); border-radius:16px; padding:25px; }
    #juego .saldo { font-size:2.4rem; font-weight:bold; color:var(--acento); margin:10px; }
    #juego button { margin:6px; }
  `;
  document.head.append(estilo);

  const seccion = document.createElement("section");
  seccion.className = "extras";
  seccion.id = "juego";
  seccion.innerHTML = `
    <div class="caja">
      <h2>🎮 Inversionista por un año</h2>
      <p>Invierte todo tu dinero cada mes. ¿Podrás duplicarlo? (Juego ficticio con resultados al azar.)</p>
      <p id="j-mes"></p>
      <div class="saldo" id="j-saldo"></div>
      <div id="j-botones"></div>
      <p id="j-mensaje" aria-live="polite"></p>
      <p id="j-record"></p>
    </div>`;
  document.querySelector("footer").before(seccion);

  const el = id => document.getElementById(id);
  const dinero = v => "US$ " + Math.round(v).toLocaleString("es-EC");

  // min y max: cambio posible en un mes (%)
  const opciones = [
    { nombre: "🏦 Ahorro", min: 0.3, max: 0.6 },
    { nombre: "📜 Bonos", min: -2, max: 3 },
    { nombre: "🏢 Acciones", min: -10, max: 13 },
    { nombre: "🪙 Cripto", min: -35, max: 45 }
  ];
  // efecto de cada noticia sobre [ahorro, bonos, acciones, cripto]
  const eventos = [
    ["📰 ¡Auge tecnológico!", [0, 0, 8, 10]],
    ["📰 Crisis bancaria.", [0, 1, -12, -8]],
    ["📰 Suben las tasas de interés.", [0.5, -3, -5, -10]],
    ["📰 Fiebre cripto.", [0, 0, 0, 25]],
    ["📰 Hackeo a una plataforma cripto.", [0, 0, 0, -30]],
    ["📰 Grandes ganancias empresariales.", [0, 0, 9, 0]]
  ];

  let saldo, mes, record = 0;
  try { record = Number(localStorage.getItem("recordInversion")) || 0; } catch {}

  function boton(texto, accion) {
    const b = document.createElement("button");
    b.textContent = texto;
    b.onclick = accion;
    el("j-botones").append(b);
  }

  function pintar() {
    el("j-mes").textContent = `Mes ${Math.min(mes, 12)} de 12`;
    el("j-saldo").textContent = dinero(saldo);
    el("j-record").textContent = record ? `🏆 Tu récord: ${dinero(record)}` : "";
  }

  function iniciar() {
    saldo = 1000;
    mes = 1;
    el("j-mensaje").textContent = "¿Dónde inviertes este mes?";
    el("j-botones").replaceChildren();
    opciones.forEach((o, i) => boton(o.nombre, () => jugar(i)));
    pintar();
  }

  function jugar(i) {
    const o = opciones[i];
    let cambio = o.min + Math.random() * (o.max - o.min);
    let noticia = "Mes sin grandes noticias.";
    if (Math.random() < 0.35) {
      const [texto, efectos] = eventos[Math.floor(Math.random() * eventos.length)];
      noticia = texto;
      cambio += efectos[i];
    }
    const antes = saldo;
    saldo = Math.max(0, saldo * (1 + cambio / 100));
    const diferencia = saldo - antes;
    el("j-mensaje").textContent =
      `${noticia} ${diferencia >= 0 ? "✅ Ganaste" : "❌ Perdiste"} ${dinero(Math.abs(diferencia))} (${cambio.toFixed(1)} %).`;
    mes++;
    if (mes > 12) terminar();
    pintar();
  }

  function terminar() {
    const rango = saldo >= 2000 ? "🐺 Lobo de Wall Street"
      : saldo >= 1300 ? "🚀 Gran inversionista"
      : saldo >= 1000 ? "👍 Inversionista prudente"
      : "📚 Aprendiz: ¡inténtalo otra vez!";
    el("j-mensaje").textContent += ` Fin del año. Tu rango: ${rango}`;
    if (saldo > record) {
      record = saldo;
      try { localStorage.setItem("recordInversion", record); } catch {}
    }
    el("j-botones").replaceChildren();
    boton("🔄 Jugar de nuevo", iniciar);
  }

  iniciar();
})();
