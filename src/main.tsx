import './core/logger'; // Initialize console interceptors before anything else

// document.addEventListener('contextmenu', e => e.preventDefault());
import "./core/styles/globals.css";
import App from "./App";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ThemeProvider } from './components/Theme/ThemeProvider';
import { ToastProvider } from './components/UI/Toast';
import InitializationPage from './pages/Initialization';
import HomePage from './pages/Home';
import ErrorBoundary from './components/Navigation/ErrorBoundry';
import RankCheckerPage from './pages/RankChecker';
import ComingSoonPage from './pages/ComingSoon';
import DebugPage from './pages/Debugger';
import SetupPage from './pages/AppSetup';
import InstalledMods from './pages/InstalledMods';
import ModDirectory from './pages/ModDirectory';

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, path: '/',   element: <InitializationPage /> },
      { path: "home",             element: <HomePage /> },
      { path: "rankchecker",      element: <RankCheckerPage /> },
      { path: "account",          element: <ComingSoonPage /> },
      { path: "settings",         element: <ComingSoonPage /> },
      { path: "cgm",              element: <ComingSoonPage /> },
      { path: "cqm",              element: <ComingSoonPage /> },
      { path: "mods",             element: <InstalledMods /> },
      { path: "mods/add",         element: <ModDirectory /> },
      { path: "debug",            element: <DebugPage /> },
      { path: "setup",            element: <SetupPage /> },
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