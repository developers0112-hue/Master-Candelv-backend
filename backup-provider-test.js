import WebSocket from 'ws';
import 'dotenv/config';

const policy = {
  allowSignalInput: true,
  allowTrainingInput: true,
  allowProductionData: true,
  brokerExecutionEnabled: false,
};

if (!policy.allowSignalInput || policy.brokerExecutionEnabled) {
  throw new Error('Data policy denied this source: signal input must be enabled and broker execution disabled.');
}

const providers = [
  {
    name: 'finnhub',
    enabled: String(process.env.FINNHUB_ENABLED ?? '').toLowerCase() === 'true',
    apiKey: process.env.FINNHUB_API_KEY,
    url: process.env.FINNHUB_WS_URL ?? 'wss://ws.finnhub.io',
    symbols: (process.env.FINNHUB_SYMBOLS ?? 'OANDA:EUR_USD').split(',').map((v) => v.trim()).filter(Boolean),
    connect: () => {
      const ws = new WebSocket(`${process.env.FINNHUB_WS_URL ?? 'wss://ws.finnhub.io'}?token=${encodeURIComponent(process.env.FINNHUB_API_KEY ?? '')}`);
      ws.onopen = () => {
        console.log(`Connected to Finnhub. Subscribing to: ${providers[0].symbols.join(', ')}`);
        for (const symbol of providers[0].symbols) {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        }
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(String(event.data));
        if (data.type === 'trade' || data.type === 'ping' || data.type === 'subscribe') {
          console.log('✅ Finnhub message received:', JSON.stringify(data));
          ws.close();
          return;
        }
        if (data?.data?.length) {
          const first = data.data[0];
          console.log('✅ Finnhub price stream received:', JSON.stringify(first));
          ws.close();
        }
      };
      ws.onerror = (error) => {
        console.error('Finnhub error:', error.message || error);
      };
      ws.onclose = () => {
        console.log('Finnhub connection closed.');
      };
    },
  },
  {
    name: 'oanda',
    enabled: String(process.env.OANDA_ENABLED ?? '').toLowerCase() === 'true',
    apiKey: process.env.OANDA_API_TOKEN,
    accountId: process.env.OANDA_ACCOUNT_ID,
    url: process.env.OANDA_STREAM_URL ?? 'https://stream-fxpractice.oanda.com',
    symbols: ['EUR_USD'],
    connect: () => {
      const ws = new WebSocket(`${process.env.OANDA_STREAM_URL ?? 'https://stream-fxpractice.oanda.com'}?accountId=${encodeURIComponent(process.env.OANDA_ACCOUNT_ID ?? '')}`);
      ws.onopen = () => {
        console.log('Connected to OANDA. Sending price subscription.');
        ws.send(JSON.stringify({
          type: 'HEARTBEAT',
        }));
        ws.send(JSON.stringify({
          type: 'PRICE',
          instruments: ['EUR_USD'],
        }));
      };
      ws.onmessage = (event) => {
        const text = String(event.data || '');
        if (!text) return;
        try {
          const data = JSON.parse(text);
          if (data.type === 'PRICE' || data.type === 'HEARTBEAT') {
            console.log('✅ OANDA message received:', JSON.stringify(data));
            ws.close();
          }
        } catch {
          console.log('OANDA raw message:', text);
        }
      };
      ws.onerror = (error) => {
        console.error('OANDA error:', error.message || error);
      };
      ws.onclose = () => {
        console.log('OANDA connection closed.');
      };
    },
  },
  {
    name: 'binance',
    enabled: String(process.env.BINANCE_ENABLED ?? '').toLowerCase() === 'true',
    apiKey: null,
    url: 'wss://stream.binance.com:9443/ws',
    symbols: ['btcusdt'],
    connect: () => {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
      ws.onopen = () => {
        console.log('Connected to Binance. Waiting for kline data.');
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(String(event.data));
        if (data.k) {
          console.log('✅ Binance price event received:', JSON.stringify({
            symbol: data.s,
            close: data.k.c,
            open: data.k.o,
            ts: data.k.t,
          }));
          ws.close();
        }
      };
      ws.onerror = (error) => {
        console.error('Binance error:', error.message || error);
      };
      ws.onclose = () => {
        console.log('Binance connection closed.');
      };
    },
  },
];

const viable = providers.filter((provider) => provider.enabled && (provider.apiKey || provider.name === 'binance'));

if (viable.length === 0) {
  console.log('No alternative backup providers are currently enabled with valid credentials.');
  process.exit(0);
}

console.log('Checking backup providers under policy:', policy);

for (const provider of viable) {
  console.log(`Attempting ${provider.name}...`);
  provider.connect();
  break;
}
