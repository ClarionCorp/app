import "./core/styles/globals.css";
import ReactDOM from "react-dom/client";
import { QueueApp } from "./pages/WebServer/QueueApp";

ReactDOM.createRoot(document.getElementById("queue-root") as HTMLElement).render(
  <QueueApp />
);
