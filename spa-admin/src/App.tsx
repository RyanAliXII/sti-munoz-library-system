import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {AuthProvider} from './contexts/AuthContext'
import {PublicClientApplication} from "@azure/msal-browser"
import {MsalProvider} from '@azure/msal-react';
import msalConfig from './definitions/configs/msal.config'
import './assets/css/tailwind.css'

import { useEffect } from 'react';
import pages from './pages/Pages';
function App() {
  useEffect(()=>{
    document.title = "Admin"
  },[])
const msalInstance = new PublicClientApplication(msalConfig)
const router = createBrowserRouter(
    pages
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
