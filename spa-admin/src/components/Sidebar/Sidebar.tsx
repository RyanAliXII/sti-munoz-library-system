import { NavLink } from "react-router-dom";
import { MdOutlineLibraryBooks, MdOutlineInventory } from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import Drawer, { DrawerButton } from "./Drawer";

const Sidebar = () => {
  const isNavActive = (bool: boolean) => {
    if (bool) {
      return "w-full h-8 text-gray-800 bg-white flex items-center rounded-sm font-semibold";
    } else {
      return "w-full h-8 text-gray-400 flex items-center";
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-5"></div>

      <Drawer
        drawerButton={
          <DrawerButton
            icon={<MdOutlineLibraryBooks className="text-xl" />}
            text="Books"
          />
        }
      >
        <NavLink
          className={(active) => isNavActive(active.isActive)}
          to={"/books/create"}
        >
          <small className="ml-12">Create Book</small>
        </NavLink>
        <NavLink
          className={(active) => isNavActive(active.isActive)}
          to={"/books/accessions"}
        >
          <small className="ml-12">Accessions</small>
        </NavLink>
        <NavLink className={(active) => isNavActive(active.isActive)} to={"/"}>
          <small className="ml-12">Cutter's Table</small>
        </NavLink>
        <NavLink className={(active) => isNavActive(active.isActive)} to={"/"}>
          <small className="ml-12">Dewey Decimal</small>
        </NavLink>
        <NavLink
          className={(active) => isNavActive(active.isActive)}
          to={"/books/authors"}
        >
          <small className="ml-12">Authors</small>
        </NavLink>
        <NavLink className={(active) => isNavActive(active.isActive)} to={"/"}>
          <small className="ml-12">Shelf</small>
        </NavLink>
      </Drawer>
      <Drawer
        drawerButton={
          <DrawerButton
            icon={<MdOutlineLibraryBooks className="text-xl" />}
            text="Attendance"
          />
        }
      >
        <NavLink className={(active) => isNavActive(active.isActive)} to={"/"}>
          <small className="ml-12">Logs</small>
        </NavLink>
        <NavLink className={(active) => isNavActive(active.isActive)} to={"/"}>
          <small className="ml-12">Scanner</small>
        </NavLink>
      </Drawer>
      <NavLink className="w-full h-8 flex items-center" to={"/"}>
        <div className="ml-5 flex items-center h-11 gap-1">
          <MdOutlineInventory className="text-xl"></MdOutlineInventory>
          <span className="">Inventory</span>
        </div>
      </NavLink>
      <NavLink className="w-full h-8 flex items-center" to={"/"}>
        <div className="ml-5 flex items-center h-11 gap-1">
          <RiReservedLine className="text-xl"></RiReservedLine>
          <span className="">Reservations</span>
        </div>
      </NavLink>
    </div>
  );
};

export default Sidebar;
