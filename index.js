import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pairRouter from './pair.js';
import qrRouter from './qr.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/pair', pairRouter);
app.use('/qr', qrRouter);

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.send(`
<!DOCTYPE html>
<html><head><title>E TECH OFC PAIR</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#000;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.card{background:#111;border:2px solid #00ff88;border-radius:20px;padding:25px;width:92%;max-width:380px;text-align:center}
input{width:90%;padding:14px;border-radius:10px;border:none;margin:12px 0;background:#222;color:#fff;text-align:center}
button{width:95%;padding:14px;border-radius:10px;border:none;background:#00ff88;color:#000;font-weight:bold;font-size:16px}
#code{font-size:30px;color:#00ff88;margin-top:15px;font-weight:bold}
</style></head><body>
<div class="card">
<h2 style="color:#00ff88">E TECH OFC</h2><p>MR EPHRAIM OFC - OFFICIAL PAIR</p>
<p>Pair Site LIVE ✅ Render</p>
<input id="num" placeholder="2347072956206" value="2347072956206"/>
<button onclick="getCode()">GET PAIR CODE</button>
<div id="code"></div><p id="msg"></p>
<script>
async function getCode(){
 const n=document.getElementById('num').value;
 if(!n){alert('Enter number');return}
 document.getElementById('code').innerText='Wait 15 sec...';
 try{
  const r=await fetch('/pair?number='+n,{method:'POST'});
  const d=await r.json();
  if(d.code){document.getElementById('code').innerText=d.code;document.getElementById('msg').innerText='WhatsApp > Linked Devices > Link with phone number';}
  else{document.getElementById('code').innerText='Error';document.getElementById('msg').innerText=JSON.stringify(d);}
 }catch(e){document.getElementById('code').innerText='Failed';document.getElementById('msg').innerText=e.message;}
}
</script>
</div></body></html>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('E TECH OFC PAIR LIVE ON ' + PORT));
