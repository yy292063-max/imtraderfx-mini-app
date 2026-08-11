
"use client";

import {useEffect,useState} from "react";

export default function Home(){

const [user,setUser]=useState("Trader");
const [balance,setBalance]=useState(10000);
const [risk,setRisk]=useState(1);
const [stop,setStop]=useState(50);
const [result,setResult]=useState("");

useEffect(()=>{
 if(window.Telegram?.WebApp){
  const tg=window.Telegram.WebApp;
  tg.ready();
  const u=tg.initDataUnsafe?.user;
  if(u?.username)setUser("@"+u.username);
  else if(u?.first_name)setUser(u.first_name);
 }
},[]);

function calc(){
 let size=(balance*risk/100)/stop;
 setResult(size.toFixed(2)+" Lots");
}

return <main className="container">

<div className="card">
<h1>IMTraderFX</h1>
<h2>Trader Portal</h2>
<p>Welcome, {user}</p>
<p>Professional trading resources for disciplined traders.</p>
<button
  onClick={() => {
    window.location.href = "https://imtraderfx-global.mystrikingly.com";
  }}
>
  START EVALUATION
</button>
</div>

<div className="card">
<h2>Risk Calculator</h2>
<input value={balance} onChange={e=>setBalance(Number(e.target.value))}/>
<input value={risk} onChange={e=>setRisk(Number(e.target.value))}/>
<input value={stop} onChange={e=>setStop(Number(e.target.value))}/>
<button onClick={calc}>CALCULATE</button>
<h3>{result}</h3>
</div>

<div className="card">
<h2>Community</h2>
<button
  onClick={() => {
    window.location.href = "https://t.me/IMTRADERFX_GlobalForexPlatfo";
  }}
>
  JOIN COMMUNITY
</button>
</div>

</main>
}
