import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { BaseProps } from "../definitions/interfaces/Props";
import LogoutButton from "./LogoutButton";

const Header = ({ children }: BaseProps) => {
    const {user} = useContext(AuthContext)
    const [visible, setVisibility] = useState(false)
    const toggleDropdown = ()=>{
      setVisibility((visible)=>!visible)
    }
  return (
    <header className="bg-white">
      <div className="container mx-auto px-4 py-8 flex items-center">
        <div className="w-full h-full flex justify-end gap-1">
        <div className="flex items-center">
            <img className="rounded-full w-10 h-10" src={`https://avatars.dicebear.com/api/initials/${user.firstname}${user.lastname}.svg?background=%230000ff`} alt="profile-image"></img>
        </div>
        <div className="flex items-center relative text-left">
          <div>
            <button type="button"  onClick={toggleDropdown} className="flex justify-center rounded-md  bg-white px-1 py-1 text-sm font-medium text-gray-700 shadow-sm" id="menu-button" aria-expanded="true" aria-haspopup="true">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
            <div className={ visible ? "absolute right-2 top-10 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" : "hidden absolute right-2 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"  } role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
            <div className="py-1" role="none">
              <div className="flex flex-col px-4 py-2 gap-1">
                <small className="font-medium">{user.firstname + " " + user.lastname}</small>
                <small>{user.email}</small>
              </div>
              <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex={-1} id="menu-item-0">Account settings</a>
              <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex={-1} id="menu-item-1">Support</a>
              <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex={-1} id="menu-item-2">License</a>
              <LogoutButton />
              {/* <form method="POST" action="#" role="none">
                <button type="submit" className="text-gray-700 block w-full px-4 py-2 text-left text-sm" role="menuitem" tabIndex={-1} id="menu-item-3">Sign out</button>
              </form> */}
            </div>
       </div>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
