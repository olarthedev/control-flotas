import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaDollarSign,
  FaTools,
  FaUser,
  FaTruck,
  FaBell,
  FaCog,
  FaChevronRight
} from 'react-icons/fa';

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { path: '/', label: 'Dashboard', icon: FaTachometerAlt },
      ]
    },
    {
      title: 'OPERACIONES',
      items: [
        { path: '/expenses', label: 'Gastos', icon: FaDollarSign, badge: '3', badgeColor: 'orange' },
        { path: '/maintenance', label: 'Mantenimiento', icon: FaTools },
      ]
    },
    {
      title: 'RECURSOS',
      items: [
        { path: '/drivers', label: 'Conductores', icon: FaUser },
        { path: '/vehicles', label: 'Vehículos', icon: FaTruck },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { path: '/notifications', label: 'Notificaciones', icon: FaBell },
        { path: '/settings', label: 'Configuración', icon: FaCog },
      ]
    }
  ];

  return (
    <aside className="w-56 bg-gray-50 shadow-md flex flex-col border-r border-gray-200 h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
            C
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">LogiControl</h1>
          </div>
        </div>
        <p className="text-xs text-gray-400 font-semibold tracking-wider">FLEET MANAGEMENT SYSTEM</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group text-sm ${
                      active
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`text-sm ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span className={`font-medium text-xs ${active ? 'text-white' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.badge && (
                        <span className={`
                          text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-xs
                          ${item.badgeColor === 'orange' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-700'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                      {active && <FaChevronRight className="text-white text-xs" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            AD
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Admin Demo</p>
            <p className="text-xs text-gray-500 truncate">admin@logicontrol.com</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
