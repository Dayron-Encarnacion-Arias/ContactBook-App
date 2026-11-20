import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';
import Magnet from '../components/Magnet.jsx';
import { PlusIcon } from '../components/Icons.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await apiRequest('/auth/register', { method: 'POST', body: form });
      navigate('/login', { state: { registered: true, email: form.email } });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <section className="pinned-page">
      <form className="note pinned note-trabajo" onSubmit={handleSubmit}>
        <Magnet size="lg">{form.name.trim().charAt(0).toUpperCase() || <PlusIcon size={22} />}</Magnet>
        <h1>Tu propia nevera</h1>
        <p className="soft">Crea una cuenta para empezar a pegar contactos.</p>

        <div className="fields">
          <label className="field">
            <span>Nombre</span>
            <input value={form.name} onChange={update('name')} required autoFocus autoComplete="name" />
          </label>
          <label className="field">
            <span>Correo</span>
            <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
          </label>
          <label className="field">
            <span>Contraseña <em>(mínimo 6 caracteres)</em></span>
            <input type="password" value={form.password} onChange={update('password')} minLength={6} required autoComplete="new-password" />
          </label>
        </div>

        {error && <p className="alert" role="alert">{error}</p>}

        <div className="form-actions">
          <Link to="/login" className="text-button">Ya tengo cuenta</Link>
          <button type="submit" className="button" disabled={sending}>
            {sending ? 'Creando…' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </section>
  );
}
