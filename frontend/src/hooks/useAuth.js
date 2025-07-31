import { useState, useEffect } from 'react';
import { getCurrentUser, login, logout } from '../services/auth';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const handleLogin = async (credentials) => {
        const loggedInUser = await login(credentials);
        setUser(loggedInUser);
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    return {
        user,
        loading,
        handleLogin,
        handleLogout,
    };
};

export default useAuth;