import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (err) {
            console.error("AuthContext Init Error:", err);
            return null;
        }
    });

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const updateUser = (newData) => {
        setUser(prev => {
            const updated = { ...prev, ...newData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    // Derived states for backward compatibility (if needed) or easier access
    const manager = user?.role === 'owner' || user?.role === 'admin' ? user : null;
    const player = (user?.role === 'player' || user?.role === 'user') ? user : null;

    return (
        <AuthContext.Provider value={{ user, manager, player, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
