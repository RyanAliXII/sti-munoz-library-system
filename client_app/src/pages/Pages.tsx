import {
  Route,
  Router,
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
import BorrowedBooksPage from "./protected/borrowed_books/BorrowedBookPage";
import EbookView from "./protected/ebook/EbookView";
import ReservationPage from "./protected/reservation/ReservationPage";
import QueuePage from "./protected/queues/QueuePage";

const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoutes />}>
        <Route path="/search" element={<Search />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<CatalogBookView />} />
        <Route path="/bag" element={<BagPage />} />

        <Route path="/search" element={<Search />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<CatalogBookView />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/borrowed-books" element={<BorrowedBooksPage />} />
        <Route path="/ebooks/:id" element={<EbookView />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/queues" element={<QueuePage />} />
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
