import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Simple default data for testing, or could be form inputs
    const [shippingAddress, setShippingAddress] = useState({
        street: '123 Campus Rd',
        city: 'University Town',
        state: 'State',
        zipCode: '12345'
    });
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (role !== 'Buyer') {
            navigate('/products');
        } else {
            fetchCart();
        }
    }, [role, navigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cart');
            setCartItems(data.data.items || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const { data } = await api.put(`/cart/${productId}`, { quantity: newQuantity });
            setCartItems(data.data.items);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update quantity');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const { data } = await api.delete(`/cart/${productId}`);
            setCartItems(data.data.items);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove item');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0).toFixed(2);
    };

    const handleCheckout = async () => {
        try {
            const { data } = await api.post('/orders', { shippingAddress });
            navigate('/order-success');
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout failed');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading cart...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {cartItems.map((item) => (
                        <div key={item.product._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            background: 'rgba(30, 41, 59, 0.4)'
                        }}>
                            <div>
                                <h3>{item.product.name}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Price: ${item.product.price}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        style={{ padding: '5px 10px' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        style={{ padding: '5px 10px' }}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product._id)}
                                    style={{ background: 'var(--danger)' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        borderTop: '2px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3>Total Amount:</h3>
                        <h2 style={{ color: 'var(--primary)' }}>${calculateTotal()}</h2>
                    </div>

                    <button
                        onClick={handleCheckout}
                        style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = 0.8}
                        onMouseOut={(e) => e.target.style.opacity = 1}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
