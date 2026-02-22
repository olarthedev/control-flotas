import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* más rutas se pueden agregar aquí para usuarios, vehículos, etc. */}
        </Routes>
      </div>
    </Router>
  );
}

export default App
