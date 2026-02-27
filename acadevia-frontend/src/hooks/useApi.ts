import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import apiClient from '@/services/api.client';
import type { AxiosError, AxiosRequestConfig } from 'axios';

export function useApiQuery<T>(
  key: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'> & {
    params?: Record<string, unknown>;
    axiosConfig?: AxiosRequestConfig;
  },
) {
  const { params, axiosConfig, ...queryOptions } = options ?? {};

  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<T>(url, {
        params,
        ...axiosConfig,
      });
      return response.data;
    },
    ...queryOptions,
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'> & {
    axiosConfig?: AxiosRequestConfig;
  },
) {
  const { axiosConfig, ...mutationOptions } = options ?? {};

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await apiClient<TData>({
        url,
        method,
        data: variables,
        ...axiosConfig,
      });
      return response.data;
    },
    ...mutationOptions,
  });
}
