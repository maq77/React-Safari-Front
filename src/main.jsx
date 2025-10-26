import React from "react";
import ReactDOM from "react-dom/client";
import Toaster from "./components/Toaster";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/black-gold.css";
import "./index.css"; // (animations only)

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster /> {/* <= global notifications */}
  </BrowserRouter>
);
