import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import Auth from './pages/Auth';
import PlayerDemo from './pages/PlayerDemo';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<><Navigation /><Dashboard /></>} />
        <Route path="/catalog" element={<><Navigation /><Catalog /></>} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/player" element={<PlayerDemo />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
