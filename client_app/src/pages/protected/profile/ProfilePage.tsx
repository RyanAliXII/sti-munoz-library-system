import { useMsal } from "@azure/msal-react";
import Loader from "@components/Loader";
import { PrimaryButton } from "@components/ui/button/Button";
import { useAuthContext } from "@contexts/AuthContext";
import { BASE_URL_V1 } from "@definitions/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/s3";
import { Account, ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import "@uppy/core/dist/style.min.css";
import Dashboard from "@uppy/dashboard";
import "@uppy/dashboard/dist/style.min.css";
import { Dashboard as DashboardComponent } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import html2canvas from "html2canvas";
import { FormEvent, useRef } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { BsArrowReturnLeft } from "react-icons/bs";
import { CiCircleRemove } from "react-icons/ci";
import { FaHandHolding, FaMoneyBill } from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";
import QRCode from "react-qr-code";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".webp", ".jpg"],
    maxNumberOfFiles: 1,
  },
})
  .use(Dashboard)
  .use(XHRUpload, {
    headers: {
      Authorization: `Bearer`,
    },
    method: "PUT",
    fieldName: "image",
    endpoint: `${BASE_URL_V1}/accounts/bulk`,
  });

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
  const avatarUrl = `https://ui-avatars.com/api/?name=${account.givenName}${account.surname}&background=2563EB&color=fff`;
  const profilePicUrl =
    account.profilePicture.length > 0
      ? buildS3Url(account.profilePicture)
      : avatarUrl;
  return (
    <div className="lg:w-8/12 mx-auto">
      <div className="mt-10 p-5">
        <img
          src={profilePicUrl}
          className="h-36 w-36  border rounded-full bg-black left-5"
          style={{ bottom: "-55px" }}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = avatarUrl;
          }}
        />
      </div>
      <div className="flex justify-between flex-col w-full px-9 ">
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
              {account.metadata.totalPenalty.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="text-xs lg:text-sm">Total Penalty</small>
          </Link>
          <Link
            to={"/borrowed-books?status_id=1"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-gray-400 gap-2"
          >
            <MdOutlinePending className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.pendingBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Pending Borrow Request
            </small>
          </Link>

          <Link
            to={"/borrowed-books?status_id=2"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-yellow-500 gap-2"
          >
            <AiFillCheckCircle className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.approvedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Approved Borrow Request
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status_id=3"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-success gap-2"
          >
            <FaHandHolding className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.checkedOutBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Checked-Out Books
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status_id=4"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-gray-500 gap-3"
          >
            <BsArrowReturnLeft className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.returnedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Returned Books
            </small>
          </Link>
          <Link
            to={"/borrowed-books?status_id=5"}
            className="w-full flex flex-col items-center justify-center py-4 p-1 h-32 rounded shadow text-orange-500 gap-3"
          >
            <CiCircleRemove className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.cancelledBooks}
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
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();
  const { user } = useAuthContext();
  if (!isOpen) return null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const response = await msalInstance.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });
    uppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${response.accessToken}`,
      },
      endpoint: `${BASE_URL_V1}/accounts/${user.id}/profile-pictures`,
    });
    await uppy.upload();
    uppy.cancelAll();
    closeModal();
    toast.success("Profile picture updated.");
    queryClient.invalidateQueries(["profileAccount"]);
  };
  return (
    <Modal
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-8/12 lg:w-5/12 rounded" }}
      center
    >
      <div>
        <h2 className="text-2xl mb-1">Attach Image</h2>
        <hr></hr>
        <form onSubmit={onSubmit}>
          <DashboardComponent
            className="mt-5"
            hideUploadButton={true}
            uppy={uppy}
            height={"200px"}
          />
          <PrimaryButton className="mt-2"> Save</PrimaryButton>
        </form>
      </div>
    </Modal>
  );
};

export default ProfilePage;
