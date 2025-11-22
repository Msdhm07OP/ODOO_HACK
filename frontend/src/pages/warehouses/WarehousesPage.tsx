import { useGetWarehousesQuery } from '../../store/api/warehouseApi';
import styles from './Warehouses.module.css';

export const WarehousesPage = () => {
  const { data, isLoading } = useGetWarehousesQuery();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Warehouse Management</h1>
          <p className={styles.subtitle}>Manage storage locations</p>
        </div>
        <button className={styles.primaryButton}>
          ➕ Add Warehouse
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading warehouses...</div>
      ) : (
        <div className={styles.grid}>
          {data?.data.warehouses.map((warehouse) => (
            <div key={warehouse.id} className={styles.card}>
              <div className={styles.cardIcon}>🏢</div>
              <h3>{warehouse.name}</h3>
              <p className={styles.code}>{warehouse.code}</p>
              <div className={styles.cardDetails}>
                <div className={styles.detail}>
                  <span className={styles.label}>Manager:</span>
                  <span>{warehouse.manager || 'N/A'}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Capacity:</span>
                  <span>{warehouse.capacity || 'N/A'} units</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Phone:</span>
                  <span>{warehouse.phone || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.editButton}>Edit</button>
                <button className={styles.viewButton}>View Stock</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
