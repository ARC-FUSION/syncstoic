import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import PlayerDemo from './pages/PlayerDemo';
import InstructorLayout from './pages/InstructorLayout';
import InstructorCourses from './pages/instructor/Courses';
import CreateCourse from './pages/instructor/CreateCourse';
import CourseEditor from './pages/instructor/CourseEditor';
import Analytics from './pages/instructor/Analytics';
import Students from './pages/instructor/Students';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/player" element={<PlayerDemo />} />
        
        {/* Public Routes with Navigation */}
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
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigation />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navigation />
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navigation />
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Navigation />
              <Notes />
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorCourses />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id" element={<CourseEditor />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="students" element={<Students />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
