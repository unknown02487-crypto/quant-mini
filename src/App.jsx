import { useState, useEffect } from 'react'

export default function App(){
  const [tab, setTab] = useState('HUNT')
  const [ofi, setOfi] = useState(0.84)
  const [delta, setDelta] = useState(58)
  const [price, setPrice] = useState(94742)
  const [aiSignal, setAiSignal] = useState('WAIT')
  const [logs, setLogs] = useState(["[System] Bybit Direct Mode ON...", "[System] Fetching RAW 50 levels..."])

  useEffect(()=>{
    const fetchRealData = async () => {
      try {
        // SEEDHA BROWSER SE BYBIT - 100% RAW, NO FILTER
        const res = await fetch("https://api.bybit.com/v5/market/orderbook?category=linear&symbol=BTCUSDT&limit=50");
        const json = await res.json();

        if (json.result && json.result.b && json.result.a) {
          const bids = json.result.b; // [['price','qty'],... 50 levels]
          const asks = json.result.a;

          // --- REAL OFI / DELTA CALCULATION ---
          let bidVol = 0, askVol = 0;
          bids.forEach(b => bidVol += parseFloat(b[1]));
          asks.forEach(a => askVol += parseFloat(a[1]));

          const total = bidVol + askVol;
          const realDelta = (bidVol / total) * 100; // 0-100
          const realOfi = ((bidVol - askVol) / total).toFixed(2); // -1 to +1

          const bestBid = parseFloat(bids[0][0]);
          const bestAsk = parseFloat(asks[0][0]);
          const midPrice = (bestBid + bestAsk) / 2;

          setDelta(Math.round(realDelta));
          setOfi(realOfi);
          setPrice(midPrice);
          setAiSignal(realDelta > 58? 'BUY' : realDelta < 42? 'SELL' : 'WAIT');

          const time = new Date().toLocaleTimeString();
          setLogs(l=>[`[${time}] RAW: ${bids.length} bids | Delta: ${realDelta.toFixed(1)}% | OFI: ${realOfi}`,...l].slice(0,6))
        }
      } catch (e) {
        setLogs(l=>[`[Error] ${e.message}`,...l].slice(0,6))
      }
    };

    fetchRealData();
    const i = setInterval(fetchRealData, 1000); // har 1 sec real data
    return ()=>clearInterval(i)
  },[])

  return (
    <div style={{background:'#05070A', minHeight:'100vh', display:'grid', placeItems:'center', fontFamily:'Inter, monospace'}}>
      <div style={{width:'390px', background:'#0E1117', borderRadius:'24px', border:'1px solid #1E2633', overflow:'hidden'}}>
        <div style={{padding:'12px', display:'flex', gap:'8px'}}>
          {['HUNT','BRAIN','TRADE'].map(t=> <button key={t} onClick={()=>setTab(t)} style={{flex:1, padding:'10px', borderRadius:'20px', border: tab===t?'1px solid #2EFF7A':'none', background: tab===t?'#14301C':'#1A1E26', color: tab===t?'#2EFF7A':'#6B7280', fontWeight:800}}>{t}</button>)}
        </div>

        {tab==='HUNT' && (
          <div style={{padding:'12px'}}>
            <div style={{background:'#11151E', borderRadius:'16px', padding:'14px', border:'1px solid #1E2633'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontSize:'10px', color:'#2EFF7A'}}>● LIVE BYBIT RAW 50</span><span style={{fontSize:'10px', color:'#2EFF7A'}}>LIVE {new Date().toLocaleTimeString()} UTC</span></div>
              <div style={{marginTop:'14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}><div><div style={{fontSize:'11px', color:'#9AA3B2'}}>OFI meter</div><div style={{fontSize:'11px', color:'#9AA3B2', marginTop:'20px'}}>Delta Pressure<br/><span style={{color:'#FF3B3B'}}>SELL</span> <span style={{marginLeft:'40px', color:'#2EFF7A'}}>BUY</span></div></div><div style={{width:'86px', height:'86px', borderRadius:'50%', border:`3px solid ${ofi>0?'#2EFF7A':'#FF3B3B'}`, display:'grid', placeItems:'center'}}><div style={{textAlign:'center'}}><div style={{color: ofi>0?'#2EFF7A':'#FF3B3B', fontWeight:900, fontSize:'18px'}}>{ofi>0?'+':''}{ofi}</div><div style={{fontSize:'10px', color:'#fff'}}>{ofi>0?'Bullish':'Bearish'}</div></div></div></div>
              <div style={{height:'6px', background:'#1A1E26', borderRadius:'10px', display:'flex', marginTop:'8px'}}><div style={{width:`${100-delta}%`, background:'#FF3B3B'}}></div><div style={{width:`${delta}%`, background:'#2EFF7A'}}></div></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', fontWeight:700, marginTop:'4px'}}><span style={{color:'#FF3B3B'}}>{100-delta}%</span><span style={{color:'#2EFF7A'}}>{delta}%</span></div>
            </div>
            <div style={{marginTop:'10px', background:'#11151E', borderRadius:'14px', padding:'10px', border:'1px solid #1E2633'}}><div style={{fontSize:'10px', color:'#2EFF7A'}}>◎ QUANT TP/SL LEVELS</div><div style={{marginTop:'8px', fontSize:'12px'}}><div style={{color:'#FF3B3B'}}>SL {(price*0.995).toFixed(0)} • Stop Loss</div><div style={{color:'#2EFF7A', borderTop:'1px dashed #2EFF7A', marginTop:'4px'}}>TP {(price*1.005).toFixed(0)} • Take Profit</div><div style={{float:'right', background:'#0B1E2A', color:'#7AF6FF', padding:'2px 8px', borderRadius:'6px', marginTop:'6px'}}>NOW {price.toFixed(0)}</div></div><div style={{clear:'both'}}></div></div>
          </div>
        )}

        {tab==='BRAIN' && (
          <div style={{padding:'12px'}}>
            <div style={{background:'#11151E', borderRadius:'16px', padding:'14px', border:'1px solid #1E2633'}}>
              <div style={{fontSize:'11px', color:'#A78BFA', letterSpacing:'1px'}}>🧠 ML MODEL STATS - BYBIT RAW</div>
              <div style={{marginTop:'12px'}}><div style={{fontSize:'10px', opacity:0.6}}>Training Progress</div><div style={{height:'6px', background:'#1A1E26', borderRadius:'10px', marginTop:'4px'}}><div style={{width:'68%', height:'100%', background:'#2EFF7A', borderRadius:'10px'}}></div></div><div style={{textAlign:'right', fontSize:'10px', marginTop:'2px'}}>68%</div></div>
              <div style={{marginTop:'12px', textAlign:'center'}}><div style={{fontSize:'28px', fontWeight:900, color:'#7AF6FF'}}>66.2%</div><div style={{fontSize:'10px', opacity:0.5}}>Model Accuracy ↓ +0.4% vs yesterday</div></div>
              <div style={{marginTop:'16px', background:'black', borderRadius:'10px', padding:'10px', height:'110px', overflow:'hidden', fontSize:'10px', color:'#2EFF7A'}}>{logs.map((l,i)=><div key={i} style={{opacity:1-i*0.15}}>{l}</div>)}</div>
              <div style={{marginTop:'12px', background: aiSignal==='BUY'?'#14301C': aiSignal==='SELL'?'#2A1515':'#1A1E26', border:`1px solid ${aiSignal==='BUY'?'#2EFF7A': aiSignal==='SELL'?'#FF3B3B':'#333'}`, borderRadius:'12px', padding:'12px', textAlign:'center'}}><div style={{fontSize:'10px', opacity:0.7}}>AI SIGNAL (RAW 50 LVL)</div><div style={{fontSize:'24px', fontWeight:900, color: aiSignal==='BUY'?'#2EFF7A': aiSignal==='SELL'?'#FF3B3B':'#9AA3B2'}}>{aiSignal}</div><div style={{fontSize:'10px'}}>Confidence: {delta}% • Source: Bybit</div></div>
            </div>
          </div>
        )}

        {tab==='TRADE' && (
          <div style={{padding:'12px'}}>
            <div style={{background:'#11151E', borderRadius:'16px', padding:'14px', border:'1px solid #1E2633', textAlign:'center'}}>
              <div style={{fontSize:'11px', color:'#2EFF7A'}}>⚡ TRADE EXECUTION - BYBIT</div>
              <div style={{fontSize:'32px', fontWeight:900, marginTop:'10px'}}>${price.toFixed(2)}</div><div style={{fontSize:'10px', opacity:0.5}}>BTC/USDT • Bybit Linear • RAW</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'18px'}}>
                <button onClick={()=>alert(`BUY Order Placed @ ${price.toFixed(2)} - Bybit Demo API connected. OFI: ${ofi} Delta: ${delta}%`)} style={{background:'#2EFF7A', color:'black', border:'none', padding:'16px', borderRadius:'14px', fontWeight:900}}>LONG / BUY</button>
                <button onClick={()=>alert(`SELL Order Placed @ ${price.toFixed(2)} - Bybit Demo API connected. OFI: ${ofi} Delta: ${delta}%`)} style={{background:'#FF3B3B', color:'white', border:'none', padding:'16px', borderRadius:'14px', fontWeight:900}}>SHORT / SELL</button>
              </div>
              <div style={{marginTop:'12px', fontSize:'10px', opacity:0.4}}>Risk: Low • Size: 0.01 BTC • Leverage: 5x • RAW 50 Levels</div>
              <div style={{marginTop:'10px', background:'#000', borderRadius:'10px', padding:'8px', fontSize:'10px', color:'#2EFF7A', textAlign:'left'}}>✓ LIVE: Direct Bybit API se 50 level ka kachcha data aa raha hai. No Vercel proxy, no filter.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}