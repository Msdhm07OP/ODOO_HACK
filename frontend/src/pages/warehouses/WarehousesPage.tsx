import { useGetWarehousesQuery, useCreateWarehouseMutation } from '../../store/api/warehouseApi';
import { useState } from 'react';
import styles from './Warehouses.module.css';

export const WarehousesPage = () => {
  // Request first page by default to match other pages' usage
  const { data, isLoading } = useGetWarehousesQuery({ page: 1, limit: 100 });
  const [createWarehouse, { isLoading: creating }] = useCreateWarehouseMutation();

  // form state
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Warehouse Management</h1>
          <p className={styles.subtitle}>Manage storage locations</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setShowModal(true)}>
          ➕ Add Warehouse
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading warehouses...</div>
      ) : (
        <div className={styles.grid}>
          {data?.data.warehouses.map((warehouse: any) => (
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

      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Create Warehouse</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const payload: any = { code, name, address, manager, phone, capacity: capacity === '' ? undefined : Number(capacity), is_active: isActive };
                try {
                  await createWarehouse(payload).unwrap();
                  alert('Warehouse created');
                  setShowModal(false);
                  setCode(''); setName(''); setAddress(''); setManager(''); setPhone(''); setCapacity(''); setIsActive(true);
                } catch (err) {
                  console.error(err);
                  alert('Failed to create warehouse');
                }
              }}
            >
              <div className={styles.formRow}><label>Code</label><input value={code} onChange={(e) => setCode(e.target.value)} required/></div>
              <div className={styles.formRow}><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required/></div>
              <div className={styles.formRow}><label>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className={styles.formRow}><label>Manager</label><input value={manager} onChange={(e) => setManager(e.target.value)} /></div>
              <div className={styles.formRow}><label>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className={styles.formRow}><label>Capacity</label><input type="number" value={capacity as any} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} /></div>
              <div className={styles.formRow}><label>Active</label><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /></div>
              <div className={styles.modalActions}><button type="button" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
