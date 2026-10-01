import "./core/styles/globals.css";
import ReactDOM from "react-dom/client";
import { OverlayApp } from "./pages/WebServer/OverlayApp";

ReactDOM.createRoot(document.getElementById("overlay-root") as HTMLElement).render(
  <OverlayApp />
);
