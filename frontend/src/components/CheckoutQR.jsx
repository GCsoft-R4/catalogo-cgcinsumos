import { useState } from 'react';

function CheckoutQR({ total, onClose }) {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="checkout-overlay" onClick={onClose}>
        <div className="checkout-modal" onClick={e => e.stopPropagation()}>
          <div className="text-center p-4">
            <div className="mb-3" style={{ fontSize: '3rem', color: '#25D366' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="fw-bold mb-3">Gracias por tu compra</h4>
            <p className="text-muted mb-4">
              Nos comunicaremos para confirmar el pago y preparar tu pedido.
            </p>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 8, padding: '0.5rem 2rem' }}
              onClick={onClose}
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose} />

        <div className="text-center p-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <i className="bi bi-qr-code" style={{ fontSize: '1.2rem', color: '#009ee3' }}></i>
            <span className="fw-bold" style={{ color: '#009ee3' }}>Mercado Pago</span>
          </div>

          <h5 className="fw-bold mb-1">Escaneá el QR para pagar</h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
            Abrí la app de Mercado Pago y escaneá el código
          </p>

          <div className="d-inline-block p-3 mb-4" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
            <img
              src="/qr-mercadopago.png"
              alt="QR de Mercado Pago"
              style={{ width: 220, height: 220, objectFit: 'contain' }}
            />
          </div>

          <div className="mb-4">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total a pagar</span>
            <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--accent)' }}>
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              className="btn w-100"
              style={{ background: '#009ee3', color: '#fff', fontWeight: 600, borderRadius: 8, padding: '0.65rem' }}
              onClick={() => setConfirmed(true)}
            >
              <i className="bi bi-check-lg me-1"></i>
              Ya realicé el pago
            </button>
            <button
              className="btn btn-outline w-100"
              style={{ borderRadius: 8, padding: '0.65rem' }}
              onClick={onClose}
            >
              Volver al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutQR;
