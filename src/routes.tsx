import { RouteObject } from 'react-router';
import { lazy } from 'react';
import HomePage from './pages/index';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import ForgotPasswordPage from './pages/forgot-password';
import ProfilePage from './pages/profile';
import StudyPlannerPage from './pages/study-planner';
import LogsPage from './pages/logs';
import TOSTrackerPage from './pages/tos-tracker';
import LearningMaterialsPage from './pages/learning-materials';
import LeaderboardPage from './pages/leaderboard';
import AchievementsPage from './pages/achievements';
import ProtectedRoute from './components/ProtectedRoute';
import ProdNotFoundPage from './pages/_404';
import AdminAllowedEmailsPage from './pages/admin/allowed-emails';
import AdminPage from './pages/admin/index';
import JoinPage from './pages/join';

const NotFoundPage = ProdNotFoundPage;

export const routes: RouteObject[] = [
  { path: '/join', element: <JoinPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/', element: <ProtectedRoute><HomePage /></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/study-planner', element: <ProtectedRoute><StudyPlannerPage /></ProtectedRoute> },
  { path: '/logs', element: <ProtectedRoute><LogsPage /></ProtectedRoute> },
  { path: '/tos-tracker', element: <ProtectedRoute><TOSTrackerPage /></ProtectedRoute> },
  { path: '/learning-materials', element: <ProtectedRoute><LearningMaterialsPage /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute> },
  { path: '/achievements', element: <ProtectedRoute><AchievementsPage /></ProtectedRoute> },
  { path: '/admin', element: <ProtectedRoute><AdminPage /></ProtectedRoute> },
  { path: '/admin/allowed-emails', element: <AdminAllowedEmailsPage /> },
  { id: 'airo-not-found', path: '*', element: <NotFoundPage /> },
];

export type Path = '/' | '/join' | '/login' | '/signup' | '/forgot-password' | '/profile' | '/study-planner' | '/logs' | '/tos-tracker' | '/learning-materials' | '/leaderboard' | '/achievements' | '/admin' | '/admin/allowed-emails';
export type Params = Record<string, string | undefined>;
