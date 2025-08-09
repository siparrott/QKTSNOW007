import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme.css";

createRoot(document.getElementById("root")!).render(
  <div className="theme-modern">
    <App />
  </div>
);
