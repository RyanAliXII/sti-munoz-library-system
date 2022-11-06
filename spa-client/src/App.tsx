import {createBrowserRouter, createRoutesFromElements, RouterProvider, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import {AuthProvider} from './contexts/AuthContext'
import {PublicClientApplication} from "@azure/msal-browser"
import {MsalProvider} from '@azure/msal-react';
import msalConfig from './definitions/configs/authConfig'
import Profile from './pages/Profile';
import './assets/css/tailwind.css'
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoutes from './components/PublicRoutes';
function App() {
const msalInstance = new PublicClientApplication(msalConfig)
const router = createBrowserRouter(
    createRoutesFromElements(
      <>        
            <Route path='/'  element={<h1>Hello world </h1>}/> 
            <Route element={<ProtectedRoutes/>}>
               <Route path="/dashboard" element={<Dashboard/>}/>
               <Route path="/profile" element={<Profile/>}/>
            </Route>
            <Route element={<PublicRoutes restricted={true}/>}>
               <Route path='/login' element={<Login/>}/>
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
