import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const fetchProducts = async () => {
        try {
            // Build query string based on filters
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const { data } = await api.get(`/products?${params.toString()}`);
            setProducts(data.data);
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    // Fetch products on mount and whenever filters change
    useEffect(() => {
        fetchProducts();
    }, [search, category, minPrice, maxPrice]);

    const handleBuy = async (product) => {
        try {
            const orderData = {
                products: [{ product: product._id, quantity: 1, priceAtPurchase: product.price }],
                shippingAddress: { street: '123 Test St', city: 'Testville', state: 'TS', zipCode: '12345' }
            };
            await api.post('/orders', orderData);
            alert('Order placed successfully!');
            fetchProducts(); // Refresh to show updated stock
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to place order. Make sure you are logged in as a Buyer.');
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await api.post('/cart', { productId: product._id, quantity: 1 });
            alert(`${product.name} added to cart!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart. Make sure you are logged in as a Buyer.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>CampusKart Products</h2>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
            </div>

            {/* Product List */}
            <div className="card-grid">
                {(products || []).map((product) => (
                    <div key={product._id} className="product-card">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p><strong>Price:</strong> ${product.price}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button disabled={product.stockQuantity < 1} onClick={() => handleBuy(product)} style={{ flex: 1 }}>
                                {product.stockQuantity > 0 ? 'Buy Now' : 'Out of Stock'}
                            </button>
                            <button
                                disabled={product.stockQuantity < 1}
                                onClick={() => handleAddToCart(product)}
                                style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--primary)' }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListing;
