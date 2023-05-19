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
import Catalog from "./protected/catalog/Catalog";
import CatalogBookView from "./protected/catalog/CatalogBookView";
import Page404 from "./error/Page404";
import BagPage from "./protected/bag/BagPage";
import ProfilePage from "./protected/profile/ProfilePage";


const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoutes />}>

        <Route path="/search" element={<Search />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<CatalogBookView />} />
        <Route path="/bag" element={<BagPage />} />

        <Route path="/search" element={<Search />}></Route>
        <Route path="/catalog" element={<Catalog />}></Route>
        <Route path="/catalog/:id" element={<CatalogBookView />}></Route>
        <Route path="/profile" element={<ProfilePage />}></Route>

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
