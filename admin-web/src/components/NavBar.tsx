import { Link } from 'react-router-dom';
import './NavBar.css';

export function NavBar() {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/users">Usuarios</Link></li>
                <li><Link to="/vehicles">Vehículos</Link></li>
                {/* agrega más enlaces según necesites */}
            </ul>
        </nav>
    );
}
