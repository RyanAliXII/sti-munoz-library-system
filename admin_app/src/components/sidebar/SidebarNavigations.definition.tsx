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
import { FaMoneyBillWave } from "react-icons/fa";

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
        text: "Collections",
        to: "/books/collections",
        requiredPermissions: ["Collection.Read"],
        icon: SiBookstack,
        items: [],
      },
      {
        text: "Book",
        to: "/books",
        items: [],
        icon: GiBookshelf,
        requiredPermissions: ["Book.Read"],
      },
      {
        text: "Accession",
        to: "/books/accessions",
        icon: Bs123,
        requiredPermissions: ["Book.Read"],
        items: [],
      },

      {
        text: "Author",
        to: "/books/authors",
        requiredPermissions: ["Author.Read"],
        icon: TfiWrite,
        items: [],
      },
      {
        text: "Publisher",
        icon: MdOutlinePublish,
        requiredPermissions: ["Publisher.Read"],
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
        requiredPermissions: ["Account.Read"],
        to: "/clients/accounts",
        icon: MdAccountCircle,
        items: [],
      },
      {
        text: "User Group",
        requiredPermissions: ["AccountTypeProgram.Read"],
        to: "/users/types",
        icon: MdAccountCircle,
        items: [],
      },
      {
        text: "Program/Strands",
        requiredPermissions: ["AccountTypeProgram.Read"],
        to: "/users/program-strand",
        icon: MdAccountCircle,
        items: [],
      },
      {
        requiredPermissions: ["PatronLog.Read"],
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
        requiredPermissions: ["BorrowedBook.Read"],
        to: "/borrowing/requests",
        items: [],
      },
      {
        text: "Queues",
        to: "/borrowing/queues",
        requiredPermissions: ["Queue.Read"],
        items: [],
      },
    ],
  },
  {
    text: "Penalty",
    to: "/fees",
    isCollapse: true,
    icon: FaMoneyBillWave,
    items: [
      {
        text: "Penalties",
        to: "/penalties",
        items: [],
        requiredPermissions: ["Penalty.Read"],
      },
      {
        text: "Classifications",
        items: [],
        requiredPermissions: ["Penalty.Read"],
        to: "/penalties/classifications",
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
        requiredPermissions: ["Game.Read"],
        items: [],
      },
      {
        text: "Game Logs",
        to: "services/games/logs",
        requiredPermissions: ["GameLog.Read"],
        items: [],
      },
      {
        text: "Device",
        requiredPermissions: ["Device.Read"],
        to: "services/devices",
        items: [],
      },
      {
        text: "Date Slot",
        requiredPermissions: ["DateSlot.Read"],
        to: "/services/date-slots",
        items: [],
      },
      {
        text: "Time Slots",
        to: "/services/time-slot-profiles",
        requiredPermissions: ["TimeSlot.Read"],
        items: [],
      },
      {
        text: "Reservation",
        to: "/services/reservations",
        requiredPermissions: ["Reservation.Read"],
        items: [],
      },
      {
        text: "Device Logs",
        requiredPermissions: ["DeviceLog.Read"],
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
        requiredPermissions: ["Role.Read"],
        to: "/system/access-control/",
        text: "Role and Permission",
        items: [],
      },
      {
        requiredPermissions: ["Role.Assign"],
        to: "/system/access-control/assign",
        text: "Assign Role",
        items: [],
      },
      {
        requiredPermissions: ["Role.Read"],
        to: "/system/access-control/assignments",
        text: "Role Assignments",
        items: [],
      },
      {
        requiredPermissions: ["ScannerAccount.Read"],
        to: "/system/scanner-accounts",
        text: "Scanner Accounts",
        items: [],
      },

      {
        to: "/system/settings",
        text: "Settings",
        items: [],
        requiredPermissions: ["Settings.Read"],
      },
      {
        to: "/faqs",
        text: "FAQs",
        items: [],
        requiredPermissions: [],
      },
      {
        to: "/policy",
        text: "Policy",
        items: [],
        requiredPermissions: [],
      },
      {
        to: "/reports",
        text: "Reports",
        items: [],
        requiredPermissions: ["Report.Read"],
      },
    ],
  },
];
