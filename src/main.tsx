import './core/logger'; // Initialize console interceptors before anything else

// document.addEventListener('contextmenu', e => e.preventDefault());
import "./core/styles/globals.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { MatchPage } from "./pages/Match";
import { ThemeProvider } from './components/Theme/ThemeProvider';
import { ToastProvider } from './components/UI/Toast';
import { themeScript } from './core/styles/theme';
import InitializationPage from './pages/Initialization';
import HomePage from './pages/Home';
import ErrorBoundary from './components/ErrorBoundry';

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, path: '/',   element: <InitializationPage /> },
      { path: "home",             element: <HomePage /> },
      { path: "match",            element: <MatchPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
    <ThemeProvider >
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
