import { useAuthContext } from "@contexts/AuthContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { CiCircleRemove } from "react-icons/ci";
import { BsArrowReturnLeft } from "react-icons/bs";
import { FaHandHolding, FaMoneyBill } from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuthContext();
  const qrRef = useRef<HTMLDivElement | null>(null);
  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    const qrCanvas = await html2canvas(qrRef.current, { scale: 2 });
    const doc = new jsPDF("l", "px", [300, 300]);
    doc.addImage(qrCanvas, 100, 60, 100, 100);
    doc.text(`LIBRARY PASS`, 150, 50, { align: "center" });
    doc.text(
      `${user.givenName.toUpperCase()} ${user.surname.toUpperCase()}`,
      150,
      180,
      {
        align: "center",
      }
    );

    doc.save(user.id);
  };
  return (
    <div className="lg:w-8/12 mx-auto">
      <div className="w-full h-56 bg-gray-300 relative">
        <img
          src={`https://ui-avatars.com/api/?name=${user.givenName}${user.surname}&background=2563EB&color=fff`}
          className="h-36 w-36 absolute  border rounded-full bg-black left-5"
          style={{ bottom: "-55px" }}
        ></img>
      </div>
      <div className="flex justify-between flex-col w-full px-9 mt-16">
        <div>
          <div>
            <h1 className="lg:text-xl font-bold ">
              {user.givenName} {user.surname}
            </h1>
            <h2 className="lg:text-lg text-gray-500">{user.email}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 w-full mt-10 gap-3">
          <Link
            to={"#"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-error gap-2"
          >
            <FaMoneyBill className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              PHP{" "}
              {user.metaData.totalPenalty.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="text-xs lg:text-sm">Total Penalty</small>
          </Link>
          <Link
            to={"/borrowed-books?status=pending"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-gray-400 gap-2"
          >
            <MdOutlinePending className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {user.metaData.onlinePendingBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Pending Borrow Request
            </small>
          </Link>

          <Link
            to={"/borrowed-books?status=approved"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-yellow-500 gap-2"
          >
            <AiFillCheckCircle className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {user.metaData.onlineApprovedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Approved Borrow Request
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status=checked-out"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-success gap-2"
          >
            <FaHandHolding className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {user.metaData.onlineCheckedOutBooks +
                user.metaData.walkInCheckedOutBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Checked-Out Books
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status=returned"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-gray-500 gap-3"
          >
            <BsArrowReturnLeft className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {user.metaData.onlineReturnedBooks +
                user.metaData.walkInReturnedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Returned Books
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status=cancelled"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-orange-500 gap-3"
          >
            <CiCircleRemove className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {user.metaData.onlineCancelledBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Cancelled Borrow Request
            </small>
          </Link>
        </div>
        <div className="flex flex-col mt-10 items-center gap-3">
          <div ref={qrRef}>
            <QRCode
              value={user?.id ?? "none"}
              className="w-28 h-28 lg:w-32 lg:h-32"
            />
          </div>
          <div>
            <button
              className="text-sm p-2.5 bg-primary rounded text-white mb-2"
              onClick={downloadQRCode}
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
