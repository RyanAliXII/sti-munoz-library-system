import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ProtectedRoutes from "../components/ProtectedRoutes";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import PublicRoutes from "../components/PublicRoutes";
import Login from "./Login";
import Homepage from "./Homepage";

const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Homepage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<PublicRoutes restricted={true} />}>
        <Route path="/login" element={<Login />} />
      </Route>
    </>
  )
);
export default pages;
