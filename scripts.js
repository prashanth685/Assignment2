let socket;
let email;

function login() {
    email = document.getElementById('email').value;
    if (email) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        socket = new WebSocket('ws://localhost:3000');

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'login', email }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'supportedStocks':
                    displaySupportedStocks(data.stocks);
                    break;
                case 'priceUpdate':
                    updateStockPrice(data.stock, data.price);
                    break;
            }
        };
    }
}

function displaySupportedStocks(stocks) {
    const stockList = document.getElementById('stock-list');
    stocks.forEach(stock => {
        const stockDiv = document.createElement('div');
        stockDiv.textContent = stock;
        stockDiv.onclick = () => subscribeToStock(stock);
        stockList.appendChild(stockDiv);
    });
}

function subscribeToStock(stock) {
    socket.send(JSON.stringify({ type: 'subscribe', email, stock }));
}

function updateStockPrice(stock, price) {
    const priceList = document.getElementById('price-list');
    let stockDiv = document.getElementById(stock);

    if (!stockDiv) {
        stockDiv = document.createElement('div');
        stockDiv.id = stock;
        priceList.appendChild(stockDiv);
    }

    stockDiv.textContent = `${stock}: $${price}`;
}
