import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import useToggle from "../hooks/useToggle";
import LogoutButton from "./LogoutButton";

const Header = () => {
  const { user } = useContext(AuthContext);
  const { toggle, value: visible } = useToggle(false);
  return (
    <header className="fixed top-0 w-full bg-white z-10 drop-shadow-sm">
      <div className="px-4 h-20 flex items-center">
        <div className="w-full h-full flex justify-end gap-1">
          <div className="flex items-center">
            <img
              className="rounded-full w-10 h-10"
              src={`https://ui-avatars.com/api/?name=${user.firstname}${user.lastname}&background=2563EB&color=fff`}
              alt="profile-image"
            ></img>
          </div>
          <div className="flex items-center relative text-left">
            <div className="mr-10">
              <button
                type="button"
                onClick={toggle}
                className="flex justify-center rounded-md  bg-white px-1 py-1 text-sm font-medium text-gray-700"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div
              className={
                visible
                  ? "absolute right-2 top-12 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  : "hidden absolute right-2 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              }
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="py-1" role="none">
                <div className="flex flex-col px-4 py-2 gap-1">
                  <small className="font-medium">
                    {user.firstname + " " + user.lastname}
                  </small>
                  <small>{user.email}</small>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
