import React from 'react';
import { useAuth } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-screen flex-shrink-0 sticky top-0 z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600 tracking-tight flex items-center gap-2">
            <span className="text-2xl">⚡</span> LearnFlow
          </h1>
        </div>
        
        <nav className="px-4 space-y-1">
          <button
            onClick={() => navigate('/')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
             onClick={() => navigate('/create')}
             className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
               isActive('/create') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
             }`}
          >
            New Plan
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="text-sm truncate max-w-[120px]">
              <p className="font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
