import { createRoutesFromChildren, Route } from "react-router-dom";
import ProtectedRoutes from "../components/auth/ProtectedRoutes";
import PublicRoutes from "../components/auth/PublicRoutes";
import Login from "./Login";
import AuthorPage from "./protected/catalog/author/AuthorPage";
import BookAddPage from "./protected/catalog/book-add/BookAddPage";
import Dashboard from "./protected/Dashboard";
import SectionPage from "./protected/catalog/SectionPage";
import PublisherPage from "./protected/catalog/PublisherPage";
import FundSourcePage from "./protected/catalog/FundSourcePage";
import BookPage from "./protected/catalog/BookPage";
import BookEditPage from "./protected/catalog/book-edit/BookEditPage";
import AccessionPage from "./protected/catalog/AccessionPage";
import Page404 from "./error/Page404";
import AuditPage from "./protected/inventory/AuditPage";
import AuditScanPage from "./protected/inventory/AuditScanPage";
import AccountPage from "./protected/client/AccountPage";
import CheckoutPage from "./protected/circulation/checkout/CheckoutPage";
import ReturnPage from "./protected/circulation/ReturnPage";
import ReturnDetailPage from "./protected/circulation/ReturnDetailPage";
import AccessControlPage from "./protected/system/access-control/AccessControlPage";
import AssignRolePage from "./protected/system/AssignRole";
import PermissionGate from "@components/auth/PermissionGate";
import Page403 from "./error/Page403";
import AssignedRolePage from "./protected/system/AssignedRolePage";
import OnlineBorrowedBookPage from "./protected/circulation/OnlineBorrowedBookPage";
import OnlineBorrowBookViewPage from "./protected/circulation/OnlineBorrowedBookViewPage";
import SettingsPage from "./protected/system/settings/SettingsPage";
import PenaltyPage from "./protected/circulation/penalty/PenaltyPage";
const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/books"
        element={
          <PermissionGate requiredPermissions={["Book.Read"]}>
            <BookPage />
          </PermissionGate>
        }
      ></Route>
      <Route
        path="/books/accessions"
        element={
          <PermissionGate requiredPermissions={["Accession.Read"]}>
            <AccessionPage />
          </PermissionGate>
        }
      ></Route>
      <Route
        path="/books/new"
        element={
          <PermissionGate requiredPermissions={["Book.Add"]}>
            <BookAddPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/edit/:id"
        element={
          <PermissionGate requiredPermissions={["Book.Edit"]}>
            <BookEditPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/authors"
        element={
          <PermissionGate requiredPermissions={["Author.Read"]}>
            <AuthorPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/sections"
        element={
          <PermissionGate>
            <SectionPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/publishers"
        element={
          <PermissionGate requiredPermissions={["Publisher.Read"]}>
            <PublisherPage />
          </PermissionGate>
        }
      />
      <Route
        path="/books/source-of-funds"
        element={
          <PermissionGate requiredPermissions={["SOF.Read"]}>
            <FundSourcePage />
          </PermissionGate>
        }
      />
      <Route
        path="/inventory/audits"
        element={
          <PermissionGate>
            <AuditPage />
          </PermissionGate>
        }
      />
      <Route
        path="/inventory/audits/:id"
        element={
          <PermissionGate>
            <AuditScanPage />
          </PermissionGate>
        }
      />
      <Route
        path="/clients/accounts"
        element={
          <PermissionGate requiredPermissions={["Account.Read"]}>
            <AccountPage />
          </PermissionGate>
        }
      />
      <Route path="/circulation/checkout" element={<CheckoutPage />} />
      <Route path="/circulation/transactions" element={<ReturnPage />} />
      <Route
        path="/system/access-control"
        element={
          <PermissionGate requiredPermissions={["AccessControl.Role.Read"]}>
            <AccessControlPage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/access-control/assign"
        element={
          <PermissionGate requiredPermissions={["AccessControl.Role.Assign"]}>
            <AssignRolePage />
          </PermissionGate>
        }
      />
      <Route
        path="/system/access-control/assignments"
        element={
          <PermissionGate requiredPermissions={["AccessControl.Role.Read"]}>
            <AssignedRolePage />
          </PermissionGate>
        }
      />
      <Route path="/system/settings" element={<SettingsPage />} />
      <Route
        path="/circulation/transactions/:id"
        element={
          <PermissionGate>
            <ReturnDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/circulation/checkout"
        element={
          <PermissionGate>
            <CheckoutPage />
          </PermissionGate>
        }
      />
      <Route
        path="/circulation/online-borrowed-books"
        element={<OnlineBorrowedBookPage />}
      />
      <Route
        path="/circulation/online-borrowed-books/:id"
        element={<OnlineBorrowBookViewPage />}
      />
      <Route path="/circulation/penalties" element={<PenaltyPage />} />
    </Route>

    <Route element={<PublicRoutes restricted={true} />}>
      <Route path="/" element={<Login />} />
    </Route>
    <Route path="/forbidden" element={<Page403 />}></Route>
    <Route path="*" element={<Page404 />}></Route>
  </>
);

export default pages;
