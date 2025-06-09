import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <div className="not-found-container">
        <h2>404 Page</h2>
        <p>Go back<Link to='/home'>Home</Link></p>
      </div>
    </div>
  );
}
