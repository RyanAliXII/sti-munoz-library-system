import { useMsal } from "@azure/msal-react";

const LogoutButton = () => {
  const { instance: msalClient } = useMsal();

  const logout = () => {
    msalClient.logoutRedirect({
      account: msalClient.getActiveAccount(),
    });
  };
  return (
    <a
      href="#"
      onClick={logout}
      className="text-gray-700 block px-4 py-2 text-sm"
      role="menuitem"
      tabIndex={-1}
      id="menu-item-3"
    >
      Sign Out
    </a>
  );
};

export default LogoutButton;
