import axiosClient from "@definitions/config/axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

const Inquire = () => {
  const [isAlertShown, setIsAlertShown] = useState(false);
  const [account, setAccount] = useState({
    id: "",
    givenName: "",
    surname: "",
  });
  const [input, setInput] = useState("");
  const timeOut = useRef<any>(null);
  const qrAreaClass = account.id.length === 0 ? "hidden" : "";
  const alertClass = isAlertShown
    ? "flex items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
    : " hidden";
  const TWENTY_SECONDS = 20000;
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAlertShown(false);
    resetAccount();
    clearTimeout(timeOut.current);
    try {
      const response = await axiosClient.get(`/inquire-account?input=${input}`);
      const { data } = response.data;
      if (!data?.account) return;

      setAccount({
        id: data.account.id,
        givenName: data.account.givenName,
        surname: data.account.surname,
      });
      timeOut.current = setTimeout(() => {
        resetAccount();
      }, TWENTY_SECONDS);
    } catch (error) {
      console.error(error);
      setIsAlertShown(true);
    }
  };
  const resetAccount = () => {
    setAccount({
      id: "",
      givenName: "",
      surname: "",
    });
  };
  useEffect(() => {
    return () => {
      clearTimeout(timeOut.current);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center  justify-center dark:bg-gray-800">
      <h2 className="text-4xl font-extrabold dark:text-white mb-4">
        GET YOUR LIBRARY PASS
      </h2>
      <div className="w-11/12 lg:w-4/12 mt-6">
        <div className={alertClass} role="alert">
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">Account not found!</span> Please
            contact the library administrator
          </div>
        </div>

        <form className="flex gap-2 items-center" onSubmit={onSubmit}>
          <input
            onChange={(event) => {
              setInput(event.target.value);
            }}
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter you email or student number"
          />
          <button
            type="submit"
            className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Search
          </button>
        </form>

        <div className={qrAreaClass}>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              STI Munoz Library Pass
            </h2>
            <p className="text-xl font-thin text-gray-900 dark:text-white">
              {account.givenName} {account.surname}
            </p>
          </div>
          <div className="flex flex-col items-center px-10 py-20 mt-7 bg-white">
            <QRCode
              value={account.id}
              style={{ width: "3.0in", height: "3.0in" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquire;
