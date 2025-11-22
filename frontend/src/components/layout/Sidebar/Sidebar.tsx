import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/receipts', label: 'Receipts', icon: '📥' },
    { path: '/deliveries', label: 'Deliveries', icon: '📤' },
    { path: '/transfers', label: 'Transfers', icon: '🔄' },
    { path: '/adjustments', label: 'Adjustments', icon: '⚖️' },
    { path: '/warehouses', label: 'Warehouses', icon: '🏢' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.icon}>📦</span>
        <span className={styles.name}>StockMaster Pro</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
