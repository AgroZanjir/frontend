import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
// The brand layer first: both design systems below read its tokens.
import "./styles/brand.css";
import "./styles/panels.css";
import "./styles/site.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);
