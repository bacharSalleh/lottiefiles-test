import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(
      import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
      { type: import.meta.env.MODE === "production" ? "classic" : "module" }
    );
  }
});
