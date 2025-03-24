
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from './contexts/UserContext';
import { SessionProvider } from './contexts/SessionContext';
import { UserProgressProvider } from './contexts/UserProgressContext';

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LearningPaths from './pages/LearningPaths';
import LearningPathDetails from './pages/LearningPathDetails';
import LearningPathExplorer from './pages/LearningPathExplorer';
import CourseImport from './pages/CourseImport';

// Global styles
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SessionProvider>
        <UserProvider>
          <UserProgressProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseDetails />} />
                <Route path="/learning-paths" element={<LearningPaths />} />
                <Route path="/learning-path/:pathId" element={<LearningPathExplorer />} />
                <Route path="/learning-path-details/:pathId" element={<LearningPathDetails />} />
                <Route path="/course-import" element={<CourseImport />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </UserProgressProvider>
        </UserProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
