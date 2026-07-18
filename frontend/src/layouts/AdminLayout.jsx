import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="d-flex position-relative">
      <div className="sidebar d-none d-lg-flex flex-column" style={{ width: 250, minHeight: '100vh', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className="d-lg-none position-fixed top-0 start-0 h-100"
        style={{
          width: 280,
          zIndex: 1050,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
        }}
      >
        <div className="d-flex justify-content-end p-3 pb-0">
          <button className="btn-close" onClick={() => setSidebarOpen(false)} />
        </div>
        <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Sidebar />
        </div>
      </div>

      <main className="flex-grow-1 p-3 p-md-4" style={{ background: 'var(--bg-secondary)', minHeight: '100vh', minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2 mb-4 d-lg-none">
          <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text)' }}>
            <i className="bi bi-list"></i>
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
