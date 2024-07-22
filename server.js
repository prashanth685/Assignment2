const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

let users = {}; // { email: { stocks: [], socket: WebSocket } }
const supportedStocks = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch(data.type) {
            case 'login':
                users[data.email] = { stocks: [], socket: ws };
                ws.send(JSON.stringify({ type: 'supportedStocks', stocks: supportedStocks }));
                break;
            case 'subscribe':
                if (users[data.email]) {
                    users[data.email].stocks.push(data.stock);
                }
                break;
        }
    });

    ws.on('close', () => {
        for (let email in users) {
            if (users[email].socket === ws) {
                delete users[email];
                break;
            }
        }
    });
});

setInterval(() => {
    for (let email in users) {
        users[email].stocks.forEach(stock => {
            const price = (Math.random() * 1000).toFixed(2);
            users[email].socket.send(JSON.stringify({ type: 'priceUpdate', stock, price }));
        });
    }
}, 1000);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
