import { createRoutesFromChildren, Route } from "react-router-dom";
import ProtectedRoutes from "../components/auth/ProtectedRoutes";
import PublicRoutes from "../components/auth/PublicRoutes";
import Login from "./Login";
import Accession from "./protected/catalog/Accession";
import AuthorPage from "./protected/catalog/AuthorPage";
import BookAddPage from "./protected/catalog/book-add/BookAddPage";
import Dashboard from "./protected/Dashboard";
import SectionPage from "./protected/catalog/SectionPage";
import PublisherPage from "./protected/catalog/PublisherPage";
import SofPage from "./protected/catalog/SofPage";
import BookPage from "./protected/catalog/BookPage";
const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/books" element={<BookPage />}></Route>
      <Route path="/books/create" element={<BookAddPage />} />
      <Route path="/books/accession" element={<Accession />} />
      <Route path="/books/authors" element={<AuthorPage />} />
      <Route path="/books/sections" element={<SectionPage />} />
      <Route path="/books/publishers" element={<PublisherPage />} />
      <Route path="/books/source-of-funds" element={<SofPage />} />
    </Route>
    <Route element={<PublicRoutes restricted={true} />}>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </>
);

export default pages;
