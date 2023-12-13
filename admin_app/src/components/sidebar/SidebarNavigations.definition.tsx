import {
  MdAccountCircle,
  MdManageAccounts,
  MdOutlineGames,
  MdOutlineInventory,
  MdOutlinePublish,
  MdRotate90DegreesCcw,
} from "react-icons/md";
import { TfiWrite } from "react-icons/tfi";
import { SiBookstack } from "react-icons/si";
import { AiOutlineDashboard } from "react-icons/ai";
import { FC, SVGProps } from "react";
import { FiBookOpen, FiSettings } from "react-icons/fi";
import { Bs123 } from "react-icons/bs";
import { GiBookshelf } from "react-icons/gi";

export type SidebarNavItem = {
  to: string;
  text?: string;
  items: SidebarNavItem[];
  requiredPermissions?: string[];
  icon?: FC<SVGProps<SVGSVGElement>>;
  isCollapse?: boolean;
};

export const SidebarNavigationItems: SidebarNavItem[] = [
  {
    text: "Dashboard",
    to: "/dashboard",
    icon: AiOutlineDashboard,
    items: [],
  },
  {
    text: "Catalog",
    to: "/catalog",
    icon: FiBookOpen,
    isCollapse: false,
    items: [
      {
        text: "Book",
        to: "/books",
        items: [],
        icon: GiBookshelf,
        requiredPermissions: ["Book.Access", "Section.Access"],
      },
      // {
      //   text: "Accession",
      //   to: "/books/accessions",
      //   icon: Bs123,
      //   requiredPermissions: ["Book.Access"],
      //   items: [],
      // },
      {
        text: "Author",
        to: "/books/authors",
        requiredPermissions: ["Author.Access"],
        icon: TfiWrite,
        items: [],
      },
      {
        text: "Collections",
        to: "/books/collections",
        requiredPermissions: ["Section.Access"],
        icon: SiBookstack,
        items: [],
      },
      {
        text: "Publisher",
        icon: MdOutlinePublish,
        requiredPermissions: ["Publisher.Access"],
        to: "/books/publishers",
        items: [],
      },
    ],
  },

  {
    text: "Inventory",
    to: "/inventory",
    icon: MdOutlineInventory,
    items: [
      {
        text: "Audit",
        to: "/inventory/audits",
        icon: MdOutlineInventory,
        items: [],
        requiredPermissions: ["Audit.Access"],
      },
    ],
  },
  {
    text: "Patron",
    to: "/clients",
    isCollapse: true,
    icon: MdManageAccounts,
    items: [
      {
        text: "Account",
        requiredPermissions: ["Account.Access"],
        to: "/clients/accounts",
        icon: MdAccountCircle,
        items: [],
      },
      {
        text: "User Group",
        requiredPermissions: ["Account.Access"],
        to: "/users/types",
        icon: MdAccountCircle,
        items: [],
      },
      {
        text: "Program/Strands",
        requiredPermissions: ["Account.Access"],
        to: "/users/program-strand",
        icon: MdAccountCircle,
        items: [],
      },
      {
        requiredPermissions: ["ClientLog.Access"],
        to: "/system/client-logs",
        text: "Patron Logs",
        items: [],
      },
    ],
  },

  {
    text: "Borrowing",
    to: "/borrowing",
    isCollapse: true,
    icon: MdRotate90DegreesCcw,
    items: [
      {
        text: "Borrowed Books",
        requiredPermissions: ["Borrowing.Access"],
        to: "/borrowing/requests",
        items: [],
      },
      // {
      //   text: "Borrow Book",
      //   to: "/borrowing/checkout",
      //   requiredPermissions: [
      //     "Borrowing.Access",
      //     "Book.Access",
      //     "Account.Access",
      //   ],
      //   items: [],
      // },
      {
        text: "Queues",
        to: "/borrowing/queues",
        requiredPermissions: [
          "Borrowing.Access",
          "Book.Access",
          "Account.Access",
        ],
        items: [],
      },
      {
        text: "Penalties",
        to: "/borrowing/penalties",
        requiredPermissions: ["Penalty.Access", "Account.Access"],
        items: [],
      },
    ],
  },

  {
    text: "Services",
    to: "/services",
    icon: MdOutlineGames,
    isCollapse: true,
    items: [
      {
        text: "Games",
        to: "/services/games",
        items: [],
      },
      {
        text: "Game Logs",
        to: "services/games/logs",
        items: [],
      },
      {
        text: "Device",
        to: "services/devices",
        items: [],
      },
      {
        text: "Date Slot",
        to: "/services/date-slots",
        items: [],
      },
      {
        text: "Time Slots",
        to: "/services/time-slot-profiles",
        items: [],
      },
      {
        text: "Reservation",
        to: "/services/reservations",
        items: [],
      },
      {
        text: "Device Logs",
        to: "/services/devices/logs",
        items: [],
      },
    ],
  },
  {
    text: "System",
    to: "/system",
    icon: FiSettings,
    isCollapse: true,
    items: [
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/",
        text: "Role and Permission",
        items: [],
      },
      {
        requiredPermissions: ["ACL.Access", "Account.Access"],
        to: "/system/access-control/assign",
        text: "Assign Role",
        items: [],
      },
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/assignments",
        text: "Role Assignments",
        items: [],
      },
      {
        requiredPermissions: ["ScannerAccount.Access"],
        to: "/system/scanner-accounts",
        text: "Scanner Accounts",
        items: [],
      },

      {
        to: "/system/settings",
        text: "Settings",
        items: [],
        requiredPermissions: ["Settings.Access"],
      },
      {
        to: "/reports",
        text: "Reports",
        items: [],
        requiredPermissions: ["Settings.Access"],
      },
    ],
  },
];
