import {createBrowserRouter, createRoutesFromElements, RouterProvider, Route} from 'react-router-dom'
import Dashboard from './pages/protected/Dashboard';
import Login from './pages/Login';
import {AuthProvider} from './contexts/AuthContext'
import {PublicClientApplication} from "@azure/msal-browser"
import {MsalProvider} from '@azure/msal-react';
import msalConfig from './definitions/configs/authConfig'
import './assets/css/tailwind.css'
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoutes from './components/PublicRoutes';
import { useEffect } from 'react';
import Accession from './pages/protected/books/Accession';
import BookCreator from './pages/protected/books/BookCreator';
import AuthorCreator from './pages/protected/books/AuthorCreator';
function App() {
  useEffect(()=>{
    document.title = "Admin"
  },[])
const msalInstance = new PublicClientApplication(msalConfig)
const router = createBrowserRouter(
    createRoutesFromElements(
      <>        
            {/* <Route path='/'  element={<h1>Hello world </h1>}/>  */}
            <Route element={<ProtectedRoutes/>}>
               <Route path="/dashboard" element={<Dashboard/>}/>
               <Route path="/books/create" element={<BookCreator/>}/>
               <Route path="/books/accessions" element={<Accession/>}/>
               <Route path="/books/authors" element={<AuthorCreator/>}/>
               
            </Route>
            <Route element={<PublicRoutes restricted={true}/>}>
               <Route path='/' element={<Login/>}/>
               <Route path="/dashboard" element={<Dashboard/>}/>
       
            </Route>
          
        </>

    )
  );
  
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </MsalProvider>
  )
  
}

export default App
