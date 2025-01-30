import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import Auth from './pages/Auth.tsx';
import Index from './pages/Index.tsx';
import Help from './pages/Help.tsx';
import NotFound from './pages/NotFound.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/index" replace />,
      },
      {
        path: "index",
        element: <Index />,
      },
      {
        path: "help",
        element: <Help />,
      },
      {
        path: "*",
        element: <NotFound />,
      }
    ]
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);