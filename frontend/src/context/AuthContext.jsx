import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const navigate = useNavigate();

    // On mount, if token exists, we set user context (in a real app, verify the token via an API!)
    useEffect(() => {
        if (token) {
            setUser({ token, role });
        }
    }, [token, role]);

    const login = (jwtData, userRole) => {
        localStorage.setItem('token', jwtData);
        localStorage.setItem('role', userRole);
        setToken(jwtData);
        setRole(userRole);
        setUser({ token: jwtData, role: userRole });

        // Redirect based on role
        if (userRole === 'Admin') navigate('/admin');
        else if (userRole === 'Seller') navigate('/seller');
        else navigate('/products');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
