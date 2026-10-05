import { useEffect, useState, useRef } from "react";

export default function App() {
  const [price, setPrice] = useState(0);
  const [ofi, setOfi] = useState(0);
  const [delta, setDelta] = useState(0);
  const prevBook = useRef({ bids: 0, asks: 0 });

  useEffect(() => {
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: "subscribe", args: ["orderbook.50.BTCUSDT"] }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (!data.data) return;

      const book = data.data;
      const bids = book.bids?.reduce((a, b) => a + parseFloat(b[1]), 0) || 0;
      const asks = book.asks?.reduce((a, b) => a + parseFloat(b[1]), 0) || 0;
      const midPrice = book.bids? parseFloat(book.bids[0][0]) : price;

      // Real OFI = (CurrentBid - PrevBid) - (CurrentAsk - PrevAsk)
      const bidDelta = bids - prevBook.current.bids;
      const askDelta = asks - prevBook.current.asks;
      const realOFI = bidDelta - askDelta;

      const normOFI = Math.max(-1, Math.min(1, realOFI / 10)); // normalize -1 to 1

      setPrice(midPrice);
      setOfi(normOFI);
      setDelta(((bids / (bids + asks)) * 100 - 50).toFixed(1));

      prevBook.current = { bids, asks };
      console.log(`RAW WS: ${book.bids?.length} bids, OFI: ${normOFI.toFixed(2)}, Delta: ${delta}%`);
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "20px", fontFamily: "monospace" }}>
      <h2>QUANT-MINI [WS-REAL-OFI] • BTCUSDT • Source: Bybit WS</h2>
      <h1 style={{ fontSize: "40px" }}>${price.toLocaleString()}</h1>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ background: ofi > 0? "#0f0" : "#f00", color: "#000", padding: "20px", borderRadius: "10px" }}>
          OFI: {ofi.toFixed(3)} {ofi > 0.2? "🟢 BUY" : ofi < -0.2? "🔴 SELL" : "⚪ NEUTRAL"}
        </div>
        <div style={{ background: "#222", padding: "20px", borderRadius: "10px" }}>
          Delta: {delta}% | Risk: Low • Size: 0.01 BTC • Leverage: 5x
        </div>
      </div>
      <p style={{ opacity: 0.4, marginTop: "20px" }}>Real Order Flow Imbalance - Prev vs Current Book Diff - 80ms</p>
    </div>
  );
}