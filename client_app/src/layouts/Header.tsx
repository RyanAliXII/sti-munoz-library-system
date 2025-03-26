import { useMsal } from "@azure/msal-react";
import { useAuthContext } from "@contexts/AuthContext";
import { BaseProps } from "@definitions/props.definition";
import { buildS3Url } from "@definitions/s3";
import {
    useNotifications,
    useNotificationsRead,
} from "@hooks/data-fetching/notification";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, Badge, DarkThemeToggle, Dropdown, Navbar, useThemeMode, ToggleSwitch } from "flowbite-react";
import { IoIosNotifications } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import TimeAgo from "timeago-react";
const navLinkClass = ({isActive}:{isActive:boolean})=>{
  const baseClass = "text-sm ";
  const fontColor = " text-gray-600 dark:text-gray-400"
  if(isActive) return baseClass + " font-semibold text-gray-700 dark:text-gray-200"
  return baseClass + fontColor;
}
const Header = ({ children }: BaseProps) => {
const { instance: msalClient } = useMsal();
const logout = async () => {
      const account = msalClient.getActiveAccount();
      msalClient.logoutRedirect({
        account: account,
        logoutHint: account?.idTokenClaims?.login_hint,
      });
  };
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
  const {user} = useAuthContext()
  const avatarUrl = user.profilePicture.length > 0 ?  new URL(buildS3Url(user.profilePicture)) : new URL(
    "https://ui-avatars.com/api/&background=2563EB&color=fff"
  );
  const {mode, toggleMode} = useThemeMode();
  avatarUrl.searchParams.set("name", `${user.givenName} ${user.surname}`);
  return (
   <Navbar fluid>
        <div className="w-full p-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center"> 
              <Navbar.Brand href="/" className="lg:flex">
                <img
                  src="/library-icon.svg"
                  className="mr-3 h-9"
                  alt="Library Logo"
                />
                <span className="self-center whitespace-nowrap text-base  hidden  font-semibold dark:text-white lg:block">
                  STI Munoz Library
                </span>
              </Navbar.Brand> 
            </div>
            <nav className="hidden lg:block">
              <ul className="flex gap-5 items-center">
              <li>
              <NavLink className={navLinkClass} to="/catalog">Catalog</NavLink>
              </li>
              <li>
              <NavLink className={navLinkClass} to="/bag">Bag</NavLink>
              </li>
              <li>
              <NavLink className={navLinkClass} to="/borrowed-books">My Books</NavLink>
              </li>
              <li>
              <NavLink className={navLinkClass} to="/queues">Queues</NavLink>
              </li>
              </ul>
            </nav>
            <div className="flex items-center gap-1">
              <Dropdown
                arrowIcon={true}
                inline
                label={
                  <Avatar
                  alt="User avatar"
                  img={avatarUrl.toString()}
                  rounded
                />
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">{user.displayName}</span>
                  <span className="block truncate text-sm font-medium">
                    {user.email}
                  </span>
                </Dropdown.Header>
                <Dropdown.Item as={Link} className="lg:hidden" to={"/catalog"}>Catalog</Dropdown.Item>
                <Dropdown.Item as={Link} className="lg:hidden"  to={"/bag"}>Bag</Dropdown.Item>
                <Dropdown.Item as={Link} className="lg:hidden"  to={"/borrowed-books"}>My Books</Dropdown.Item>
                <Dropdown.Item as={Link} className="lg:hidden"  to={"/queues"}>Queues</Dropdown.Item>
                <Dropdown.Item as={Link} to={"/Penalties"}>Penalties</Dropdown.Item>
                <Dropdown.Item as={Link} to={"/reservations"}>Reservations</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>
                  <div className="flex gap-2">
                  <ToggleSwitch checked={mode == "dark"} onChange={()=>{
                      toggleMode()
                  }} color="blue"/>
                  <span>
                  Dark Mode
                  </span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={"/profile"}>My Account</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item> 
              </Dropdown>
              <Dropdown
                arrowIcon={false}
                color=""
                className="border-none bg-none"
                label={
                  <div
                    className="flex border-none"
                    onClick={() => {
                      if (!isAllRead) notificationRead.mutate({});
                    }}
                  >
                    <IoIosNotifications className="text-xl"></IoIosNotifications>
                    {!isAllRead && (
                      <Badge color="primary" className="text-xs">
                        {notificationTotal}
                      </Badge>
                    )}
                  </div>
                }
              >
                {notifications?.slice(0, 5)?.map((n) => {
                  return (
                    <div key={n.id}>
                      <Dropdown.Item
                        style={{
                          maxWidth: "400px",
                        }}
                        className={`py-5 rounded flex-col items-start ${
                          n.link.length === 0 ? "pointer-events-none" : ""
                        }`}
                        to={n.link}
                        as={Link}
                      >
                        {n.message}
                        <TimeAgo
                          datetime={n.createdAt}
                          className="text-blue-500"
                        ></TimeAgo>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </div>
                  );
                })}
                <div className="px-5 pb-2">
                  <Link to="/notifications" className="text-sm underline">
                    View Notifications
                  </Link>
                </div>
              </Dropdown>
               <DarkThemeToggle
                className="hidden sm:block"
                onClick={() => {
                  let newMode = mode === "dark" ? "light" : "dark";
                  localStorage.setItem("theme", newMode);
                  toggleMode();
                }} 
              />
            </div>
          </div>
        </div>
      </Navbar>
  );
};
export default Header;
