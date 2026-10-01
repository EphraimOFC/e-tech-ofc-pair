module.exports = async (req, res) => {
  // GET = Show page ONLY - NO BAILEYS IMPORT - So it will NEVER 500
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
<!DOCTYPE html>
<html><head><title>E TECH OFC PAIR</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#000;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.card{background:#111;border:2px solid #00ff88;border-radius:20px;padding:25px;width:92%;max-width:380px;text-align:center}
input{width:90%;padding:14px;border-radius:10px;border:none;margin:12px 0;background:#222;color:#fff;text-align:center}
button{width:95%;padding:14px;border-radius:10px;border:none;background:#00ff88;color:#000;font-weight:bold;font-size:16px}
#code{font-size:30px;color:#00ff88;margin-top:15px;letter-spacing:3px;font-weight:bold}
</style></head><body>
<div class="card">
<h2 style="color:#00ff88">E TECH OFC</h2>
<p>MR EPHRAIM OFC</p>
<p>Pair Site is LIVE ✅</p>
<input id="num" placeholder="2347072956206" value="2347072956206"/>
<button onclick="getCode()">GET PAIR CODE</button>
<div id="code"></div>
<p id="msg"></p>
<script>
async function getCode(){
 const n=document.getElementById('num').value;
 if(!n){alert('Enter number');return}
 document.getElementById('code').innerText='Wait 15 sec...';
 try{
  const r=await fetch('/?number='+n,{method:'POST'});
  const d=await r.json();
  if(d.code){document.getElementById('code').innerText=d.code;document.getElementById('msg').innerText='WhatsApp > Linked Devices > Link with phone number';}
  else{document.getElementById('code').innerText='Error';document.getElementById('msg').innerText=JSON.stringify(d);}
 }catch(e){document.getElementById('code').innerText='Failed';document.getElementById('msg').innerText=e.message;}
}
</script>
</div></body></html>
    `);
  }

  // POST = Generate code - Import Baileys only here
  try {
    const fs = require('fs');
    const pino = require('pino');
    const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
    
    const number = (req.query.number || '').replace(/[^0-9]/g,'');
    if(!number) return res.json({error:'Number required'});

    const dir = '/tmp/'+number;
    if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true});
    fs.mkdirSync(dir,{recursive:true});

    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) },
      logger: pino({level:'silent'}),
      printQRInTerminal:false,
      browser:['E TECH OFC','Chrome','1.0']
    });
    sock.ev.on('creds.update', saveCreds);
    await delay(3000);
    const code = await sock.requestPairingCode(number);
    return res.json({code:code});
  } catch(err){
    return res.status(200).json({error: err.message, stack: err.stack});
  }
};
