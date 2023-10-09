import { BaseProps } from "@definitions/props.definition";
import React from "react";
import { NavLink } from "react-router-dom";
import { ImBooks } from "react-icons/im";
import { RiFileList2Fill, RiUserFill } from "react-icons/ri";
import { GiLightBackpack } from "react-icons/gi";

import { AiOutlineSearch } from "react-icons/ai";
import ProfileDropdown from "@components/ProfileDropdown";
const AuthBaseLayout = ({ children }: BaseProps) => {
  return (
    <div className="font-INTER min-h-screen">
      <header className="w-full h-16 border-b border hidden md:flex justify-end">
        <nav className="h-full mr-10">
          <ul className="h-full flex items-center gap-7 mr-5">
            <li>
              <NavLink to="/search" className={isHeaderNavActive}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/catalog" className={isHeaderNavActive}>
                Catalog
              </NavLink>
            </li>
            <li>
              <NavLink to="/bag" className={isHeaderNavActive}>
                Bag
              </NavLink>
            </li>
            <li>
              <NavLink to="/borrowed-books" className={isHeaderNavActive}>
                Borrowed Books
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="h-full flex items-center mr-16">
          <ProfileDropdown />
        </div>
      </header>

      <main className="h-full"> {children}</main>
      <div className="h-20 w-full"></div>
      <div className="fixed w-full h-16 bg-white border border-t border-gray-50  drop-shadow text-gray-600 md:hidden bottom-0">
        <nav className="h-full w-full">
          <ul className="flex h-full w-full items-center justify-around">
            <li>
              <NavLink to={"/search"} className={isBottomNavActive}>
                <AiOutlineSearch />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/catalog"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <RiFileList2Fill />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/bag"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <GiLightBackpack />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/borrowed-books"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <ImBooks />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/profile"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl"
                }
              >
                <RiUserFill />
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
const isBottomNavActive = (nav: { isActive: Boolean; isPending: Boolean }) =>
  nav.isActive ? "text-blue-500 text-2xl" : "text-2xl";

const isHeaderNavActive = (nav: { isActive: Boolean; isPending: Boolean }) =>
  nav.isActive
    ? "text-blue-500 text-xs lg:text-sm font-semibold"
    : "text-xs lg:text-sm";

export default AuthBaseLayout;
