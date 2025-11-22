import { useState } from 'react';
import { useGetDocumentsQuery, useCreateDocumentMutation, useUpdateDocumentStatusMutation, useDeleteDocumentMutation } from '../../store/api/documentApi';
import { useGetProductsQuery } from '../../store/api/productApi';
import { useGetWarehousesQuery } from '../../store/api/warehouseApi';
import './ReceiptsPage.css';

export const ReceiptsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const { data: documentsData, isLoading } = useGetDocumentsQuery({ 
    documentType: 'receipt',
    status: selectedStatus || undefined 
  });
  const { data: productsData } = useGetProductsQuery({ limit: 100 });
  const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 100 });


  const [createDocument] = useCreateDocumentMutation();
  const [updateStatus] = useUpdateDocumentStatusMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const documents = documentsData?.data?.documents || [];
  const products = productsData?.data?.products || [];
  const warehouses = warehousesData?.data?.warehouses || [];

  // Form state
  const [formData, setFormData] = useState({
    partnerName: '',
    referenceNumber: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    lines: [{ productId: '', quantity: 1, unitPrice: 0, notes: '' }],
  });

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: '', quantity: 1, unitPrice: 0, notes: '' }],
    });
  };

  const handleRemoveLine = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument({
        documentType: 'receipt',
        partnerName: formData.partnerName,
        referenceNumber: formData.referenceNumber,
        scheduledDate: new Date(formData.scheduledDate),
        lines: formData.lines,
      }).unwrap();
      
      setShowCreateModal(false);
      setFormData({
        partnerName: '',
        referenceNumber: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        lines: [{ productId: '', quantity: 1, unitPrice: 0, notes: '' }],
      });
      alert('Receipt created successfully!');
    } catch (error) {
      alert('Failed to create receipt');
    }
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    if (newStatus === 'done') {
      const warehouseId = prompt('Enter warehouse ID to receive stock:');
      if (!warehouseId) return;
      
      try {
        await updateStatus({ id: docId, status: newStatus, warehouseId }).unwrap();
        alert('Receipt validated and stock updated!');
      } catch (error) {
        alert('Failed to validate receipt');
      }
    } else {
      try {
        await updateStatus({ id: docId, status: newStatus }).unwrap();
        alert('Status updated successfully!');
      } catch (error) {
        alert('Failed to update status');
      }
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      try {
        await deleteDocument(docId).unwrap();
        alert('Receipt deleted successfully!');
      } catch (error) {
        alert('Failed to delete receipt');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#6B7280',
      waiting: '#F59E0B',
      ready: '#3B82F6',
      done: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  if (isLoading) {
    return <div className="loading">Loading receipts...</div>;
  }

  return (
    <div className="receipts-page">
      <div className="page-header">
        <div>
          <h1>📥 Receipts</h1>
          <p>Manage incoming stock receipts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Receipt
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="waiting">Waiting</option>
          <option value="ready">Ready</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="documents-table">
        <table>
          <thead>
            <tr>
              <th>Document #</th>
              <th>Partner</th>
              <th>Reference</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📥</div>
                  <p>No receipts found. Create your first receipt!</p>
                </td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id}>
                  <td><strong>{doc.document_number}</strong></td>
                  <td>{doc.partner_name || '-'}</td>
                  <td>{doc.reference_number || '-'}</td>
                  <td>{doc.scheduled_date ? new Date(doc.scheduled_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(doc.status) }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.creator.first_name} {doc.creator.last_name}</td>
                  <td>
                    <div className="action-buttons">
                      {doc.status === 'draft' && (
                        <>
                          <button 
                            className="btn-sm btn-secondary"
                            onClick={() => handleStatusChange(doc.id, 'waiting')}
                          >
                            Submit
                          </button>
                          <button 
                            className="btn-sm btn-danger"
                            onClick={() => handleDelete(doc.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {doc.status === 'waiting' && (
                        <button 
                          className="btn-sm btn-secondary"
                          onClick={() => handleStatusChange(doc.id, 'ready')}
                        >
                          Mark Ready
                        </button>
                      )}
                      {doc.status === 'ready' && (
                        <button 
                          className="btn-sm btn-primary"
                          onClick={() => handleStatusChange(doc.id, 'done')}
                        >
                          Validate
                        </button>
                      )}
                      <button 
                        className="btn-sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Receipt</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Partner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="PO-12345"
                  />
                </div>

                <div className="form-group">
                  <label>Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Product Lines</h3>

              {formData.lines.map((line, index) => (
                <div key={index} className="product-line">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Product *</label>
                      <select
                        required
                        value={line.productId}
                        onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(index, 'quantity', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Unit Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <input
                        type="text"
                        value={line.notes}
                        onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>

                    {formData.lines.length > 1 && (
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleRemoveLine(index)}
                        style={{ marginTop: '24px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddLine}
                style={{ marginTop: '16px' }}
              >
                + Add Product Line
              </button>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDocument.document_number}</h2>
              <button className="close-btn" onClick={() => setSelectedDocument(null)}>×</button>
            </div>
            
            <div className="document-details">
              <div className="detail-grid">
                <div><strong>Partner:</strong> {selectedDocument.partner_name}</div>
                <div><strong>Reference:</strong> {selectedDocument.reference_number || '-'}</div>
                <div><strong>Status:</strong> <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedDocument.status) }}>{selectedDocument.status}</span></div>
                <div><strong>Created By:</strong> {selectedDocument.creator.first_name} {selectedDocument.creator.last_name}</div>
              </div>

              <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Product Lines</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDocument.lines.map((line: any) => (
                    <tr key={line.id}>
                      <td>{line.product.name}</td>
                      <td>{line.quantity}</td>
                      <td>${line.unit_price}</td>
                      <td>${(line.quantity * parseFloat(line.unit_price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
