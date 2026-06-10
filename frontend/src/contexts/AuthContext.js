import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const local = localStorage.getItem('user');
        return local ? JSON.parse(local) : null;
    });
    const login = (userObj) => { setUser(userObj); localStorage.setItem('user', JSON.stringify(userObj)); }
    const logout = () => { setUser(null); localStorage.removeItem('user'); }
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() { return useContext(AuthContext); }
