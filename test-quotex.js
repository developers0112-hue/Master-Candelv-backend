import WebSocket from 'ws';

const url = 'wss://ws2.market-qx.info/socket.io/?EIO=3&transport=websocket';
const origin = 'https://market-qx.info';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

console.log('Connecting to Market-QX Socket.IO WebSocket...');
console.log('URL:', url);
console.log('Origin:', origin);
console.log('User-Agent:', userAgent);

const ws = new WebSocket(url, {
  origin,
  headers: {
    Origin: origin,
    'User-Agent': userAgent,
    'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
  },
});

ws.on('open', () => {
  console.log('WebSocket OPEN');
});

ws.on('message', (raw) => {
  const text = typeof raw === 'string' ? raw : raw.toString();
  console.log('RAW MESSAGE:', JSON.stringify(text));

  if (text.startsWith('0')) {
    console.log('Received OPEN packet; sending CONNECT (40)');
    ws.send('40');
  }

  if (text.startsWith('2')) {
    console.log('Received PING packet; replying with PONG (3)');
    ws.send('3');
  }
});

ws.on('error', (err) => {
  console.error('WebSocket ERROR:', err && err.message ? err.message : err);
});

ws.on('close', (code, reason) => {
  console.log('WebSocket CLOSED:', code, reason && reason.toString ? reason.toString() : reason);
});

setTimeout(() => {
  console.log('Script keepalive timeout reached. Closing...');
  ws.close();
}, 30000);
