import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/research/AdminProjects';
import ProjectForm from './pages/admin/research/ProjectForm';
import AdminPages from './pages/admin/content/AdminPages';
import PageBuilder from './pages/admin/content/PageBuilder';
import AdminReports from './pages/admin/AdminReports';

import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ComingSoon from './pages/ComingSoon';
import PeopleList from './pages/admin/PeopleList';
import PublicationsList from './pages/admin/PublicationsList';
import DocumentCenter from './pages/admin/DocumentCenter';
import ApprovalsList from './pages/admin/ApprovalsList';
import SystemSettings from './pages/admin/SystemSettings';
import ProfileSettings from './pages/ProfileSettings';
import OpportunitiesList from './pages/admin/OpportunitiesList';
import StudentApplications from './pages/student/StudentApplications';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        
        {/* Admin Portal Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="research" element={<AdminProjects />} />
          <Route path="research/new" element={<ProjectForm />} />
          <Route path="research/:id" element={<ProjectForm />} />
          
          <Route path="content" element={<AdminPages />} />
          <Route path="content/pages/new" element={<PageBuilder />} />
          <Route path="content/pages/:id" element={<PageBuilder />} />
          
          <Route path="reports" element={<AdminReports />} />
          
          <Route path="people" element={<PeopleList />} />
          <Route path="publications" element={<PublicationsList />} />
          <Route path="opportunities" element={<OpportunitiesList />} />
          <Route path="documents" element={<DocumentCenter />} />
          <Route path="approvals" element={<ApprovalsList />} />
          <Route path="system" element={<SystemSettings />} />
        </Route>
        
        {/* Professor Portal Routes */}
        <Route path="/professor" element={<DashboardLayout />}>
          <Route index element={<ProfessorDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectForm />} />
          <Route path="publications" element={<PublicationsList />} />
          <Route path="settings" element={<ProfileSettings />} />
        </Route>

        {/* Student Portal Routes */}
        <Route path="/student" element={<DashboardLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="opportunities" element={<OpportunitiesList />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
