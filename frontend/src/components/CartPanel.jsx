import { useCart } from '../context/CartContext';
import { imageUrl as getImgUrl } from '../services/api';

function CartPanel({ show, onClose }) {
  const { items, removeItem, updateCantidad, total, sendWhatsApp, clearCart } = useCart();

  return (
    <>
      {show && (
        <div className="cart-overlay" onClick={onClose} />
      )}

      <div className={`cart-panel${show ? ' cart-panel-open' : ''}`}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h6 className="mb-0 fw-bold">Mi carrito</h6>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="cart-panel-body">
          {items.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-cart fs-1 d-block mb-3"></i>
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <>
              {items.map(item => {
                const precio = parseFloat(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 });
                return (
                  <div key={item.id} className="d-flex gap-3 p-3 border-bottom">
                    <img
                      src={getImgUrl(item.imagen)}
                      alt={item.nombre}
                      style={{ width: 55, height: 55, objectFit: 'cover', borderRadius: 6 }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{item.nombre}</div>
                      <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>${precio}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <button
                          className="btn btn-sm p-0 border-0"
                          style={{ width: 22, height: 22, fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: 4 }}
                          onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                        >−</button>
                        <span style={{ fontSize: '0.85rem', minWidth: 18, textAlign: 'center' }}>{item.cantidad}</span>
                        <button
                          className="btn btn-sm p-0 border-0"
                          style={{ width: 22, height: 22, fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: 4 }}
                          onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                        >+</button>
                        <button
                          className="btn btn-sm p-0 border-0 ms-auto"
                          style={{ color: '#dc3545', fontSize: '0.8rem' }}
                          onClick={() => removeItem(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-panel-footer border-top p-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total</span>
              <span className="fw-bold" style={{ color: 'var(--accent)' }}>
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ background: '#25D366', color: '#fff', fontWeight: 600, borderRadius: 8, padding: '0.6rem' }}
              onClick={() => { sendWhatsApp(); setTimeout(() => { clearCart(); onClose(); }, 500); }}
            >
              <i className="bi bi-whatsapp"></i>
              Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartPanel;
