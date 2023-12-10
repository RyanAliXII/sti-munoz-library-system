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
          className="rounded-full w-8 lg:w-10 lg:h-10"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = avatarUrl;
          }}
          src={profilePicUrl}
          alt="profile-image"
        ></img>
      </button>
      <div></div>
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
