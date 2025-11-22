import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { productApi } from './api/productApi';
import { warehouseApi } from './api/warehouseApi';
import { documentApi } from './api/documentApi'; // ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [productApi.reducerPath]: productApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer, // ADD THIS
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productApi.middleware,
      warehouseApi.middleware,
      documentApi.middleware // ADD THIS
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
