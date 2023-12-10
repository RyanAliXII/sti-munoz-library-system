import HeaderIcon from "@assets/images/library-icon.svg";
import ProfileDropdown from "@components/ProfileDropdown";
import { BaseProps } from "@definitions/props.definition";
import {
  useNotifications,
  useNotificationsRead,
} from "@hooks/data-fetching/notification";
import { useQueryClient } from "@tanstack/react-query";
import { AiOutlineSearch } from "react-icons/ai";
import { FaRegListAlt } from "react-icons/fa";
import { GiLightBackpack } from "react-icons/gi";
import { ImBooks } from "react-icons/im";
import { IoIosNotifications } from "react-icons/io";
import { RiUserFill } from "react-icons/ri";
import { Link, NavLink } from "react-router-dom";
import TimeAgo from "timeago-react";
const AuthBaseLayout = ({ children }: BaseProps) => {
  const { data: notifications } = useNotifications();
  const queryClient = useQueryClient();
  const isAllRead = notifications?.every((n) => n.isRead);
  const notificationTotal = notifications?.reduce((a, r) => {
    if (!r.isRead) a++;
    return a;
  }, 0);
  const notificationRead = useNotificationsRead({
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
  return (
    <div className="font-INTER min-h-screen">
      <header className="w-full  flex justify-between items-center py-3 bg-blue-800 text-white">
        <div>
          <img
            src={HeaderIcon}
            alt="library-logo"
            className="w-8 lg:w-14 ml-5"
          />
        </div>
        <nav className="h-full lg:mr-10 hidden md:block">
          <ul className="h-full flex items-center gap-7 lg:mr-5">
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
              <div className="dropdown ">
                <div
                  tabIndex={0}
                  role="button"
                  className="rounded-btn p-0 text-sm  normal-case focus:bg-none font-normal flex items-center gap-1"
                >
                  Books
                </div>
                <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                  <li className="text-gray-700">
                    <NavLink to="/borrowed-books" className={isHeaderNavActive}>
                      Borrowed
                    </NavLink>
                  </li>
                  <li className="text-gray-700">
                    <NavLink to="/queues" className={isHeaderNavActive}>
                      Queues
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <NavLink to="/reservations" className={isHeaderNavActive}>
                Reservations
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="h-full flex items-center">
          <ProfileDropdown />
          <div className="dropdown dropdown-left mr-5">
            <div
              onClick={() => {
                if (isAllRead) return;
                notificationRead.mutate({});
              }}
              tabIndex={0}
              role="button"
              className="rounded-btn p-0 text-sm  normal-case focus:bg-none font-normal flex items-center gap-1"
            >
              <IoIosNotifications className="text-xl lg:text-2xl" />
              {!isAllRead && (
                <div className="badge badge-primary">{notificationTotal}</div>
              )}
            </div>
            <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-80 mt-4">
              {notifications?.slice(0, 2).map((n) => {
                return (
                  <li className="border-b" key={n.id}>
                    <Link
                      to={n.link}
                      className={`py-5 rounded flex-col items-start ${
                        n.link.length === 0 ? "pointer-events-none" : ""
                      }`}
                    >
                      <div className="text-gray-700 text-sm">{n.message}</div>
                      <TimeAgo
                        className="text-blue-500 text-sm"
                        datetime={n.createdAt}
                      />
                    </Link>
                  </li>
                );
              })}
              <li className="text-gray-900 p-0">
                <Link
                  to="/notifications"
                  className="underline underline-offset-1"
                >
                  View Notifications
                </Link>
              </li>
              ;
            </ul>
          </div>
        </div>
      </header>

      <main className="h-full"> {children}</main>
      <div className="h-20 w-full"></div>
      <div className="fixed w-full h-16 bg-white border border-t border-gray-50  drop-shadow text-gray-600 md:hidden bottom-0">
        <nav className="h-full w-full">
          <ul className="flex h-full w-full items-center justify-around">
            <li>
              <NavLink
                to={"/catalog"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-sm" : ""
                }
              >
                <AiOutlineSearch />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/bag"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-lg" : "text-lg"
                }
              >
                <GiLightBackpack />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/borrowed-books"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-lg" : "text-lg"
                }
              >
                <ImBooks />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/reservations"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-lg" : "text-lg"
                }
              >
                <FaRegListAlt />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/profile"}
                className={(nav) =>
                  nav.isActive ? "text-blue-500 text-lg" : "text-lg"
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
