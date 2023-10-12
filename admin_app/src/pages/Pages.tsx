import { createRoutesFromChildren, Route } from "react-router-dom";
import ProtectedRoutes from "../components/auth/ProtectedRoutes";
import PublicRoutes from "../components/auth/PublicRoutes";
import Login from "./Login";
import AuthorPage from "./protected/catalog/author/AuthorPage";
import BookAddPage from "./protected/catalog/book-add/BookAddPage";
import Dashboard from "./protected/Dashboard";
import SectionPage from "./protected/catalog/SectionPage";
import PublisherPage from "./protected/catalog/PublisherPage";
import BookPage from "./protected/catalog/book-page/BookPage";
import BookEditPage from "./protected/catalog/book-edit/BookEditPage";
import AccessionPage from "./protected/catalog/AccessionPage";
import Page404 from "./error/Page404";
import AuditPage from "./protected/inventory/AuditPage";
import AuditScanPage from "./protected/inventory/AuditScanPage";
import AccountPage from "./protected/client/AccountPage";
import CheckoutPage from "./protected/circulation/checkout/CheckoutPage";
import BorrowRequestPage from "./protected/circulation/BorrowRequestPage";
import BorrowedBooksViewPage from "./protected/circulation/BorrowedBooksViewPage";
import AccessControlPage from "./protected/system/access-control/AccessControlPage";
import AssignRolePage from "./protected/system/AssignRole";
import PermissionGate from "@components/auth/PermissionGate";
import Page403 from "./error/Page403";
import AssignedRolePage from "./protected/system/AssignedRolePage";
import SettingsPage from "./protected/system/settings/SettingsPage";
import PenaltyPage from "./protected/circulation/penalty/PenaltyPage";
import ScannerAccountPage from "./protected/system/scanner-account/ScannerAccountPage";
import ClientLogPage from "./protected/system/client-log/ClientLogPage";

const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/books"
        element={
          <PermissionGate requiredPermissions={["Book.Access"]}>
            <BookPage />
          </PermissionGate>
        }
      ></Route>
      <Route
        path="/books/accessions"
        element={
          <PermissionGate requiredPermissions={["Book.Access"]}>
            <AccessionPage />
          </PermissionGate>
        }
      ></Route>
      <Route
        path="/books/new"
        element={
          <PermissionGate requiredPermissions={["Book.Access"]}>
            <BookAddPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/edit/:id"
        element={
          <PermissionGate requiredPermissions={["Book.Access"]}>
            <BookEditPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/authors"
        element={
          <PermissionGate requiredPermissions={["Author.Access"]}>
            <AuthorPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/sections"
        element={
          <PermissionGate requiredPermissions={["Section.Access"]}>
            <SectionPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/publishers"
        element={
          <PermissionGate requiredPermissions={["Publisher.Access"]}>
            <PublisherPage />
          </PermissionGate>
        }
      />
      <Route
        path="/inventory/audits"
        element={
          <PermissionGate requiredPermissions={["Audit.Access"]}>
            <AuditPage />
          </PermissionGate>
        }
      />
      <Route
        path="/inventory/audits/:id"
        element={
          <PermissionGate requiredPermissions={["Audit.Access"]}>
            <AuditScanPage />
          </PermissionGate>
        }
      />
      <Route
        path="/clients/accounts"
        element={
          <PermissionGate requiredPermissions={["Account.Access"]}>
            <AccountPage />
          </PermissionGate>
        }
      />

      <Route
        path="/borrowing/requests"
        element={
          <PermissionGate requiredPermissions={["Borrowing.Access"]}>
            <BorrowRequestPage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/access-control"
        element={
          <PermissionGate requiredPermissions={["ACL.Access"]}>
            <AccessControlPage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/access-control/assign"
        element={
          <PermissionGate requiredPermissions={["ACL.Access"]}>
            <AssignRolePage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/access-control/assignments"
        element={
          <PermissionGate requiredPermissions={["ACL.Access"]}>
            <AssignedRolePage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/settings"
        element={
          <PermissionGate requiredPermissions={["Settings.Access"]}>
            <SettingsPage />
          </PermissionGate>
        }
      />
      <Route
        path="/borrowing/requests/:id"
        element={
          <PermissionGate requiredPermissions={["Borrowing.Access"]}>
            <BorrowedBooksViewPage />
          </PermissionGate>
        }
      />
      <Route
        path="/borrowing/checkout"
        element={
          <PermissionGate requiredPermissions={["Borrowing.Access"]}>
            <CheckoutPage />
          </PermissionGate>
        }
      />
      <Route
        path="/borrowing/penalties"
        element={
          <PermissionGate requiredPermissions={["Penalty.Access"]}>
            <PenaltyPage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/scanner-accounts"
        element={
          <PermissionGate requiredPermissions={["ScannerAccount.Access"]}>
            <ScannerAccountPage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/client-logs"
        element={
          <PermissionGate requiredPermissions={["ClientLog.Access"]}>
            <ClientLogPage />
          </PermissionGate>
        }
      />
    </Route>

    <Route element={<PublicRoutes restricted={true} />}>
      <Route path="/" element={<Login />} />
    </Route>
    <Route path="/forbidden" element={<Page403 />}></Route>
    <Route path="*" element={<Page404 />}></Route>
  </>
);

export default pages;
