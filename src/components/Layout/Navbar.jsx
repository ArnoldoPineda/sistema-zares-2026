import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left: Menu Toggle + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
            title="Menú"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-2xl">🚀</div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Ventas</h1>
              <p className="text-xs text-blue-100">Gestión Integral</p>
            </div>
          </div>
        </div>

        {/* Right: User Info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.email}</p>
            <p className="text-xs text-blue-100">Conectado</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-600 rounded-lg transition flex items-center gap-2"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}