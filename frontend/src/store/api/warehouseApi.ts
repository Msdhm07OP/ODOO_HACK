import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Warehouse'],
  endpoints: (builder) => ({
    getWarehouses: builder.query<any, { page?: number; limit?: number }>({ // ADD PARAMETERS HERE
      query: (params) => ({
        url: '/warehouses',
        params,
      }),
      providesTags: ['Warehouse'],
    }),
    getWarehouse: builder.query<any, string>({
      query: (id) => `/warehouses/${id}`,
      providesTags: ['Warehouse'],
    }),
    createWarehouse: builder.mutation<any, any>({
      query: (data) => ({
        url: '/warehouses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),
    updateWarehouse: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/warehouses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),
    deleteWarehouse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/warehouses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Warehouse'],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
