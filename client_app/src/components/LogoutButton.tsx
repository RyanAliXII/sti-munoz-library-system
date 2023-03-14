import { useMsal } from "@azure/msal-react";
import React from "react";

const LogoutButton = () => {
  const { instance: msalClient } = useMsal();
  const account = msalClient.getActiveAccount();
  const logout = () => {
    msalClient.logoutRedirect({
      account: account,
      logoutHint: account?.idTokenClaims?.login_hint,
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
