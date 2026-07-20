import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = () => window.innerWidth < 992;

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="d-flex position-relative">
      <div
        className="d-none d-lg-flex flex-column"
        style={{
          width: collapsed ? 0 : 250,
          minHeight: '100vh',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          background: 'var(--bg-secondary)',
          borderRight: collapsed ? 'none' : '1px solid var(--border)',
        }}
      >
        <Sidebar />
      </div>

      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="d-lg-none position-fixed top-0 start-0 h-100"
        style={{
          width: 280,
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
        }}
      >
        <div className="d-flex justify-content-end p-3 pb-0">
          <button className="btn-close" onClick={() => setOpen(false)} />
        </div>
        <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Sidebar />
        </div>
      </div>

      <main className="flex-grow-1 p-3 p-md-4" style={{ background: 'var(--bg-secondary)', minHeight: '100vh', minWidth: 0 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => { isMobile() ? setOpen(o => !o) : setCollapsed(c => !c) }} style={{ color: 'var(--text)' }}>
            <i className={`bi ${isMobile() ? (open ? 'bi-x-lg' : 'bi-list') : (collapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar')}`}></i>
          </button>
          <div className="flex-grow-1"></div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
