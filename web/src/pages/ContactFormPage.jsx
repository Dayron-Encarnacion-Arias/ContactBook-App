import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../auth.jsx';
import { markFresh } from '../fresh.js';
import { CATEGORY_LABELS } from '../components/ContactNote.jsx';
import Magnet from '../components/Magnet.jsx';
import { PlusIcon } from '../components/Icons.jsx';

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
      const result = await apiRequest(isEdit ? `/contacts/${id}` : '/contacts', {
        method: isEdit ? 'PUT' : 'POST',
        body,
        token,
      });
      markFresh(result.data.contact.id);
      navigate('/');
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { state: { from: isEdit ? `/contacts/${id}/edit` : '/contacts/new' } });
        return;
      }
      setError(err.message);
      setSaving(false);
    }
  }

  const initial = form.fullName.trim().charAt(0).toUpperCase() || <PlusIcon size={22} />;

  return (
    <section className="pinned-page">
      <form className={`note pinned note-${form.category}`} onSubmit={handleSubmit} aria-busy={loading}>
        <Magnet size="lg">{initial}</Magnet>
        <h1>{isEdit ? 'Corregir la nota' : 'Pegar un contacto'}</h1>

        {loading ? (
          <p className="soft">Despegando la nota para leerla…</p>
        ) : (
          <div className="fields">
            <label className="field">
              <span>Nombre completo</span>
              <input value={form.fullName} onChange={update('fullName')} required autoFocus autoComplete="off" />
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input type="tel" value={form.phone} onChange={update('phone')} required inputMode="tel" placeholder="809-555-0100" />
            </label>
            <label className="field">
              <span>Correo <em>(opcional)</em></span>
              <input type="email" value={form.email} onChange={update('email')} placeholder="nombre@correo.com" />
            </label>

            <fieldset className="field magnet-picker">
              <legend>¿Con qué imán lo pegamos?</legend>
              <div className="magnet-options">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <label key={value} className={`magnet-option note-${value}`}>
                    <input
                      type="radio"
                      name="category"
                      value={value}
                      checked={form.category === value}
                      onChange={update('category')}
                    />
                    <Magnet size="sm" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {error && <p className="alert" role="alert">{error}</p>}

        <div className="form-actions">
          <Link to="/" className="button button-quiet">Cancelar</Link>
          <button type="submit" className="button" disabled={saving || loading}>
            {saving ? 'Pegando…' : isEdit ? 'Guardar cambios' : 'Pegar en la nevera'}
          </button>
        </div>
      </form>
    </section>
  );
}
