import type { FC } from "react";
import {
  Avatar,
  DarkThemeToggle,
  Dropdown,
  Navbar,
  useThemeMode,
} from "flowbite-react";
import { useAuthContext } from "@contexts/AuthContext";
import { useMsal } from "@azure/msal-react";
import { useSidebarState } from "@contexts/SiderbarContext";

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
  const avatarUrl = `https://ui-avatars.com/api/?name=${user.givenName}${user.surname}&background=2563EB&color=fff`;
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
              label={<Avatar alt="User settings" img={avatarUrl} rounded />}
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
