import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import HomeView from './pages/Home';
import CategoryView from './pages/Category';
import ItemView from './pages/ItemView';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/menu/:slug" element={<CategoryView />} />
          <Route path="/menu/:slug/:itemId" element={<ItemView />} />
          <Route path="/auth" element={<AdminAuth />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;