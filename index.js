import WebSocket from 'ws';
import 'dotenv/config';

const apiKey = process.env.DERIV_API_TOKEN || process.env.DERIV_API_KEY;
const symbols = (process.env.DERIV_SYMBOLS || 'frxEURUSD,frxGBPUSD,frxUSDJPY').split(',').map((symbol) => symbol.trim()).filter(Boolean);

if (!apiKey) {
  console.error('DERIV_API_TOKEN missing.');
  process.exit(1);
}

const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');

ws.onopen = () => {
  console.log('Connecting to Deriv WebSocket...');
  ws.send(JSON.stringify({
    ticks: symbols.join(',')
  }));
};

ws.onmessage = (msg) => {
  const data = JSON.parse(String(msg.data));

  if (data.status === 'ok') {
    console.log('Subscription acknowledged:', data);
    return;
  }

  if (data.event === 'price') {
    console.log('✅ Live tick received from Deriv');
    console.log(JSON.stringify({
      symbol: data.symbol,
      price: data.price,
      timestamp: data.timestamp,
      exchange: data.exchange,
      currency: data.currency,
    }, null, 2));
    ws.close();
    return;
  }

  if (data.message || data.code) {
    console.error('Deriv error:', data.message || data.code);
    ws.close();
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error.message || error);
};

ws.onclose = () => {
  console.log('WebSocket Connection Closed.');
};
