import axiosClient from "@definitions/config/axios";
import { BaseSyntheticEvent, useRef, useState } from "react";
import { useMutation } from "react-query";

const Login = ({ revalidateAuth }: { revalidateAuth: () => void }) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const inputUsernameRef = useRef<HTMLInputElement>(null);
  const inputPasswordRef = useRef<HTMLInputElement>(null);
  const login = useMutation({
    mutationFn: (form: any) =>
      axiosClient.post("/login", form, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      revalidateAuth();
    },
    onError: () => {
      setErrorMessage("Invalid username or password");
    },
  });

  const handleSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const form = {
      username: formData.get("username") ?? "",
      password: formData.get("password") ?? "",
    };
    setErrorMessage(undefined);
    login.mutate(form);
  };
  const removeInputErrors = () => {
    if (
      !inputPasswordRef.current?.classList.contains("outline-red-500") ||
      !inputUsernameRef.current?.classList.contains("outline-red-500")
    )
      return;

    setErrorMessage(undefined);
    inputUsernameRef.current?.classList?.remove("outline");
    inputUsernameRef.current?.classList.remove("outline-red-500");
    inputPasswordRef.current?.classList?.remove("outline");
    inputPasswordRef.current?.classList.remove("outline-red-500");
  };
  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          {/* <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img
              className="w-8 h-8 mr-2"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
              alt="logo"
            />
            Flowbite
          </a> */}
          {errorMessage && (
            <div
              className="flex w-full sm:max-w-md items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 mr-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>{errorMessage}</div>
            </div>
          )}
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign In Scanner Account
              </h1>

              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Username
                  </label>
                  <input
                    ref={inputUsernameRef}
                    type="text"
                    onChange={removeInputErrors}
                    name="username"
                    id="username"
                    className={`bg-gray-50 border border-gray-300 text-gray-900 
                    sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                     dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                       errorMessage ? "outline outline-red-500" : ""
                     }`}
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    ref={inputPasswordRef}
                    onChange={removeInputErrors}
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className={`bg-gray-50 border border-gray-300 text-gray-900 
                    sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                     dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                       errorMessage ? "outline outline-red-500" : ""
                     }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
