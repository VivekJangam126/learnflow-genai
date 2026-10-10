import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { signInWithGoogle, logout, subscribeToAuthChanges } from './services/firebase';

import { Layout } from './components/Layout';
import { PlanList } from './components/PlanList';
import { CreatePlan } from './pages/CreatePlan';
import { PlanDetail } from './pages/PlanDetail';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the wrapper that handles both Real Firebase and Mock Mode
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      // Don't alert if the user just cancelled the popup
      if (e.message !== "Cancelled") {
        console.error(e);
        alert("Login could not be completed. See console for details.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut: logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Login Page ---
const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <span className="text-6xl">⚡</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LearnFlow AI</h1>
        <p className="text-gray-500 mb-8">Your personal AI curriculum designer and study companion.</p>
        
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Sign in with Google
        </button>
        
        <div className="mt-8 text-xs text-gray-400">
          Powered by Google Gemini & Firebase
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthRoutes />
      </Router>
    </AuthProvider>
  );
}

const AuthRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading screen while checking auth
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  // If no user and on login page, show login
  if (!user && location.pathname === '/login') {
    return <LoginPage />;
  }

  // If no user but on protected route, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, redirect from login to home
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, show protected routes
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PlanList />} />
        <Route path="/create" element={<CreatePlan />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

// Remove the old routing code below and replace with:
/*
const oldAppCode = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/*" 
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<PlanList />} />
                  <Route path="/create" element={<CreatePlan />} />
                  <Route path="/plan/:id" element={<PlanDetail />} />
                </Routes>
              </Layout>
            </AuthGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};
*/
