import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import Auth from './pages/Auth';
import PlayerDemo from './pages/PlayerDemo';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/courses"
          element={
            <>
              <Navigation />
              <Catalog />
            </>
          }
        />
        <Route path="/course/:slug" element={<CourseDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/player" element={<PlayerDemo />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
