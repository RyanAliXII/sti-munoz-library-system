import { useMsal } from "@azure/msal-react";
import { MdLogout } from "react-icons/md";

const LogoutButton = () => {
  const { instance: msalClient } = useMsal();

  const logout = async () => {
    const account = msalClient.getActiveAccount();
    msalClient.logoutRedirect({
      account: account,
      logoutHint: account?.idTokenClaims?.login_hint,
    });
  };
  return (
    <a
      href="#"
      onClick={logout}
      className="text-gray-700 px-4 py-2 text-sm"
      role="menuitem"
      tabIndex={-1}
      id="menu-item-3"
    >
      <div className="ml-5 flex items-center h-10 gap-1">
        <MdLogout className="text-xl" />
        <span className="font-medium text-sm ">Sign Out</span>
      </div>
    </a>
  );
};

export default LogoutButton;
