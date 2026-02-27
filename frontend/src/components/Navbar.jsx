import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, role, logout } = useContext(AuthContext);

    return (
        <nav className="nav-bar">
            <div>
                <h2>
                    <Link style={{ color: 'white', textDecoration: 'none' }} to={role === 'Admin' ? '/admin' : role === 'Seller' ? '/seller' : '/products'}>
                        CampusKart
                    </Link>
                </h2>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: 'var(--text-muted)' }}>Logged in as: <strong>{role}</strong></span>
                        {role === 'Buyer' && (
                            <Link to="/cart">
                                <button style={{ background: 'var(--surface)', border: '1px solid var(--primary)' }}>
                                    🛒 Cart
                                </button>
                            </Link>
                        )}
                        <button onClick={logout} style={{ backgroundColor: 'var(--danger)', backgroundImage: 'none', padding: '0.5rem 1rem' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button>Login</button></Link>
                        <Link to="/register"><button style={{ background: 'transparent', border: '1px solid var(--primary)' }}>Register</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
