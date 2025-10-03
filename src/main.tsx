import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import EventsList from "./pages/events/EventsList";
import EventsManagement from "./pages/events/EventsManagement";
import ArtistsManagement from "./pages/artists/ArtistsManagement";
import HomePage from "./pages/HomePage";
import './index.css' 

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <App />, 
    children: [
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventsList /> },
      { path: "events/manage", element: <EventsManagement /> },
      { path: "artists/manage", element: <ArtistsManagement /> },
    ] 
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);