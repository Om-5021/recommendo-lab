
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import NotFound from './pages/NotFound';

function App() {
  return (
    <UserProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-path-explorer" element={<LearningPathExplorer />} />
          <Route path="/learning-path/:pathId" element={<LearningPathDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </UserProgressProvider>
  );
}

export default App;
