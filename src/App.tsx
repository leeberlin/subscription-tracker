import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import Subscriptions from './components/pages/Subscriptions';
import Statistics from './components/pages/Statistics';
import Settings from './components/pages/Settings';
import { ToastProvider } from './components/ToastContainer';
import { I18nProvider } from './i18n';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'statistics',
        element: <Statistics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </I18nProvider>
  );
}

export default App;
