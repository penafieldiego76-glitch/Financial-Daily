function crearPanel(id, titulo, lista) {
  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
  script.async = true;
  script.textContent = JSON.stringify({
    colorTheme: "dark",
    locale: "es",
    dateRange: "1D",
    showChart: true,
    showSymbolLogo: true,
    isTransparent: true,
    width: "100%",
    height: 600,
    tabs: [{
      title: titulo,
      symbols: lista.map(([s, d]) => ({ s, d }))
    }]
  });
  const caja = document.createElement("div");
  caja.className = "tradingview-widget-container__widget";
  document.getElementById(id).append(caja, script);
}

crearPanel("acciones", "Empresas", [
  ["NASDAQ:AAPL", "Apple"],
  ["NASDAQ:MSFT", "Microsoft"],
  ["NASDAQ:NVDA", "Nvidia"],
  ["NASDAQ:GOOGL", "Google"],
  ["NASDAQ:AMZN", "Amazon"],
  ["NASDAQ:TSLA", "Tesla"],
  ["NYSE:JPM", "JPMorgan"],
  ["NYSE:KO", "Coca-Cola"]
]);

crearPanel("criptos", "Cripto", [
  ["COINBASE:BTCUSD", "Bitcoin"],
  ["COINBASE:ETHUSD", "Ethereum"],
  ["COINBASE:SOLUSD", "Solana"],
  ["COINBASE:XRPUSD", "XRP"],
  ["COINBASE:ADAUSD", "Cardano"],
  ["COINBASE:DOGEUSD", "Dogecoin"]
]);
