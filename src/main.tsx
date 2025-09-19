import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import EventsList from "./pages/events/EventsList";

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [
      { index: true, element: <EventsList /> },
      { path: "events", element: <EventsList /> },
  ] }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
