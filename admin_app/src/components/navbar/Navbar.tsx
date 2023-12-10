import { useMsal } from "@azure/msal-react";
import { useAuthContext } from "@contexts/AuthContext";
import { useSidebarState } from "@contexts/SiderbarContext";
import {
  useNotifications,
  useNotificationsRead,
} from "@hooks/data-fetching/notification";
import { useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Badge,
  DarkThemeToggle,
  Dropdown,
  Navbar,
  useThemeMode,
} from "flowbite-react";
import type { FC } from "react";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";

const NavbarHeader: FC = function () {
  const [mode, , toggleMode] = useThemeMode();
  const { user } = useAuthContext();
  const { instance: msalClient } = useMsal();

  const logout = async () => {
    const account = msalClient.getActiveAccount();
    msalClient.logoutRedirect({
      account: account,
      logoutHint: account?.idTokenClaims?.login_hint,
    });
  };
  const { toggle } = useSidebarState();
  const avatarUrl = new URL(
    "https://ui-avatars.com/api/&background=2563EB&color=fff"
  );
  avatarUrl.searchParams.set("name", `${user.givenName} ${user.surname}`);
  const { data: notifications } = useNotifications();
  const queryClient = useQueryClient();
  const notificationsRead = useNotificationsRead({
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
  const isAllRead = notifications?.every((n) => n.isRead);
  const notificationTotal = notifications?.reduce((a, r) => {
    if (!r.isRead) a++;
    return a;
  }, 0);
  return (
    <Navbar fluid>
      <div className="w-full p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Navbar.Toggle
              onClick={() => {
                toggle();
              }}
            />
            <Navbar.Brand href="/" className="hidden lg:flex">
              <img
                src="/library-icon.svg"
                className="mr-3 h-6 sm:h-9"
                alt="Flowbite React Logo"
              />
              <span className="self-center whitespace-nowrap text-base  hidden  font-semibold dark:text-white lg:block">
                STI Munoz Library
              </span>
            </Navbar.Brand>
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User settings"
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
              {/* <Dropdown.Item>Dashboard</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              */}
              <Dropdown.Item>Account Settings</Dropdown.Item>
              <Dropdown.Divider />
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
                    if (!isAllRead) notificationsRead.mutate({});
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
              {notifications?.slice(0, 10)?.map((n) => {
                return (
                  <div key={n.id}>
                    <Dropdown.Item
                      className="py-5 rounded b "
                      to={n.link}
                      as={Link}
                    >
                      {n.message}
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

export default NavbarHeader;
