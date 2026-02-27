import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                fontSize: '4rem',
                color: 'var(--primary)',
                marginBottom: '20px'
            }}>
                ✓
            </div>
            <h1 style={{ marginBottom: '10px' }}>Order Placed Successfully!</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '500px' }}>
                Thank you for shopping on CampusKart. Your order has been confirmed and is being processed.
            </p>
            <Link to="/products" style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'opacity 0.2s'
            }}
                onMouseOver={(e) => e.target.style.opacity = 0.8}
                onMouseOut={(e) => e.target.style.opacity = 1}>
                Continue Shopping
            </Link>
        </div>
    );
};

export default OrderSuccess;
