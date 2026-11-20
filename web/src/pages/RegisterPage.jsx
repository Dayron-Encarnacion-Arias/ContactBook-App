import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';

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
    <section className="narrow">
      <h1>Crear cuenta</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input value={form.name} onChange={update('name')} required autoFocus />
        </label>
        <label>
          Correo
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>
        <label>
          Contraseña <span className="muted">(mínimo 6 caracteres)</span>
          <input type="password" value={form.password} onChange={update('password')} minLength={6} required />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="button" disabled={sending}>
          {sending ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="muted center">
        ¿Ya tienes cuenta? <Link to="/login">Entra</Link>
      </p>
    </section>
  );
}
