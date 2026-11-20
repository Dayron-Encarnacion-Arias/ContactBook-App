import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../auth.jsx';
import { withViewTransition } from '../theme.jsx';
import { clearFresh, getFresh } from '../fresh.js';
import ContactNote, { CATEGORY_LABELS } from '../components/ContactNote.jsx';
import Magnet from '../components/Magnet.jsx';
import { PlusIcon, SearchIcon } from '../components/Icons.jsx';

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'personal', label: CATEGORY_LABELS.personal },
  { id: 'trabajo', label: CATEGORY_LABELS.trabajo },
  { id: 'otro', label: CATEGORY_LABELS.otro },
];

const byName = (a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });

// Palabras guía: el primer y el último nombre que se ven en pantalla, como en un diccionario
function useGuideWords(listRef, deps) {
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const notes = listRef.current?.querySelectorAll('.note');
      if (!notes?.length) {
        setGuide(null);
        return;
      }
      const top = 140;
      const visible = [...notes].filter((n) => {
        const r = n.getBoundingClientRect();
        return r.bottom > top && r.top < window.innerHeight;
      });
      if (!visible.length) return;
      setGuide({
        first: visible[0].dataset.name,
        last: visible[visible.length - 1].dataset.name,
        count: visible.length,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return guide;
}

export default function ContactsPage() {
  const { token, isAdmin, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [category, setCategory] = useState('todas');
  const [fresh, setFresh] = useState(getFresh);
  const listRef = useRef(null);
  const [intro, setIntro] = useState(true);

  // La entrada escalonada solo ocurre al cargar; después las notas se mueven con View Transitions
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const timer = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    let active = true;
    apiRequest('/contacts')
      .then((result) => {
        if (!active) return;
        setContacts([...result.data.contacts].sort(byName));
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

  const counts = useMemo(() => {
    const c = { todas: contacts.length, personal: 0, trabajo: 0, otro: 0 };
    contacts.forEach((contact) => {
      c[contact.category] += 1;
    });
    return c;
  }, [contacts]);

  const visible = useMemo(() => {
    const text = appliedQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      if (category !== 'todas' && c.category !== category) return false;
      if (!text) return true;
      return [c.fullName, c.phone, c.email].some((v) => v?.toLowerCase().includes(text));
    });
  }, [contacts, appliedQuery, category]);

  const guide = useGuideWords(listRef, [visible]);

  // Filtrar despega y reacomoda las notas con una View Transition
  // El texto se ve al instante; el filtro se aplica al hacer una pausa breve
  useEffect(() => {
    if (query === appliedQuery) return undefined;
    const timer = setTimeout(() => withViewTransition(() => setAppliedQuery(query)), 220);
    return () => clearTimeout(timer);
  }, [query, appliedQuery]);
  const changeCategory = (value) => withViewTransition(() => setCategory(value));

  const markSeen = useCallback((id) => {
    // Se deja un momento para que el usuario alcance a verla
    setTimeout(() => {
      clearFresh(id);
      setFresh(getFresh());
    }, 1200);
  }, []);

  async function handleDelete(contact) {
    if (!window.confirm(`¿Despegar a ${contact.fullName} de la nevera? Se borra para siempre.`)) return;
    try {
      await apiRequest(`/contacts/${contact.id}`, { method: 'DELETE', token });
      withViewTransition(() => setContacts((list) => list.filter((c) => c.id !== contact.id)));
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  }

  const total = contacts.length;
  const heading =
    status !== 'ready' ? 'La nevera' : total === 1 ? '1 número pegado' : `${total} números pegados`;

  return (
    <section className="door-page">
      <div className="page-head">
        <h1>{heading}</h1>
        {token ? (
          <Link to="/contacts/new" className="button">
            <PlusIcon size={18} />
            Pegar contacto
          </Link>
        ) : (
          <Link to="/login" className="button button-quiet">Entra para pegar uno</Link>
        )}
      </div>

      <div className="toolbar">
        <label className="search">
          <SearchIcon size={20} />
          <input
            type="search"
            placeholder="Busca nombre, teléfono o correo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar contactos"
          />
        </label>

        <div className="filters" role="radiogroup" aria-label="Filtrar por categoría">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={category === f.id}
              className={`filter filter-${f.id}`}
              onClick={() => changeCategory(f.id)}
            >
              <span className="filter-magnet" aria-hidden="true" />
              {f.label}
              <span className="filter-count">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* El resultado del filtro se anuncia una vez; las palabras guía no, porque cambian al hacer scroll */}
      <p className="sr-only" aria-live="polite">
        {status === 'ready' && (visible.length === total ? '' : `${visible.length} de ${total} contactos`)}
      </p>

      <div className="guide">
        {guide && visible.length > 0 ? (
          <>
            <span className="guide-word">{guide.first}</span>
            {guide.first !== guide.last && (
              <>
                <span className="guide-rule" aria-hidden="true" />
                <span className="guide-word">{guide.last}</span>
              </>
            )}
            <span className="guide-count">
              {visible.length === total ? `${total} en total` : `${visible.length} de ${total}`}
            </span>
          </>
        ) : (
          <span className="guide-count">&nbsp;</span>
        )}
      </div>

      {error && <p className="alert" role="alert">{error}</p>}

      {status === 'loading' && (
        <ul className="notes" aria-label="Cargando contactos">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="note note-ghost" style={{ '--tilt': `${(i % 3) - 1}deg` }}>
              <Magnet />
              <span className="ghost-line" />
              <span className="ghost-line short" />
            </li>
          ))}
        </ul>
      )}

      {status === 'ready' && total === 0 && (
        <div className="empty-door">
          <div className="note note-otro empty-note">
            <Magnet size="lg">?</Magnet>
            <h2>La nevera está vacía</h2>
            <p>{token ? 'Pega el primer número y quedará aquí, a la vista.' : 'Entra con tu cuenta para pegar el primer número.'}</p>
            <Link to={token ? '/contacts/new' : '/login'} className="button">
              {token ? 'Pegar el primero' : 'Entrar'}
            </Link>
          </div>
        </div>
      )}

      {status === 'ready' && total > 0 && visible.length === 0 && (
        <p className="no-match">
          Nada pegado coincide con «{appliedQuery || CATEGORY_LABELS[category]}».{' '}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              withViewTransition(() => {
                setQuery('');
                setAppliedQuery('');
                setCategory('todas');
              })
            }
          >
            Ver todos
          </button>
        </p>
      )}

      {status === 'ready' && visible.length > 0 && (
        <ul className={`notes ${intro ? "is-intro" : ""}`} ref={listRef}>
          {visible.map((contact, index) => (
            <ContactNote
              key={contact.id}
              contact={contact}
              index={index}
              canEdit={Boolean(token)}
              canDelete={isAdmin}
              fresh={fresh.has(contact.id)}
              onSeen={() => markSeen(contact.id)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
