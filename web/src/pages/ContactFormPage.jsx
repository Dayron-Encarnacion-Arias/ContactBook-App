import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../auth.jsx';

const EMPTY = { fullName: '', phone: '', email: '', category: 'personal' };

export default function ContactFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // En edición se cargan los datos actuales del contacto
  useEffect(() => {
    if (!isEdit) return;
    apiRequest(`/contacts/${id}`)
      .then((result) => {
        const { fullName, phone, email, category } = result.data.contact;
        setForm({ fullName, phone, email: email ?? '', category });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, email: form.email.trim() || null };
      await apiRequest(isEdit ? `/contacts/${id}` : '/contacts', {
        method: isEdit ? 'PUT' : 'POST',
        body,
        token,
      });
      navigate('/');
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Cargando…</p>;

  return (
    <section className="narrow">
      <h1>{isEdit ? 'Editar contacto' : 'Nuevo contacto'}</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Nombre completo
          <input value={form.fullName} onChange={update('fullName')} required autoFocus />
        </label>
        <label>
          Teléfono
          <input type="tel" value={form.phone} onChange={update('phone')} required />
        </label>
        <label>
          Correo <span className="muted">(opcional)</span>
          <input type="email" value={form.email} onChange={update('email')} />
        </label>
        <label>
          Categoría
          <select value={form.category} onChange={update('category')}>
            <option value="personal">Personal</option>
            <option value="trabajo">Trabajo</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        {error && <p className="alert">{error}</p>}

        <div className="form-actions">
          <Link to="/" className="button button-ghost">Cancelar</Link>
          <button type="submit" className="button" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear contacto'}
          </button>
        </div>
      </form>
    </section>
  );
}
