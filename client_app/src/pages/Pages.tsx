import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ProtectedRoutes from "@components/auth/ProtectedRoutes";
import PublicRoutes from "@components/auth/PublicRoutes";
import Login from "./Login";
import Homepage from "./Homepage";
import Search from "./protected/Search";
import Catalog from "./protected/Catalog/Catalog";
import CatalogBookView from "./protected/Catalog/CatalogBookView";
import Page404 from "./error/Page404";

const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoutes />}>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/catalog" element={<Catalog />}></Route>
        <Route path="/catalog/:id" element={<CatalogBookView />}></Route>
      </Route>
      <Route element={<PublicRoutes restricted={true} />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/" element={<Homepage />} />
      <Route path="/404" element={<Page404 />} />
    </>
  )
);
export default pages;