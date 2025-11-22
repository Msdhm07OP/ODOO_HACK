import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/slices/authSlice';
import { RootState } from '../../../store';
import styles from './TopBar.module.css';

export const TopBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={styles.topBar}>
      <div className={styles.search}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          🔔
        </button>

        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
            <span className={styles.userRole}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
