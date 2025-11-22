import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export const documentApi = createApi({
  reducerPath: 'documentApi',
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
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocuments: builder.query<any, any>({
      query: (params) => ({
        url: '/documents',
        params,
      }),
      providesTags: ['Document'],
    }),
    getDocument: builder.query<any, string>({
      query: (id) => `/documents/${id}`,
      providesTags: ['Document'],
    }),
    createDocument: builder.mutation<any, any>({
      query: (data) => ({
        url: '/documents',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Document'],
    }),
    updateDocumentStatus: builder.mutation<any, { id: string; status: string; warehouseId?: string }>({
      query: ({ id, status, warehouseId }) => ({
        url: `/documents/${id}/status`,
        method: 'PATCH',
        body: { status, warehouseId },
      }),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
} = documentApi;
