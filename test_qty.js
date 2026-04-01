const axios = require('axios');
(async () => {
    let token;
    let productId;
    try {
        // Register or login
        try {
            const r = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Test Buyer Qty', email: 'tq@test.com', password: 'password', role: 'Buyer', otp: '123'
            });
            token = r.data.token;
        } catch (e) {
            const l = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'tq@test.com', password: 'password'
            });
            token = l.data.token;
        }

        // Get products
        const pRes = await axios.get('http://localhost:5000/api/products');
        const products = pRes.data.data;
        if (products.length === 0) {
            console.log('No products to buy');
            return;
        }
        const product = products[0];
        productId = product._id;
        console.log(`Product: ${product.name}, stock: ${product.stockQuantity}`);

        // Direct buy
        console.log('Doing direct buy...');
        await axios.post('http://localhost:5000/api/orders', {
            products: [{ product: productId, quantity: 1, priceAtPurchase: product.price }],
            shippingAddress: { street: '1', city: '2', state: '3', zipCode: '4' }
        }, { headers: { Authorization: `Bearer ${token}` } });

        // Check stock again
        const pRes2 = await axios.get('http://localhost:5000/api/products');
        const pAfter = pRes2.data.data.find(p => p._id === productId);
        console.log(`After direct buy stock: ${pAfter.stockQuantity}`);

        console.log('Done.');
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
})();
