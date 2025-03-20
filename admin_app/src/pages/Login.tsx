import { loginRequest } from "@definitions/configs/msal/msal.config";
import { useMsal } from "@azure/msal-react";
import { Button } from "flowbite-react";
import libraryIcon from "@assets/images/library-icon.svg"
import { FormEvent } from "react";
import { TiVendorMicrosoft } from "react-icons/ti"
const Login = () => {
  const { instance: msalClient } = useMsal();
  const handleLogin = async (event: FormEvent<HTMLFormElement> ) => {
    event.preventDefault()
    try {
      await msalClient.loginRedirect(loginRequest);
    } catch (err) {
      console.error(err);
    }
  };
  return (
  <section className="bg-gray-50 dark:bg-gray-900  h-screen">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex flex-col items-center gap-1  mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <img className="w-14 h-14 mr-2" src={libraryIcon} alt="logo"></img>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              STI College Muñoz-EDSA Library
              </h1>
              <p className="text-gray-900 dark:text-white">
                  Securely sign in to manage and maintain the library
                  resource.
              </p>
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6" action="#">
                <Button color="primary" className="w-full" type="submit">
                
                <TiVendorMicrosoft className="text-xl md:text-2xl mr-2"/>
                  
                  <span className="text-base md:text-lg">Sign In</span></Button>
              </form>
          </div>
      </div>
  </div>
</section>
  );
};

export default Login;
