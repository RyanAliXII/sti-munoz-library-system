import {
  Route,
  Router,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ProtectedRoutes from "@components/auth/ProtectedRoutes";
import PublicRoutes from "@components/auth/PublicRoutes";
import { Suspense, lazy } from "react";
import Loader from "@components/Loader";
import NotificationPage from "./protected/notifications/NotificationPage";
const Login = lazy(() => import("./Login"));
const Homepage = lazy(() => import("./Homepage"));
const Search = lazy(() => import("./protected/Search"));
const Catalog = lazy(() => import("./protected/catalog/Catalog"));
const CatalogBookView = lazy(
  () => import("./protected/catalog/CatalogBookView")
);
const Page404 = lazy(() => import("./error/Page404"));
const BagPage = lazy(() => import("./protected/bag/BagPage"));
const ProfilePage = lazy(() => import("./protected/profile/ProfilePage"));
const BorrowedBooksPage = lazy(
  () => import("./protected/borrowed_books/BorrowedBookPage")
);
const EbookView = lazy(() => import("./protected/ebook/EbookView"));
const ReservationPage = lazy(
  () => import("./protected/reservation/ReservationPage")
);
const QueuePage = lazy(() => import("./protected/queues/QueuePage"));
const FAQsPage = lazy(() => import("./protected/faqs/FAQsPage"));
const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoutes />}>
        <Route
          path="/search"
          element={
            <Suspense fallback={<Loader />}>
              <Search />
            </Suspense>
          }
        />
        <Route
          path="/catalog"
          element={
            <Suspense fallback={<Loader />}>
              <Catalog />
            </Suspense>
          }
        />
        <Route
          path="/catalog/:id"
          element={
            <Suspense fallback={<Loader />}>
              <CatalogBookView />
            </Suspense>
          }
        />
        <Route
          path="/bag"
          element={
            <Suspense fallback={<Loader />}>
              <BagPage />{" "}
            </Suspense>
          }
        />

        <Route
          path="/catalog/:id"
          element={
            <Suspense fallback={<Loader />}>
              <CatalogBookView />{" "}
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<Loader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/borrowed-books"
          element={
            <Suspense fallback={<Loader />}>
              <BorrowedBooksPage />
            </Suspense>
          }
        />
        <Route
          path="/ebooks/:id"
          element={
            <Suspense fallback={<Loader />}>
              <EbookView />{" "}
            </Suspense>
          }
        />
        <Route
          path="/reservations"
          element={
            <Suspense fallback={<Loader />}>
              <ReservationPage />
            </Suspense>
          }
        />
        <Route
          path="/queues"
          element={
            <Suspense fallback={<Loader />}>
              <QueuePage />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<Loader />}>
              <NotificationPage />
            </Suspense>
          }
        />
        <Route
          path="/faqs"
          element={
            <Suspense fallback={<Loader />}>
              <FAQsPage />
            </Suspense>
          }
        />
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
