import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import AdminPage from "./components/AdminPage.jsx";
import { SnackbarProvider } from "./components/ui/SnackbarProvider.jsx";
import "./index.css";
import SiteMeta from "./components/public/SiteMeta";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/*",
    element: <App />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SiteMeta />
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>
  </StrictMode>
);
