
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Import pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LearningPaths from './pages/LearningPaths';
import LearningPathExplorer from './pages/LearningPathExplorer';
import LearningPathDetails from './pages/LearningPathDetails';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <UserProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-paths"
            element={
              <ProtectedRoute>
                <LearningPaths />
              </ProtectedRoute>
            }
          />
          <Route path="/learning-path-explorer" element={<LearningPathExplorer />} />
          <Route
            path="/learning-path/:pathId"
            element={
              <ProtectedRoute>
                <LearningPathDetails />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </UserProgressProvider>
  );
}

export default App;
