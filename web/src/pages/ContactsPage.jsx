import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../auth.jsx';

const CATEGORY_LABELS = { personal: 'Personal', trabajo: 'Trabajo', otro: 'Otro' };

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function ContactsPage() {
  const { token, isAdmin, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todas');

  useEffect(() => {
    let active = true;
    apiRequest('/contacts')
      .then((result) => {
        if (!active) return;
        setContacts(result.data.contacts);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (category !== 'todas' && c.category !== category) return false;
      if (!text) return true;
      return [c.fullName, c.phone, c.email].some((v) => v?.toLowerCase().includes(text));
    });
  }, [contacts, query, category]);

  async function handleDelete(contact) {
    if (!window.confirm(`¿Borrar a ${contact.fullName}?`)) return;
    try {
      await apiRequest(`/contacts/${contact.id}`, { method: 'DELETE', token });
      setContacts((list) => list.filter((c) => c.id !== contact.id));
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Contactos</h1>
          <p className="muted">
            {status === 'ready' ? `${contacts.length} guardados` : 'Tu libreta, en un solo lugar.'}
          </p>
        </div>
        {token ? (
          <Link to="/contacts/new" className="button">Nuevo contacto</Link>
        ) : (
          <Link to="/login" className="button button-ghost">Entra para agregar</Link>
        )}
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o correo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar contactos"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoría">
          <option value="todas">Todas</option>
          <option value="personal">Personal</option>
          <option value="trabajo">Trabajo</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {error && <p className="alert">{error}</p>}

      {status === 'loading' && <p className="muted">Cargando contactos…</p>}

      {status === 'ready' && contacts.length === 0 && (
        <div className="empty">
          <h2>Todavía no hay contactos</h2>
          <p className="muted">
            {token ? 'Agrega el primero con «Nuevo contacto».' : 'Inicia sesión para agregar el primero.'}
          </p>
        </div>
      )}

      {status === 'ready' && contacts.length > 0 && visible.length === 0 && (
        <p className="muted">Ningún contacto coincide con la búsqueda.</p>
      )}

      <ul className="contact-list">
        {visible.map((contact) => (
          <li key={contact.id} className="contact">
            <span className={`avatar avatar-${contact.category}`} aria-hidden="true">
              {initials(contact.fullName)}
            </span>
            <div className="contact-main">
              <strong>{contact.fullName}</strong>
              <span className="contact-meta">
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
              </span>
            </div>
            <span className={`tag tag-${contact.category}`}>{CATEGORY_LABELS[contact.category]}</span>
            {token && (
              <div className="contact-actions">
                <Link to={`/contacts/${contact.id}/edit`} className="link-button">Editar</Link>
                {isAdmin && (
                  <button type="button" className="link-button danger" onClick={() => handleDelete(contact)}>
                    Borrar
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
