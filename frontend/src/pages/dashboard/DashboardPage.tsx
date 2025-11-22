import { useGetProductsQuery } from '../../store/api/productApi';
import styles from './Dashboard.module.css';

export const DashboardPage = () => {
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 5 });

  const kpis = [
    { label: 'Total Products', value: productsData?.data.pagination.total || 0, icon: '📦', change: '+12%' },
    { label: 'Low Stock Items', value: 23, icon: '⚠️', change: '+5' },
    { label: 'Pending Receipts', value: 8, icon: '📥', change: '-3' },
    { label: 'Pending Deliveries', value: 15, icon: '📤', change: '-2' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p className={styles.subtitle}>Inventory overview and key metrics</p>
      </div>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiIcon}>{kpi.icon}</div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>{kpi.label}</p>
              <div className={styles.kpiValueRow}>
                <h2 className={styles.kpiValue}>{kpi.value}</h2>
                <span className={styles.kpiChange}>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>📥</div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Receipt RCP-2025-001 completed</p>
              <p className={styles.activityTime}>2 hours ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>📤</div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Delivery DEL-2025-092 validated</p>
              <p className={styles.activityTime}>4 hours ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>⚖️</div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Stock adjustment ADJ-2025-006 approved</p>
              <p className={styles.activityTime}>Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
