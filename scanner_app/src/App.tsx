import "./assets/css/tailwind.css";
import Login from "./pages/Login";
import {useEffect} from "react"
import {
  createBrowserRouter,
  createRoutesFromChildren,
  Route,
  RouterProvider,
} from "react-router-dom";
import Scanner from "./pages/Scanner";
import Inquire from "./pages/Inquire";
import AuthProvider from "./contexts/AuthContext";
import PrivateRoute from "./pages/ProtectedRoute";

const pages = createRoutesFromChildren(
  <>
    <Route path="/" element={<Login />} />

    <Route
      path="/scanner"
      element={
        <PrivateRoute>
          <Scanner />
        </PrivateRoute>
      }
    />

    <Route path="/library-pass" element={<Inquire />} />
  </>
);
const router = createBrowserRouter(pages);
const App = () => {
  useEffect(()=>{
    document.title = "STI Munoz Library | Scanner"
  },[])
  return (
    <AuthProvider>
      <RouterProvider router={router} />;
    </AuthProvider>
  );
};

export default App;
