import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { WarehousesPage } from './pages/warehouses/WarehousesPage';
import { ReceiptsPage } from './pages/receipts/ReceiptsPage';
import { DeliveriesPage } from './pages/deliveries/DeliveriesPage';
import { TransfersPage } from './pages/transfers/TransfersPage';
import { AdjustmentsPage } from './pages/adjustments/AdjustmentsPage';
import { Layout } from './components/layout/Layout';
import { PrivateRoute } from './routes/PrivateRoute';
import { PublicRoute } from './routes/PublicRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="adjustments" element={<AdjustmentsPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
