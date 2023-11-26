import { createRoutesFromChildren, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "@components/Loader";
import ProtectedRoutes from "@components/auth/ProtectedRoutes";
import PublicRoutes from "@components/auth/PublicRoutes";

const LoginPage = lazy(() => import("./Login"));
const AuthorPage = lazy(() => import("./protected/catalog/author/AuthorPage"));
const BookAddPage = lazy(
  () => import("./protected/catalog/book-add/BookAddPage")
);
const Dashboard = lazy(() => import("./protected/Dashboard"));
const SectionPage = lazy(
  () => import("./protected/catalog/section/SectionPage")
);
const PublisherPage = lazy(
  () => import("./protected/catalog/publisher/PublisherPage")
);
const BookPage = lazy(() => import("./protected/catalog/book-page/BookPage"));
const BookEditPage = lazy(
  () => import("./protected/catalog/book-edit/BookEditPage")
);
const AccessionPage = lazy(() => import("./protected/catalog/AccessionPage"));
const Page404 = lazy(() => import("./error/Page404"));
const AuditPage = lazy(() => import("./protected/inventory/AuditPage"));
const AuditScanPage = lazy(() => import("./protected/inventory/AuditScanPage"));
const AccountPage = lazy(() => import("./protected/client/AccountPage"));
const CheckoutPage = lazy(
  () => import("./protected/circulation/checkout/CheckoutPage")
);
const BorrowRequestPage = lazy(
  () => import("./protected/circulation/BorrowRequestPage")
);
const BorrowedBooksViewPage = lazy(
  () => import("./protected/circulation/BorrowedBooksViewPage")
);
const AccessControlPage = lazy(
  () => import("./protected/system/access-control/AccessControlPage")
);
const AssignRolePage = lazy(() => import("./protected/system/AssignRole"));
const PermissionGate = lazy(() => import("@components/auth/PermissionGate"));
const Page403 = lazy(() => import("./error/Page403"));
const AssignedRolePage = lazy(
  () => import("./protected/system/AssignedRolePage")
);
const SettingsPage = lazy(
  () => import("./protected/system/settings/SettingsPage")
);
const PenaltyPage = lazy(
  () => import("./protected/circulation/penalty/PenaltyPage")
);
const ScannerAccountPage = lazy(
  () => import("./protected/system/scanner-account/ScannerAccountPage")
);
const ClientLogPage = lazy(
  () => import("./protected/system/client-log/ClientLogPage")
);
const QueuePage = lazy(() => import("./protected/borrowing-queue/QueuePage"));
const QueueItemsPage = lazy(
  () => import("./protected/borrowing-queue/ActiveQueueItems")
);
const GamePage = lazy(() => import("./protected/services/games/GamesPage"));
const GameLogPage = lazy(
  () => import("./protected/services/games/logs/GameLogPage")
);
const DevicePage = lazy(
  () => import("./protected/services/devices/DevicePage")
);
const TimeSlotProfilePage = lazy(
  () => import("./protected/services/time-slot/TimeSlotProfilePage")
);
const TimeSlotPage = lazy(
  () => import("./protected/services/time-slot/id/TimeSlotPage")
);
const DateSlotPage = lazy(
  () => import("./protected/services/date-slot/DateSlotPage")
);
const ReservationPage = lazy(
  () => import("./protected/services/reservations/ReservationPage")
);
const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/books"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={["Book.Access", "Section.Access"]}
            >
              <BookPage />
            </PermissionGate>
          </Suspense>
        }
      ></Route>
      <Route
        path="/books/accessions"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Book.Access"]}>
              <AccessionPage />
            </PermissionGate>
          </Suspense>
        }
      ></Route>
      <Route
        path="/books/new"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={[
                "Book.Access",
                "Publisher.Access",
                "Section.Access",
                "Author.Access",
              ]}
            >
              <BookAddPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/books/edit/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={[
                "Book.Access",
                "Publisher.Access",
                "Section.Access",
                "Author.Access",
              ]}
            >
              <BookEditPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/books/authors"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Author.Access"]}>
              <AuthorPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/books/sections"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Section.Access"]}>
              <SectionPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/books/publishers"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Publisher.Access"]}>
              <PublisherPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/inventory/audits"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Audit.Access"]}>
              <AuditPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/inventory/audits/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Audit.Access"]}>
              <AuditScanPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/clients/accounts"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Account.Access"]}>
              <AccountPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/borrowing/requests"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Borrowing.Access"]}>
              <BorrowRequestPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["ACL.Access"]}>
              <AccessControlPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control/assign"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={["ACL.Access", "Account.Access"]}
            >
              <AssignRolePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control/assignments"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["ACL.Access"]}>
              <AssignedRolePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/settings"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Settings.Access"]}>
              <SettingsPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/requests/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Borrowing.Access"]}>
              <BorrowedBooksViewPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/checkout"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={[
                "Borrowing.Access",
                "Book.Access",
                "Account.Access",
              ]}
            >
              <CheckoutPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/borrowing/queues"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={[
                "Borrowing.Access",
                "Book.Access",
                "Account.Access",
              ]}
            >
              <QueuePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/queues/:bookId"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={[
                "Borrowing.Access",
                "Book.Access",
                "Account.Access",
              ]}
            >
              <QueueItemsPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/penalties"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate
              requiredPermissions={["Penalty.Access", "Account.Access"]}
            >
              <PenaltyPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/scanner-accounts"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["ScannerAccount.Access"]}>
              <ScannerAccountPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/client-logs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["ClientLog.Access"]}>
              <ClientLogPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/services/games"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <GamePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/games/logs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <GameLogPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/devices"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <DevicePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/time-slot-profiles"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <TimeSlotProfilePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/time-slot-profiles/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <TimeSlotPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/date-slots"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <DateSlotPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/reservations"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <ReservationPage />
            </PermissionGate>
          </Suspense>
        }
      />
    </Route>

    <Route element={<PublicRoutes restricted={true} />}>
      <Route
        path="/"
        element={
          <Suspense fallback={<Loader />}>
            <LoginPage />
          </Suspense>
        }
      />
    </Route>
    <Route
      path="/forbidden"
      element={
        <Suspense fallback={<Loader />}>
          <Page403 />
        </Suspense>
      }
    ></Route>
    <Route
      path="*"
      element={
        <Suspense fallback={<Loader />}>
          <Page404 />
        </Suspense>
      }
    ></Route>
  </>
);

export default pages;
