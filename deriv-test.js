import * as dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const appId = process.env.DERIV_APP_ID;
const apiToken = process.env.DERIV_API_TOKEN;
const wsUrl = process.env.DERIV_WS_URL;

if (!appId || !wsUrl) {
  console.error('Missing DERIV_APP_ID or DERIV_WS_URL in .env');
  process.exit(1);
}

const socketUrl = new URL(wsUrl);
socketUrl.searchParams.set('app_id', String(appId));

const socket = new WebSocket(socketUrl.toString());

const request = {
  authorize: apiToken,
};

const candleRequest = {
  ticks_history: 'R_10',
  style: 'candles',
  granularity: 60,
  count: 1,
};

let authorized = false;

socket.on('open', () => {
  console.log('Connection status: OPEN');
  console.log(`Connecting to Deriv: ${socketUrl.toString()}`);
  socket.send(JSON.stringify(request));
});

socket.on('message', (raw) => {
  const message = JSON.parse(raw.toString());

  if (message.error) {
    console.error('Deriv error:', JSON.stringify(message.error, null, 2));
    socket.close();
    return;
  }

  if (message.authorize) {
    console.log('Authorization result:', JSON.stringify(message.authorize, null, 2));
    authorized = true;
    socket.send(JSON.stringify(candleRequest));
    return;
  }

  if (message.history) {
    console.log('Latest candle data received:');
    console.log(JSON.stringify(message.history, null, 2));
    socket.close();
    return;
  }

  if (message.tick) {
    console.log('Tick data received:', JSON.stringify(message.tick, null, 2));
  }

  if (message.msg === 'connected') {
    console.log('Connection status: CONNECTED');
  }
});

socket.on('close', (code, reason) => {
  console.log(`Connection closed with code ${code}: ${reason.toString()}`);
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error.message || error);
});

setTimeout(() => {
  if (!authorized) {
    console.log('No authorization response received within timeout.');
    socket.close();
  }
}, 15000);
