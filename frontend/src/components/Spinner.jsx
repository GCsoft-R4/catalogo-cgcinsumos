function Spinner() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg, #fff)',
      zIndex: 9999,
    }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/gclogo.png" alt="" style={{ height: 48, marginBottom: 16, opacity: 0.8 }} />
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border, #e5e7eb)',
          borderTopColor: 'var(--accent, #2563eb)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto',
        }} />
      </div>
    </div>
  );
}

export default Spinner;
