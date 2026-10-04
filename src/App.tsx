import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/Toaster';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GridSkeleton, ListSkeleton } from './components/ui/Skeleton';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Catalog = lazy(() => import('./pages/Catalog'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notes = lazy(() => import('./pages/Notes'));
const PlayerDemo = lazy(() => import('./pages/PlayerDemo'));
const InstructorLayout = lazy(() => import('./pages/InstructorLayout'));
const InstructorCourses = lazy(() => import('./pages/instructor/Courses'));
const CreateCourse = lazy(() => import('./pages/instructor/CreateCourse'));
const CourseEditor = lazy(() => import('./pages/instructor/CourseEditor'));
const Analytics = lazy(() => import('./pages/instructor/Analytics'));
const Students = lazy(() => import('./pages/instructor/Students'));

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Toaster />
        <Suspense fallback={
          <div className="min-h-screen p-8">
            <GridSkeleton count={6} />
          </div>
        }>
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
        </Suspense>
        <MobileBottomNav />
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
