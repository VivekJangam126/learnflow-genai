import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, updateDoc, query, where } from "firebase/firestore";
import { Plan } from "../types";

// Suppress Cross-Origin-Opener-Policy warnings from Firebase popup authentication
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0]?.toString().includes('Cross-Origin-Opener-Policy')) {
      return;
    }
    originalWarn(...args);
  };
}

// User provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoDG1HVbckI0yIvrZPov_Dz1tFmYQSBJg",
  authDomain: "learnflow-11205.firebaseapp.com",
  projectId: "learnflow-11205",
  storageBucket: "learnflow-11205.firebasestorage.app",
  messagingSenderId: "723507215272",
  appId: "1:723507215272:web:5043fdcff8298bc0b97b9d",
  measurementId: "G-K0PYBRG55Q"
};

// Force mock mode for demo (set to false to use real Firebase after configuring security rules)
const isConfigured = false;
let forceMockMode = true;

let auth: any;
let db: any;
let googleProvider: any;

if (isConfigured) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    forceMockMode = true; // Fallback immediately if init fails
  }
}

// --- Auth Service Wrapper ---

// Simple event emitter for mock auth changes
const mockAuthListeners: ((user: User | null) => void)[] = [];
const notifyMockAuth = (user: User | null) => mockAuthListeners.forEach(l => l(user));

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  let unsubscribeReal = () => {};

  // 1. Setup Real Listener
  if (isConfigured && auth) {
    unsubscribeReal = onAuthStateChanged(auth, (user) => {
      // If we are forced into mock mode, ignore real auth updates (which might be null or erroring)
      if (!forceMockMode) {
        callback(user);
      }
    });
  }

  // 2. Setup Mock Listener (Always active to allow dynamic switch)
  mockAuthListeners.push(callback);

  // 3. Check for existing mock session on load (if we previously fell back)
  const savedMockUser = localStorage.getItem('learnflow_mock_user');
  if (savedMockUser) {
    // If we have a mock user, we prioritize it if real auth isn't already logged in
    if (!auth?.currentUser) {
       try {
         const user = JSON.parse(savedMockUser);
         forceMockMode = true;
         callback(user);
       } catch(e) {}
    }
  }

  return () => {
    unsubscribeReal();
    const idx = mockAuthListeners.indexOf(callback);
    if (idx > -1) mockAuthListeners.splice(idx, 1);
  };
};

export const signInWithGoogle = async () => {
  if (isConfigured && auth && !forceMockMode) {
    try {
      await signInWithPopup(auth, googleProvider);
      return; // Success, real auth took over
    } catch (error: any) {
      console.warn("Firebase Login Exception:", error.code);
      
      // Case A: User cancelled the popup. Stop here.
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error("Cancelled");
      }

      // Case B: Popup blocked OR Domain unauthorized OR Config error
      // In these cases, we fallback to Mock Mode to let the user use the app.
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/unauthorized-domain' || 
        error.code === 'auth/api-key-not-valid' || 
        error.code === 'auth/internal-error'
      ) {
        console.warn("Environment/Browser issue detected. Switching to Demo/Mock Mode.");
        forceMockMode = true;
      } else {
        // Unknown error, rethrow
        throw error;
      }
    }
  }

  // --- Mock Sign In Logic (Fallback) ---
  console.log("Using Mock Sign In...");
  await new Promise(resolve => setTimeout(resolve, 800)); // Fake network delay
  
  const mockUser = {
    uid: "mock-user-demo-123",
    displayName: "Demo Student",
    email: "student@demo.com",
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "mock-token",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "mock-token",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null
  } as unknown as User;

  localStorage.setItem('learnflow_mock_user', JSON.stringify(mockUser));
  notifyMockAuth(mockUser);
};

export const logout = async () => {
  if (isConfigured && auth && !forceMockMode) {
    await signOut(auth);
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('learnflow_mock_user');
    notifyMockAuth(null);
  }
};

// --- Firestore Service Wrapper (Mockable) ---

const MOCK_DELAY = 600;

export const savePlan = async (plan: Plan) => {
  if (isConfigured && db && !forceMockMode) {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const planRef = doc(collection(db, "plans"), plan.id);
    await setDoc(planRef, plan);
  } else {
    // Mock Save
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const plans = JSON.parse(localStorage.getItem('learnflow_plans') || '[]');
    const existingIndex = plans.findIndex((p: Plan) => p.id === plan.id);
    if (existingIndex >= 0) plans[existingIndex] = plan;
    else plans.push(plan);
    localStorage.setItem('learnflow_plans', JSON.stringify(plans));
  }
};

export const getUserPlans = async (userId: string): Promise<Plan[]> => {
  if (isConfigured && db && !forceMockMode) {
    const q = query(collection(db, "plans"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Plan);
  } else {
    // Mock Get
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const plans = JSON.parse(localStorage.getItem('learnflow_plans') || '[]');
    return plans.filter((p: Plan) => p.userId === userId);
  }
};

export const getPlanById = async (planId: string): Promise<Plan | null> => {
  if (isConfigured && db && !forceMockMode) {
    const docRef = doc(db, "plans", planId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Plan;
    }
    return null;
  } else {
    // Mock Get by ID
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    const plans = JSON.parse(localStorage.getItem('learnflow_plans') || '[]');
    return plans.find((p: Plan) => p.id === planId) || null;
  }
};

export const updatePlanProgress = async (planId: string, updates: Partial<Plan>) => {
  if (isConfigured && db && !forceMockMode) {
    const planRef = doc(db, "plans", planId);
    await updateDoc(planRef, updates);
  } else {
    // Mock Update
    const plans = JSON.parse(localStorage.getItem('learnflow_plans') || '[]');
    const index = plans.findIndex((p: Plan) => p.id === planId);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates };
      localStorage.setItem('learnflow_plans', JSON.stringify(plans));
    }
  }
};