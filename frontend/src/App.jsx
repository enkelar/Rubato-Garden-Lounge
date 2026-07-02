import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeView from './pages/Home';
import CategoryView from './pages/Category';
import ItemView from './pages/ItemView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page - category list */}
        <Route path="/" element={<HomeView />} />
        
        {/* Category page - items in a category */}
        <Route path="/menu/:slug" element={<CategoryView />} />
        
        {/* Item page - item detail */}
        <Route path="/menu/:slug/:itemId" element={<ItemView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;