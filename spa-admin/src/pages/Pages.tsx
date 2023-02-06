import { createRoutesFromChildren, Route } from "react-router-dom";
import ProtectedRoutes from "../components/auth/ProtectedRoutes";
import PublicRoutes from "../components/auth/PublicRoutes";
import Login from "./Login";
import Accession from "./protected/catalog/AccessionPage";
import AuthorPage from "./protected/catalog/AuthorPage";
import BookAddPage from "./protected/catalog/book-add/BookAddPage";
import Dashboard from "./protected/Dashboard";
import SectionPage from "./protected/catalog/SectionPage";
import PublisherPage from "./protected/catalog/PublisherPage";
import SofPage from "./protected/catalog/SofPage";
import BookPage from "./protected/catalog/BookPage";
import BookEditPage from "./protected/catalog/book-edit/BookEditPage";
import AccessionPage from "./protected/catalog/AccessionPage";
import Page404 from "./error/Page404";
import AuditPage from "./protected/inventory/AuditPage";
import AuditScanPage from "./protected/inventory/AuditScanPage";
import AccountPage from "./protected/client/AccountPage";
import BorrowingTransactionPage from "./protected/circulation/BorrowingTransactionPage";
import TransactionByIdPage from "./protected/circulation/TransactionByIdPage";
import CheckoutPage from "./protected/circulation/CheckoutPage";
const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/books" element={<BookPage />}></Route>
      <Route path="/books/accessions" element={<AccessionPage />}></Route>
      <Route path="/books/new" element={<BookAddPage />} />
      <Route path="/books/edit/:id" element={<BookEditPage />} />
      <Route path="/books/accession" element={<Accession />} />
      <Route path="/books/authors" element={<AuthorPage />} />
      <Route path="/books/sections" element={<SectionPage />} />
      <Route path="/books/publishers" element={<PublisherPage />} />
      <Route path="/books/source-of-funds" element={<SofPage />} />
      <Route path="/inventory/audits" element={<AuditPage />} />
      <Route path="/inventory/audits/:id" element={<AuditScanPage />} />
      <Route path="/clients/accounts" element={<AccountPage />} />\
      <Route path="/circulation/checkout" element={<CheckoutPage />} />
      <Route
        path="/circulation/transactions"
        element={<BorrowingTransactionPage />}
      />
      <Route
        path="/circulation/transactions/:id"
        element={<TransactionByIdPage />}
      ></Route>
      <Route path="/circulation/checkout" element={<CheckoutPage />} />
    </Route>
    <Route element={<PublicRoutes restricted={true} />}>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
    <Route path="*" element={<Page404 />}></Route>?
  </>
);

export default pages;
