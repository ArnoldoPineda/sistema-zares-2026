import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  FileText,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard', color: 'text-blue-600' },
    { icon: Package, label: 'Artículos', path: '/articulos', color: 'text-green-600' },
    { icon: Users, label: 'Clientes', path: '/clientes', color: 'text-purple-600' },
    { icon: ShoppingCart, label: 'Ventas', path: '/ventas', color: 'text-orange-600' },
    { icon: BarChart3, label: 'Pagos', path: '/pagos', color: 'text-red-600' },
    { icon: FileText, label: 'Reportes', path: '/reportes', color: 'text-indigo-600' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Cierra sidebar en móvil
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full w-64 bg-gray-900 text-white shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:top-0 md:translate-x-0`}
      >
        {/* Close Button (móvil) */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Sistema de Gestión de Ventas v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}