import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import HomeView from './pages/Home';
import CategoryView from './pages/Category';
import ItemView from './pages/ItemView';

const AdminAuth = lazy(() => import('./pages/AdminAuth'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/menu/:slug" element={<CategoryView />} />
      <Route path="/menu/:slug/:itemId" element={<ItemView />} />
      <Route
        path="/auth"
        element={
          <Suspense fallback={<div className="rg-loading">Loading…</div>}>
            <AdminAuth />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Suspense fallback={<div className="rg-loading">Loading…</div>}>
              <AdminDashboard />
            </Suspense>
          </RequireAuth>
        }
      />

    </Routes>
  );
}

export default App;