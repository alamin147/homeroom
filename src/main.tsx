import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./theme-palettes.css";
import { initializeTheme } from "./shared/services/theme";

initializeTheme();
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
