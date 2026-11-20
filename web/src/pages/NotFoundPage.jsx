import { Link } from 'react-router-dom';
import Magnet from '../components/Magnet.jsx';

export default function NotFoundPage() {
  return (
    <section className="pinned-page">
      <div className="note pinned note-otro">
        <Magnet size="lg">?</Magnet>
        <h1>Esta nota se cayó</h1>
        <p className="soft">La dirección no existe en ContactBook.</p>
        <div className="form-actions">
          <Link to="/" className="button">Volver a la nevera</Link>
        </div>
      </div>
    </section>
  );
}
