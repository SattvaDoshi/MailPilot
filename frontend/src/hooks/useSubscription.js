// src/hooks/useSubscription.js
import { useQuery } from 'react-query';
import { subscriptionAPI } from '../services/api';

export const useSubscription = () =>
  useQuery('subscription', subscriptionAPI.getStatus, { staleTime: 5 * 60_000 });
