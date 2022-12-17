import React from 'react';
import { createRoutesFromChildren, Route } from 'react-router-dom';
import ProtectedRoutes from '../components/auth/ProtectedRoutes';
import PublicRoutes from '../components/auth/PublicRoutes';
import Login from './Login';
import Accession from './protected/books/Accession';
import AuthorAdd from './protected/books/AuthorAdd';
import BookAdd from './protected/books/BookAdd';
import Dashboard from './protected/Dashboard';


const pages = createRoutesFromChildren(
    <>
    <Route element={<ProtectedRoutes/>}>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/books/create" element={<BookAdd/>}/>
     <Route path="/books/accession" element={<Accession/>}/>
     <Route path="/books/authors" element={<AuthorAdd/>}/>
     
  </Route>
  <Route element={<PublicRoutes restricted={true}/>}>
     <Route path='/' element={<Login/>}/>
     <Route path="/dashboard" element={<Dashboard/>}/>
  </Route>
</>
)

export default pages;