import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Crear usuario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Editar usuario
  const [editing, setEditing] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);


  const fetchUsuarios = () => {
    api.get('/usuarios')
      .then(res => setUsuarios(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    fetchUsuarios();
  }, []);


  const handleCreate = async e => {
    e.preventDefault();

    setError('');
    setSaving(true);

    try {
      await api.post('/usuarios', {
        username,
        password
      });

      setUsername('');
      setPassword('');

      fetchUsuarios();

    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Error al crear usuario'
      );
    } finally {
      setSaving(false);
    }
  };


  const handleEdit = async () => {

    if (!editUsername.trim()) {
      alert('El usuario es obligatorio');
      return;
    }

    try {

      await api.put(
        `/usuarios/${editing.id}`,
        {
          username: editUsername,
          password: editPassword
        }
      );


      setEditing(null);
      setEditUsername('');
      setEditPassword('');

      fetchUsuarios();


    } catch (err) {

      alert(
        err.response?.data?.error ||
        'Error al editar usuario'
      );

    }
  };


  const startEdit = (usuario) => {

    setEditing(usuario);
    setEditUsername(usuario.username);
    setEditPassword('');

  };


  const cancelEdit = () => {

    setEditing(null);
    setEditUsername('');
    setEditPassword('');

  };


  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/usuarios/${deleteTarget}`);
      setDeleteTarget(null);
      fetchUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="table-responsive" style={{ opacity: 0.6, maxWidth: 400, marginTop: 80 }}>
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th style={{ width: 180 }} />
            </tr>
          </thead>
          <tbody>
            {[1,2,3].map(i => (
              <tr key={i}>
                <td><div className="skeleton skeleton-line-sm" /></td>
                <td><div className="skeleton skeleton-line" /></td>
                <td><div className="skeleton" style={{ height: 30, width: 140 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  return (

    <div>

      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => navigate(-1)} style={{ color: 'var(--text)' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="page-title mb-0">
          Usuarios
        </h2>
      </div>


      {/* FORMULARIO EDICIÓN */}

      {editing && (

        <div
          className="card border p-4 mb-4"
          style={{
            borderRadius: 12,
            background: 'var(--bg)'
          }}
        >

          <h5 className="section-title">
            Editar usuario
          </h5>


          <div className="mb-3">

            <label className="form-label">
              Usuario
            </label>

            <input
              type="text"
              className="form-control"
              value={editUsername}
              onChange={
                e => setEditUsername(e.target.value)
              }
            />

          </div>


          <div className="mb-3">

            <label className="form-label">
              Nueva contraseña
            </label>

            <input
              type="password"
              className="form-control"
              value={editPassword}
              placeholder="Dejar vacío para conservar"
              onChange={
                e => setEditPassword(e.target.value)
              }
            />

          </div>


          <div>

            <button
              className="btn btn-accent me-2"
              onClick={handleEdit}
            >
              Guardar cambios
            </button>


            <button
              className="btn btn-secondary"
              onClick={cancelEdit}
            >
              Cancelar
            </button>

          </div>

        </div>

      )}



      <div className="row g-4">


        {/* CREAR */}

        <div className="col-md-5">

          <div
            className="card border p-4"
            style={{
              borderRadius: 12,
              background: 'var(--bg)'
            }}
          >

            <h5 className="section-title">
              Agregar usuario
            </h5>


            {error && (

              <div className="alert alert-danger py-2 small">
                {error}
              </div>

            )}



            <form onSubmit={handleCreate}>


              <div className="mb-3">

                <label className="form-label">
                  Usuario
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={
                    e => setUsername(e.target.value)
                  }
                  required
                />

              </div>



              <div className="mb-3">

                <label className="form-label">
                  Contraseña
                </label>

                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={
                    e => setPassword(e.target.value)
                  }
                  required
                />

              </div>



              <button
                type="submit"
                className="btn btn-accent"
                disabled={saving}
              >

                {
                  saving
                    ? 'Guardando...'
                    : 'Crear usuario'
                }

              </button>


            </form>


          </div>

        </div>



        {/* LISTADO */}

        <div className="col-md-7">

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-people"></i>
              <h5>No hay usuarios</h5>
              <p className="text-muted">Creá el primer usuario para el panel administrativo.</p>
            </div>
          ) : (
          <div className="table-responsive">


            <table className="table align-middle">


              <thead>

                <tr>

                  <th>ID</th>

                  <th>Usuario</th>

                  <th style={{ width: 180 }} />

                </tr>

              </thead>



              <tbody>


                {
                  usuarios.map(u => (

                    <tr key={u.id}>


                      <td className="text-muted">
                        {u.id}
                      </td>


                      <td className="fw-medium">
                        {u.username}
                      </td>


                      <td>


                        <div className="d-flex flex-column flex-sm-row gap-1">


                          <button
                            className="btn btn-sm btn-outline text-nowrap"
                            onClick={() => startEdit(u)}
                          >
                            Editar
                          </button>


                          <button
                            className="btn btn-sm btn-outline-danger text-nowrap"
                            onClick={() => setDeleteTarget(u.id)}
                          >
                            Eliminar
                          </button>


                        </div>


                      </td>


                    </tr>

                  ))
                }


              </tbody>


            </table>


          </div>
          )}


        </div>


      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Eliminar usuario"
        message="¿Estás seguro? El usuario perderá acceso al panel administrativo."
        confirmLabel="Eliminar usuario"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

    </div>

  );

}


export default Usuarios;