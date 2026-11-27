// Cinta de cotizaciones
const cinta = document.createElement("script");
cinta.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
cinta.async = true;
cinta.textContent = JSON.stringify({
  symbols: [
    { proName: "COINBASE:BTCUSD", title: "Bitcoin" },
    { proName: "COINBASE:ETHUSD", title: "Ethereum" },
    { proName: "NASDAQ:AAPL", title: "Apple" },
    { proName: "NASDAQ:TSLA", title: "Tesla" },
    { proName: "NASDAQ:NVDA", title: "Nvidia" },
    { proName: "FX:EURUSD", title: "Euro/Dólar" }
  ],
  colorTheme: "dark",
  locale: "es",
  displayMode: "adaptive"
});
const cajaCinta = document.createElement("div");
cajaCinta.className = "tradingview-widget-container__widget";
$("cinta").append(cajaCinta, cinta);

// Navegación entre fechas
function irA(fecha) {
  location.search = `?fecha=${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}
function mover(dias) {
  const f = new Date(hoy);
  f.setDate(f.getDate() + dias);
  irA(f);
}
$("ayer").onclick = () => mover(-1);
$("manana").onclick = () => mover(1);
$("actual").onclick = () => { location.href = location.pathname; };
$("calendario").value = `${hoy.getFullYear()}-${mes}-${dia}`;
$("calendario").onchange = e => {
  if (e.target.value) irA(new Date(e.target.value + "T12:00:00"));
};

// Consejo del día
const consejos = [
  "Ahorra primero y gasta después.",
  "Antes de invertir, arma un fondo de emergencia.",
  "Compara el costo total de un crédito, no solo la cuota.",
  "No pongas todo tu dinero en un solo lugar.",
  "Los pequeños gastos repetidos también pesan.",
  "Si prometen ganancias altas y sin riesgo, desconfía.",
  "Anota tus gastos: lo que se mide se puede mejorar."
];
$("consejo").textContent = consejos[(hoy.getDate() - 1) % consejos.length];

// Quiz: [pregunta, opciones, posición correcta empezando en 0]
const preguntas = {
  "01-01": ["¿En qué año llegaron los billetes y monedas de euro?", ["1999", "2002", "2005"], 1],
  "01-03": ["¿Bajo qué nombre se creó Bitcoin?", ["Satoshi Nakamoto", "Bill Gates", "Alfred Nobel"], 0],
  "01-09": ["¿A cuántos sucres se fijó el dólar?", ["5.000", "10.000", "25.000"], 2],
  "05-17": ["¿Cómo se llamó el acuerdo de 1792?", ["Bretton Woods", "Buttonwood", "Maastricht"], 1],
  "08-15": ["¿Qué presidente suspendió la convertibilidad en oro?", ["Nixon", "Kennedy", "Reagan"], 0],
  "09-15": ["¿Qué banco quebró en 2008?", ["HSBC", "Lehman Brothers", "Santander"], 1],
  "10-19": ["¿Cuánto cayó el Dow Jones en 1987?", ["5 %", "10 %", "22,6 %"], 2],
  "10-24": ["¿Cómo se conoce el 24 de octubre de 1929?", ["Jueves Negro", "Lunes Negro", "Viernes Rojo"], 0],
  "11-26": ["¿Qué variante sacudió los mercados en 2021?", ["Delta", "Ómicron", "Alfa"], 1],
  "11-27": ["¿Qué inventó Alfred Nobel?", ["El teléfono", "La dinamita", "La radio"], 1]
};
const generales = [
  ["¿Qué es la inflación?", ["Subida general de precios", "Un tipo de banco", "Un impuesto"], 0],
  ["¿Qué significa diversificar?", ["Gastar todo", "Repartir el dinero para reducir riesgo", "Pedir préstamos"], 1],
  ["¿Qué es el interés compuesto?", ["Una multa", "Un seguro", "Interés que también gana interés"], 2]
];
const [texto, opciones, correcta] =
  preguntas[`${mes}-${dia}`] || generales[hoy.getDate() % generales.length];
$("pregunta").textContent = texto;
opciones.forEach((opcion, i) => {
  const b = document.createElement("button");
  b.textContent = opcion;
  b.onclick = () => {
    $("resultado").textContent = i === correcta
      ? "✅ ¡Correcto!"
      : `❌ La respuesta es: ${opciones[correcta]}`;
  };
  $("opciones").append(b);
});

// Calculadora de ahorro
function calcular() {
  const monto = Math.max(0, Number($("monto").value));
  const r = Math.max(0, Number($("tasa").value)) / 100 / 12;
  const n = Math.min(60, Math.max(0, Number($("anios").value))) * 12;
  const total = r ? monto * ((1 + r) ** n - 1) / r : monto * n;
  const formato = v => v.toLocaleString("es-EC", { maximumFractionDigits: 0 });
  $("total").textContent = `Tendrías US$ ${formato(total)} (aportando US$ ${formato(monto * n)})`;
}
["monto", "tasa", "anios"].forEach(id => $(id).oninput = calcular);
calcular();

// Compartir
$("compartir").onclick = () => {
  const enlace = `${location.origin}${location.pathname}?fecha=${mes}-${dia}`;
  const mensaje = `📰 ${$("titulo").textContent} ${enlace}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
};
