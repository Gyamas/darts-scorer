import "./storage.js"; // window.storageアダプタを最初に適用
import { createRoot } from "react-dom/client";
import DartsScorer from "./App.jsx";

createRoot(document.getElementById("root")).render(<DartsScorer />);
