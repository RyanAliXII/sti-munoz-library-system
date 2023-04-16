import { loginRequest } from "@definitions/configs/msal/msal.config";
import { useMsal } from "@azure/msal-react";
import { FaUniversalAccess } from "react-icons/fa";

const Login = () => {
  const { instance: msalClient } = useMsal();
  const handleLogin = async () => {
    try {
      await msalClient.loginRedirect(loginRequest);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="relative py-16 bg-gradient-to-br from-sky-50 to-gray-200 min-h-screen">
      <div className="relative container m-auto px-6 text-gray-500 md:px-12 xl:px-40 flex">
        <div className="m-auto md:w-8/12 lg:w-3/12 xl:w-5/12">
          <div
            className="rounded-xl bg-white shadow-xl"
            style={{ height: "500px" }}
          >
            <div className="p-6 sm:p-16">
              <div className="space-y-4">
                <img
                  src="https://tailus.io/sources/blocks/social/preview/images/icon.svg"
                  loading="lazy"
                  className="w-10"
                  alt="tailus logo"
                />
                <h2 className="mb-8 text-2xl text-cyan-900 font-bold">
                  Sign in to Manage
                  <br /> the Library
                </h2>
                <p>
                  Securely sign in to manage and maintain the school's library
                  resource.
                </p>
              </div>
              <div className="mt-16 grid space-y-4">
                <button
                  className="group h-12 px-6 border-2 border-gray-300 rounded-full transition duration-300 
     hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100"
                  onClick={handleLogin}
                >
                  <div className="relative flex items-center space-x-4 justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="30px"
                      height="30px"
                    >
                      <path
                        fill="#e64a19"
                        d="M7 12L29 4 41 7 41 41 29 44 7 36 29 39 29 10 15 13 15 33 7 36z"
                      />
                    </svg>
                    <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">
                      Library Staff Login
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
