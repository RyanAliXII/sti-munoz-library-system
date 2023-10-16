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
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { Account, ModalProps } from "@definitions/types";
import Loader from "@components/Loader";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import Uppy from "@uppy/core";
import Modal from "react-responsive-modal";
import Dashboard from "@uppy/dashboard";
import { Dashboard as DashboardComponent } from "@uppy/react";
import { useSwitch } from "@hooks/useToggle";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".webp", ".jpg"],
    maxNumberOfFiles: 1,
  },
}).use(Dashboard);

const ProfilePage = () => {
  const { user } = useAuthContext();

  const { Get } = useRequest();
  const fetchAccount = async (): Promise<Account> => {
    try {
      const response = await Get(`/accounts/${user.id}`);
      const { data } = response.data;
      return data.account as Account;
    } catch (error) {
      return account as Account;
    }
  };

  const { data: account } = useQuery<Account>({
    queryFn: fetchAccount,
    queryKey: ["profileAccount"],
  });
  const qrRef = useRef<HTMLDivElement | null>(null);
  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    const qrCanvas = await html2canvas(qrRef.current, { scale: 5 });
    const img = qrCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${user.id}.png`;
    link.href = img;
    link.click();
  };
  const {
    isOpen: isUploadProfileOpen,
    close: closeUploadProfileModal,
    open: openUploadProfile,
  } = useSwitch();
  if (!account) return <Loader />;
  return (
    <div className="lg:w-8/12 mx-auto">
      <div className="w-full h-56 bg-gray-300 relative">
        <img
          src={`https://ui-avatars.com/api/?name=${account.givenName}${account.surname}&background=2563EB&color=fff`}
          className="h-36 w-36 absolute  border rounded-full bg-black left-5"
          style={{ bottom: "-55px" }}
        ></img>
      </div>
      <div className="flex justify-between flex-col w-full px-9 mt-16">
        <div>
          <div>
            <h1 className="lg:text-xl font-bold ">
              {account.givenName} {account.surname}
            </h1>
            <h2 className="lg:text-lg text-gray-500">{account.email}</h2>
            <a
              className="text-sm underline text-blue-400"
              role="button"
              onClick={openUploadProfile}
            >
              Update Profile Picture
            </a>
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
              {account.metaData.totalPenalty.toLocaleString(undefined, {
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
              {account.metaData.onlinePendingBooks}
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
              {account.metaData.onlineApprovedBooks}
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
              {account.metaData.onlineCheckedOutBooks +
                account.metaData.walkInCheckedOutBooks}
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
              {account.metaData.onlineReturnedBooks +
                account.metaData.walkInReturnedBooks}
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
              {account.metaData.onlineCancelledBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Cancelled Borrow Request
            </small>
          </Link>
        </div>
        <div className="flex flex-col mt-10 items-center gap-3">
          <div ref={qrRef} className="flex flex-col items-center p-3">
            <QRCode
              value={account?.id ?? "none"}
              style={{ width: "2.0in", height: "2.0in" }}
            />
            <div className="text-center mt-4">
              <h2 className="font-bold">STI Munoz Library Pass</h2>
              <p>
                {user.givenName} {user.surname}
              </p>
            </div>
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
      <UploadProfileModal
        isOpen={isUploadProfileOpen}
        closeModal={closeUploadProfileModal}
      />
    </div>
  );
};
const UploadProfileModal = ({ closeModal, isOpen }: ModalProps) => {
  return (
    <Modal onClose={closeModal} open={isOpen}>
      <div>
        <DashboardComponent hideUploadButton={true} uppy={uppy} />
      </div>
    </Modal>
  );
};

export default ProfilePage;
