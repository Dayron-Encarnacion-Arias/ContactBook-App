import { Link } from 'react-router-dom';
import { MailIcon, PencilIcon, PhoneIcon, TrashIcon } from './Icons.jsx';
import Magnet from './Magnet.jsx';

export const CATEGORY_LABELS = { personal: 'Personal', trabajo: 'Trabajo', otro: 'Otro' };

// Inclinación estable por contacto: cada nota cuelga un poco distinta, siempre igual
function tiltFor(id) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 45) - 22) / 10;
}

export default function ContactNote({ contact, canEdit, canDelete, fresh, onSeen, onDelete, index }) {
  const initial = contact.fullName.trim().charAt(0).toUpperCase();

  return (
    <li
      className={`note note-${contact.category}`}
      style={{
        '--tilt': `${tiltFor(contact.id)}deg`,
        '--i': index,
        viewTransitionName: `note-${contact.id}`,
      }}
      data-name={contact.fullName}
      onPointerEnter={fresh ? onSeen : undefined}
      onFocus={fresh ? onSeen : undefined}
    >
      <Magnet label={`Categoría: ${CATEGORY_LABELS[contact.category]}`}>{initial}</Magnet>
      {fresh && <span className="fresh-sticker">Recién pegado</span>}

      <div className="note-body">
        <h2 className="note-name">{contact.fullName}</h2>
        <a className="note-phone" href={`tel:${contact.phone}`}>
          <PhoneIcon size={16} />
          {contact.phone}
        </a>
        {contact.email && (
          <a className="note-mail" href={`mailto:${contact.email}`}>
            <MailIcon size={15} />
            <span>{contact.email}</span>
          </a>
        )}
      </div>

      {canEdit && (
        <div className="note-actions">
          <Link to={`/contacts/${contact.id}/edit`} className="icon-button" aria-label={`Editar a ${contact.fullName}`}>
            <PencilIcon size={16} />
            <span>Editar</span>
          </Link>
          {canDelete && (
            <button
              type="button"
              className="icon-button danger"
              onClick={() => onDelete(contact)}
              aria-label={`Despegar a ${contact.fullName}`}
            >
              <TrashIcon size={16} />
              <span>Despegar</span>
            </button>
          )}
        </div>
      )}
    </li>
  );
}
