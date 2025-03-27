import ProtectedRoutes from "@components/auth/ProtectedRoutes";
import PublicRoutes from "@components/auth/PublicRoutes";
import Loader from "@components/Loader";
import { Suspense, lazy } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const Login = lazy(() => import("./Login"));
const Homepage = lazy(() => import("./Homepage"));
const Search = lazy(() => import("./protected/Search"));
const Catalog = lazy(() => import("./protected/catalog/Catalog"));
const CatalogBookView = lazy(() => import("./protected/catalog/CatalogBookView"));
const Page404 = lazy(() => import("./error/Page404"));
const BagPage = lazy(() => import("./protected/bag/BagPage"));
const ProfilePage = lazy(() => import("./protected/profile/ProfilePage"));
const BorrowedBooksPage = lazy(() => import("./protected/borrowed_books/BorrowedBookPage"));
const EbookView = lazy(() => import("./protected/ebook/EbookView"));
const ReservationPage = lazy(() => import("./protected/reservation/ReservationPage"));
const QueuePage = lazy(() => import("./protected/queues/QueuePage"));
const FAQsPage = lazy(() => import("./protected/faqs/FAQsPage"));
const PenaltyPage = lazy(() => import("./protected/penalty/PenaltyPage"));
const NotificationPage = lazy(() => import("./protected/notifications/NotificationPage"));
const PolicyPage = lazy(() => import("./protected/policy/PolicyPage"));

const pages = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/search" element={<Suspense fallback={<Loader />}><Search /></Suspense>} />
        <Route path="/catalog" element={<Suspense fallback={<Loader />}><Catalog /></Suspense>} />
        <Route path="/catalog/:id" element={<Suspense fallback={<Loader />}><CatalogBookView /></Suspense>} />
        <Route path="/bag" element={<Suspense fallback={<Loader />}><BagPage /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<Loader />}><ProfilePage /></Suspense>} />
        <Route path="/borrowed-books" element={<Suspense fallback={<Loader />}><BorrowedBooksPage /></Suspense>} />
        <Route path="/ebooks/:id" element={<Suspense fallback={<Loader />}><EbookView /></Suspense>} />
        <Route path="/reservations" element={<Suspense fallback={<Loader />}><ReservationPage /></Suspense>} />
        <Route path="/queues" element={<Suspense fallback={<Loader />}><QueuePage /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<Loader />}><NotificationPage /></Suspense>} />
        <Route path="/faqs" element={<Suspense fallback={<Loader />}><FAQsPage /></Suspense>} />
        <Route path="/policy" element={<Suspense fallback={<Loader />}><PolicyPage /></Suspense>} />
        <Route path="/penalties" element={<Suspense fallback={<Loader />}><PenaltyPage /></Suspense>} />
      </Route>

      {/* Public Routes */}
      <Route element={<PublicRoutes restricted={true} />}>
        <Route path="/login" element={<Suspense fallback={<Loader />}><Login /></Suspense>} />
      </Route>

      {/* General Routes */}
      <Route path="/" element={<Suspense fallback={<Loader />}><Homepage /></Suspense>} />
      <Route path="/404" element={<Suspense fallback={<Loader />}><Page404 /></Suspense>} />
    </>
  )
);

export default pages;