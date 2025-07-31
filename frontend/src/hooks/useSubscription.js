import { useState, useEffect } from 'react';
import { getSubscriptionPlans, subscribeUser } from '../services/payments';

const useSubscription = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getSubscriptionPlans();
                setPlans(response);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const subscribe = async (planId) => {
        setLoading(true);
        try {
            await subscribeUser(planId);
            // Handle successful subscription (e.g., show a success message)
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { plans, loading, error, subscribe };
};

export default useSubscription;