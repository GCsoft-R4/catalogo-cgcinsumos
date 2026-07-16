function ConfirmModal({ show, title, message, confirmLabel, onConfirm, onCancel, loading }) {
  if (!show) return null;
  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        onClick={onCancel}
      />
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1070, width: '90%', maxWidth: 400 }}
      >
        <div
          className="p-4 shadow-lg"
          style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
        >
          <h5 className="fw-bold mb-2">{title}</h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.925rem' }}>{message}</p>
          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button
              className="btn"
              style={{ background: '#dc2626', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : confirmLabel || 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmModal;
