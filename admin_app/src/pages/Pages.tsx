import { createRoutesFromChildren, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "@components/Loader";
import ProtectedRoutes from "@components/auth/ProtectedRoutes";
import PublicRoutes from "@components/auth/PublicRoutes";
import UserProgramPage from "./protected/users/UserProgramPage";
import DeviceLogPage from "./protected/services/devices/device-log/DeviceLogPage";
import NotificationPage from "./protected/notifications/NotificationPage";

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
const GameLoggingPage = lazy(
  () => import("./protected/services/games/game-log/GameLoggingPage")
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
const ReportPage = lazy(() => import("./protected/report/ReportPage"));
const UserTypePage = lazy(() => import("./protected/users/UserTypePage"));

const BulkActivatePage = lazy(
  () => import("./protected/client/BulkActivatePage")
);
const FaqsPage = lazy(() => import("./protected/faqs/FAQsPage"));
const PolicyPage = lazy(() => import("./protected/policy/PolicyPage"));
const PenaltyClassPage = lazy(
  () =>
    import("./protected/circulation/penalty/classification/PenaltyClassPage")
);
const MigrationToolPage = lazy(
  () => import("./protected/catalog/section/tools/MigrationToolPage")
);
const BulkAccessionEditorPage = lazy(
  () => import("./protected/catalog/section/tools/BulkAccessionEditorPage")
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
        path="/resources"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Book.Read"]}>
              <BookPage />
            </PermissionGate>
          </Suspense>
        }
      ></Route>
      <Route
        path="/resources/accessions"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Book.Read"]}>
              <AccessionPage />
            </PermissionGate>
          </Suspense>
        }
      ></Route>
      <Route
        path="/resources/new"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Book.Add"]}>
              <BookAddPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/edit/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Book.Edit"]}>
              <BookEditPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/authors"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Author.Read"]}>
              <AuthorPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/collections"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Collection.Read"]}>
              <SectionPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/collections/migration-tool"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Collection.Edit"]}>
              <MigrationToolPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/collections/bulk-editor"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Collection.Edit"]}>
              <BulkAccessionEditorPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/resources/publishers"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Publisher.Read"]}>
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
            <PermissionGate requiredPermissions={["Account.Read"]}>
              <AccountPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/borrowing/requests"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["BorrowedBook.Read"]}>
              <BorrowRequestPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Role.Read"]}>
              <AccessControlPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control/assign"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Role.Assign"]}>
              <AssignRolePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/access-control/assignments"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Role.Read"]}>
              <AssignedRolePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/settings"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Setting.Read"]}>
              <SettingsPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/requests/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["BorrowedBook.Read"]}>
              <BorrowedBooksViewPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/checkout"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["BorrowedBook.Add"]}>
              <CheckoutPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/borrowing/queues"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Queue.Read"]}>
              <QueuePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/borrowing/queues/:bookId"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Queue.Read"]}>
              <QueueItemsPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/penalties"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Penalty.Read"]}>
              <PenaltyPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/scanner-accounts"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["ScannerAccount.Read"]}>
              <ScannerAccountPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/system/client-logs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["PatronLog.Read"]}>
              <ClientLogPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/services/games"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Game.Read"]}>
              <GamePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/games/logs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["GameLog.Read"]}>
              <GameLoggingPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/devices"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Device.Read"]}>
              <DevicePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/time-slot-profiles"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["TimeSlot.Read"]}>
              <TimeSlotProfilePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/time-slot-profiles/:id"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["TimeSlot.Read"]}>
              <TimeSlotPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/date-slots"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["DateSlot.Read"]}>
              <DateSlotPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/reservations"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Reservation.Read"]}>
              <ReservationPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/services/devices/logs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <DeviceLogPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/reports"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Report.Read"]}>
              <ReportPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/users/types"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <UserTypePage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/users/program-strand"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <UserProgramPage />
            </PermissionGate>
          </Suspense>
        }
      />
      <Route
        path="/clients/accounts/bulk-activate"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate requiredPermissions={["Account.Edit"]}>
              <BulkActivatePage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/notifications"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <NotificationPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/faqs"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <FaqsPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/policy"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <PolicyPage />
            </PermissionGate>
          </Suspense>
        }
      />

      <Route
        path="/penalties/classifications"
        element={
          <Suspense fallback={<Loader />}>
            <PermissionGate>
              <PenaltyClassPage />
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
