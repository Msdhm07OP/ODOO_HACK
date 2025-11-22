import { useState } from 'react';
import { useGetProductsQuery, useCreateProductMutation } from '../../store/api/productApi';
import styles from './Products.module.css';

export const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useGetProductsQuery({ page, limit: 20, search });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();

  // form state for creating a product
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [category, setCategory] = useState('General');
  const [reorderPoint, setReorderPoint] = useState<number | ''>('');
  const [maxStockLevel, setMaxStockLevel] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Product Management</h1>
          <p className={styles.subtitle}>Manage your inventory products</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setShowModal(true)}>
          ➕ Add Product
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by SKU or name..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.products.map((product) => (
                <tr key={product.id}>
                  <td className={styles.sku}>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      product.totalStock <= product.reorderPoint
                        ? styles.badgeDanger
                        : styles.badgeSuccess
                    }`}>
                      {product.totalStock} {product.unitOfMeasure}
                    </span>
                  </td>
                  <td>₹{product.unitPrice.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      Active
                    </span>
                  </td>
                  <td>
                    <button className={styles.iconButton}>✏️</button>
                    <button className={styles.iconButton}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span>
            Page {data.data.pagination.page} of {data.data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === data.data.pagination.totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

        {showModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Create Product</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const payload: any = {
                    sku,
                    name,
                    description,
                    category,
                    unitOfMeasure,
                    unitPrice: unitPrice === '' ? 0 : Number(unitPrice),
                    reorderPoint: reorderPoint === '' ? 0 : Number(reorderPoint),
                    maxStockLevel: maxStockLevel === '' ? undefined : Number(maxStockLevel),
                    supplier,
                  };
                  try {
                    await createProduct(payload).unwrap();
                    // simple feedback and close
                    alert('Product created');
                    setShowModal(false);
                    // reset form
                    setSku(''); setName(''); setDescription(''); setUnitPrice(''); setUnitOfMeasure('pcs'); setReorderPoint(''); setMaxStockLevel(''); setSupplier('');
                  } catch (err) {
                    console.error(err);
                    alert('Failed to create product');
                  }
                }}
              >
                <div className={styles.formRow}>
                  <label>SKU</label>
                  <input value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
                <div className={styles.formRow}>
                  <label>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className={styles.formRow}>
                  <label>Unit Price</label>
                  <input type="number" step="0.01" value={unitPrice as any} onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>
                <div className={styles.formRow}>
                  <label>Unit</label>
                  <input value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} />
                </div>
                <div className={styles.formRow}>
                  <label>Reorder Point</label>
                  <input type="number" value={reorderPoint as any} onChange={(e) => setReorderPoint(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className={styles.formRow}>
                  <label>Max Stock</label>
                  <input type="number" value={maxStockLevel as any} onChange={(e) => setMaxStockLevel(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className={styles.formRow}>
                  <label>Supplier</label>
                  <input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                </div>
                <div className={styles.formRow}>
                  <label>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};
