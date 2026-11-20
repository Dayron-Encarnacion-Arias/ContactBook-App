import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="empty">
      <h1>Página no encontrada</h1>
      <p className="muted">La dirección no existe en ContactBook.</p>
      <Link to="/" className="button">Volver a contactos</Link>
    </section>
  );
}
