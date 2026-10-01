const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const num = (req.query.number || '').replace(/[^0-9]/g, '');
      if (!num) return res.json({ error: 'Number required, e.g. 2347072956206' });

      const path = '/tmp/' + num;
      if (fs.existsSync(path)) fs.rmSync(path, { recursive: true, force: true });
      fs.mkdirSync(path, { recursive: true });

      const { state, saveCreds } = await useMultiFileAuthState(path);
      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'silent' }))
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['E TECH OFC', 'Chrome', '1.0']
      });

      sock.ev.on('creds.update', saveCreds);

      if (!sock.authState.creds.registered) {
        await delay(2000);
        const code = await sock.requestPairingCode(num);
        return res.json({ code: code, message: 'E TECH OFC Pair Success - MR EPHRAIM OFC' });
      } else {
        return res.json({ error: 'Already paired' });
      }
    } catch (err) {
      return res.json({ error: err.message });
    }
  }

  // GET - Show page
  res.setHeader('Content-Type', 'text/html');
  return res.send(`
<!DOCTYPE html>
<html>
<head><title>E TECH OFC PAIR</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#000;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.card{background:#111;border:1px solid #00ff88;border-radius:20px;padding:25px;width:92%;max-width:380px;text-align:center;box-shadow:0 0 30px #00ff8855}
input{width:90%;padding:14px;border-radius:10px;border:none;margin:12px 0;background:#222;color:#fff;text-align:center;font-size:16px}
button{width:95%;padding:14px;border-radius:10px;border:none;background:#00ff88;color:#000;font-weight:bold;font-size:16px;cursor:pointer}
#code{font-size:32px;color:#00ff88;margin-top:15px;font-weight:bold;letter-spacing:5px}
small{color:#888}
</style>
</head>
<body>
<div class="card">
<h2 style="color:#00ff88">E TECH OFC</h2>
<p>MR EPHRAIM OFC</p>
<p>Official Pair Site</p>
<input id="number" placeholder="2347072956206" value="2347072956206"/>
<button onclick="getCode()">GET PAIR CODE</button>
<div id="code"></div>
<p id="info"><small>Enter number with country code<br>Wait 10 sec after click</small></p>
<script>
async function getCode(){
 const n=document.getElementById('number').value;
 if(!n){alert('Enter number');return}
 document.getElementById('code').innerHTML='Loading...';
 document.getElementById('info').innerHTML='Please wait 10 seconds...';
 try{
   const res=await fetch('?number='+n,{method:'POST'});
   const data=await res.json();
   if(data.code){
     document.getElementById('code').innerHTML=data.code;
     document.getElementById('info').innerHTML='<b>Go to WhatsApp > Linked Devices > Link with phone number<br>Enter code: '+data.code+'</b>';
   }else{
     document.getElementById('code').innerHTML='Error';
     document.getElementById('info').innerHTML=JSON.stringify(data);
   }
 }catch(e){
   document.getElementById('code').innerHTML='Failed';
   document.getElementById('info').innerHTML=e.message;
 }
}
</script>
</div>
</body>
</html>
`);
};
