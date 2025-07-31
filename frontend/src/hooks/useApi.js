// src/hooks/useApi.js
import { useMutation, useQuery, useQueryClient } from 'react-query';

/**
 * Generic CRUD helpers – keeps pages/components clean.
 * apiFn      – the function exported by services/api.js
 * cacheKey   – react-query cache key
 */
export const useGet = (cacheKey, apiFn, opts = {}) =>
  useQuery(cacheKey, apiFn, opts);

export const usePaginatedGet = (cacheKey, apiFn, params, opts = {}) =>
  useQuery([cacheKey, params], () => apiFn(params), opts);

export const usePost = (cacheKey, apiFn, opts = {}) => {
  const qc = useQueryClient();
  return useMutation(apiFn, {
    ...opts,
    onSuccess: (...args) => {
      qc.invalidateQueries(cacheKey);
      opts.onSuccess?.(...args);
    },
  });
};
