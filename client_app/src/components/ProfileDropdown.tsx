import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import useToggle from "@hooks/useToggle";
import { useAuthContext } from "@contexts/AuthContext";
import { Link } from "react-router-dom";
import { buildS3Url } from "@definitions/s3";

const ProfileDropdown = () => {
  const { toggle, value: visible } = useToggle();
  const { user } = useAuthContext();

  const avatarUrl = `https://ui-avatars.com/api/?name=${user.givenName}${user.surname}&background=2563EB&color=fff`;
  const profilePicUrl =
    user.profilePicture.length > 0
      ? buildS3Url(user.profilePicture)
      : avatarUrl;
  return (
    <div className="flex items-center relative text-left">
      <button className="flex items-center" onClick={toggle}>
        <img
          className="rounded-full w-10 h-10"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = avatarUrl;
          }}
          src={profilePicUrl}
          alt="profile-image"
        ></img>
      </button>
      <div>
        {/* <button
          type="button"
          onClick={() => {
            toggle();
          }}
          className="flex justify-center rounded-md  bg-white px-1 py-1 text-sm font-medium text-gray-700 "
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
        </button> */}
      </div>
      <div
        className={
          visible
            ? "absolute right-2 top-10 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            : "hidden absolute right-2 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        }
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <div className="py-1" role="none">
          <div className="flex flex-col px-4 py-2 gap-1 overflow-hidden">
            <small className="font-medium text-xs text-gray-800">
              {user.givenName + " " + user.surname}
            </small>
            <small className="text-xs text-gray-800">{user.email}</small>
          </div>
          <Link to="/profile" className="text-gray-700 block px-4 py-2 text-sm">
            Profile
          </Link>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
