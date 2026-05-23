import './core/logger'; // Initialize console interceptors before anything else

// document.addEventListener('contextmenu', e => e.preventDefault());
import "./core/styles/globals.css";
import App from "./App";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ToastProvider } from './components/UI/Toast';
import InitPage from './pages/Init';
import HomePage from './pages/Home';
import ErrorBoundary from './components/Navigation/ErrorBoundry';
import ComingSoonPage from './pages/ComingSoon';
import DebugPage from './pages/DebugPage';
import { ThemeProvider } from './components/UI/Theme/ThemeProvider';
import CurrentMatchPage from './pages/CurrentMatch';
import MatchHistoryPage from './pages/MatchHistory';

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true,              element: <InitPage /> },
      { path: "home",             element: <HomePage /> },
      { path: "match",            element: <CurrentMatchPage /> },
      { path: "cqm",              element: <ComingSoonPage /> },
      { path: "cgm",              element: <ComingSoonPage /> },
      { path: "mods",             element: <ComingSoonPage /> },
      { path: "settings",         element: <ComingSoonPage /> },
      { path: "history",          element: <MatchHistoryPage /> },
      { path: "debug",            element: <DebugPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider >
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </ThemeProvider>
);