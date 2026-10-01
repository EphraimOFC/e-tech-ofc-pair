const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Show HTML page when you open site with GET
  if (req.method === 'GET') {
    return res.status(200).send(`
<html><head><title>E TECH OFC PAIR</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
body{font-family:sans-serif;background:#0f0f0f;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
.box{background:#1a1a1a;padding:30px;border-radius:15px;width:90%;max-width:400px;text-align:center;box-shadow:0 0 20px #00ff88}
input{width:90%;padding:12px;margin:10px 0;border-radius:8px;border:none;outline:none}
button{padding:12px 25px;background:#00ff88;color:#000;border:none;border-radius:8px;font-weight:bold;cursor:pointer;width:95%}
h2{color:#00ff88}
</style></head><body>
<div class="box">
<h2>E TECH OFC</h2>
<p>MR EPHRAIM OFC Pair Site</p>
<p>Enter Number with Country Code</p>
<input id="num" placeholder="2347072956206" />
<button onclick="pair()">Get Pair Code</button>
<p id="result"></p>
<script>
async function pair(){
 let n=document.getElementById('num').value;
 if(!n){alert('Enter number');return}
 document.getElementById('result').innerHTML='Please wait...';
 let r=await fetch('/api/pair?number='+n,{method:'POST'});
 let d=await r.json();
 document.getElementById('result').innerHTML=d.code ? '<h1>'+d.code+'</h1><p>Open WhatsApp > Linked Devices > Link with phone number</p>' : JSON.stringify(d);
}
</script>
</div></body></html>
    `);
  }

  // Generate pair code on POST
  try {
    const number = req.query.number || req.body?.number;
    if (!number) return res.status(400).json({ error: 'Number required' });

    const dir = '/tmp/' + number;
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(dir);
    
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['E TECH OFC', 'Chrome', '1.0']
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
      await delay(1500);
      let num = number.replace(/[^0-9]/g, '');
      const code = await sock.requestPairingCode(num);
      return res.json({ code: code });
    } else {
      return res.json({ error: 'Already registered' });
    }

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};
