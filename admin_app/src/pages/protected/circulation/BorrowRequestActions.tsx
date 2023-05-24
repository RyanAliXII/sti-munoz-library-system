import { ButtonClasses } from "@components/ui/button/Button";
import { Td } from "@components/ui/table/Table";
import { OnlineBorrowedBook } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { AiFillCheckCircle, AiOutlineEye } from "react-icons/ai";
import { FaHandHolding } from "react-icons/fa";
import { MdOutlineCancel, MdOutlineKeyboardReturn } from "react-icons/md";
import { Link } from "react-router-dom";

type ActionsProps = {
  borrowedBook: OnlineBorrowedBook;
};
interface PendingActionsProps extends ActionsProps {
  initializeApproval: (ob: OnlineBorrowedBook) => void;
  initializeCancellation: (ob: OnlineBorrowedBook) => void;
}

interface ApproveActionProps extends ActionsProps {
  initializeCheckout: (ob: OnlineBorrowedBook) => void;
  initializeCancellation: (ob: OnlineBorrowedBook) => void;
}
interface CheckedOutActionProps extends ActionsProps {
  initializeReturn: (ob: OnlineBorrowedBook) => void;
  initializeCancellation: (ob: OnlineBorrowedBook) => void;
}
export const PendingActions: React.FC<PendingActionsProps> = ({
  initializeApproval,
  borrowedBook,
  initializeCancellation,
}) => {
  return (
    <Td className="flex gap-2">
      <Tippy content="View Request">
        <Link
          to={`/circulation/online-borrowed-books/${borrowedBook.id}`}
          className={
            ButtonClasses.PrimaryOutlineButtonClasslist +
            " flex items-center gap-2 "
          }
        >
          <AiOutlineEye
            className="
                        text-lg"
          />
        </Link>
      </Tippy>
      <Tippy content="Approve Borrow Request">
        <button
          className="flex items-center border p-2  rounded bg-white text-green-600 border-green-600"
          onClick={() => {
            initializeApproval(borrowedBook);
          }}
        >
          <AiFillCheckCircle
            className="
                        text-lg"
          />
        </button>
      </Tippy>
      <Tippy content="Cancel Borrow Request ">
        <button
          className="flex items-center border p-2  rounded bg-white text-red-500 border-red-500"
          onClick={() => {
            initializeCancellation(borrowedBook);
          }}
        >
          <MdOutlineCancel
            className="
                        text-lg"
          />
        </button>
      </Tippy>
    </Td>
  );
};

export const ApprovedActions: React.FC<ApproveActionProps> = ({
  initializeCheckout,
  borrowedBook,
  initializeCancellation,
}) => {
  return (
    <Td className="flex gap-2">
      <Tippy content="View Request">
        <Link
          to={`/circulation/online-borrowed-books/${borrowedBook.id}`}
          className={
            ButtonClasses.PrimaryOutlineButtonClasslist +
            " flex items-center gap-2 "
          }
        >
          <AiOutlineEye
            className="
                        text-lg"
          />
        </Link>
      </Tippy>
      <Tippy content="Checkout Book">
        <button
          className="flex items-center border p-2  rounded bg-white text-green-600 border-green-600"
          onClick={() => {
            initializeCheckout(borrowedBook);
          }}
        >
          <FaHandHolding
            className="
                          text-lg"
          />
        </button>
      </Tippy>
      <Tippy content="Cancel Borrow Request ">
        <button
          className="flex items-center border p-2  rounded bg-white text-red-500 border-red-500"
          onClick={() => {
            initializeCancellation(borrowedBook);
          }}
        >
          <MdOutlineCancel
            className="
                          text-lg"
          />
        </button>
      </Tippy>
    </Td>
  );
};

export const CheckedOutActions: React.FC<CheckedOutActionProps> = ({
  borrowedBook,
  initializeCancellation,
  initializeReturn,
}) => {
  return (
    <Td className="flex gap-2">
      <Tippy content="View Request">
        <Link
          to={`/circulation/online-borrowed-books/${borrowedBook.id}`}
          className={
            ButtonClasses.PrimaryOutlineButtonClasslist +
            " flex items-center gap-2 "
          }
        >
          <AiOutlineEye
            className="
                        text-lg"
          />
        </Link>
      </Tippy>

      <Tippy content="Mark Book as Returned">
        <button
          className="flex items-center border p-2  rounded bg-white text-green-600 border-green-600"
          onClick={() => {
            initializeReturn(borrowedBook);
          }}
        >
          <MdOutlineKeyboardReturn
            className="
                          text-lg"
          />
        </button>
      </Tippy>
      <Tippy content="Cancel Borrow Request">
        <button
          className="flex items-center border p-2  rounded bg-white text-red-500 border-red-500"
          onClick={() => {
            initializeCancellation(borrowedBook);
          }}
        >
          <MdOutlineCancel
            className="
                          text-lg"
          />
        </button>
      </Tippy>
    </Td>
  );
};

export const ReturnedCancelledActions: React.FC<ActionsProps> = ({
  borrowedBook,
}) => {
  return (
    <Td className="flex gap-2">
      <Tippy content="View Request">
        <Link
          to={`/circulation/online-borrowed-books/${borrowedBook.id}`}
          className={
            ButtonClasses.PrimaryOutlineButtonClasslist +
            " flex items-center gap-2 "
          }
        >
          <AiOutlineEye
            className="
                        text-lg"
          />
        </Link>
      </Tippy>
    </Td>
  );
};

export const PendingActionsButtons: React.FC<PendingActionsProps> = ({
  initializeApproval,
  borrowedBook,
  initializeCancellation,
}) => {
  return (
    <div className="flex gap-2">
      <button
        className="flex items-center border p-3  rounded  bg-green-600 text-white gap-2"
        onClick={() => {
          initializeApproval(borrowedBook);
        }}
      >
        <AiFillCheckCircle
          className="
                        text-lg"
        />
        Approve Borrow Request
      </button>

      <button
        className="flex items-center border p-3  rounded  bg-red-500 text-white gap-1"
        onClick={() => {
          initializeCancellation(borrowedBook);
        }}
      >
        <MdOutlineCancel
          className="
                        text-lg"
        />{" "}
        Cancel
      </button>
    </div>
  );
};

export const ApprovedActionsButtons: React.FC<ApproveActionProps> = ({
  borrowedBook,
  initializeCancellation,
  initializeCheckout,
}) => {
  return (
    <div className="flex gap-2">
      <button
        className="flex  border p-3  rounded  bg-green-600 text-white gap-2 items-center"
        onClick={() => {
          initializeCheckout(borrowedBook);
        }}
      >
        <FaHandHolding
          className="
                          text-lg"
        />
        Mark as Checked Out
      </button>

      <button
        className="flex border p-3  rounded  bg-red-500 text-white gap-1 items-center"
        onClick={() => {
          initializeCancellation(borrowedBook);
        }}
      >
        <MdOutlineCancel
          className="
                        text-lg"
        />{" "}
        Cancel
      </button>
    </div>
  );
};

export const CheckedOutActionsButtons: React.FC<CheckedOutActionProps> = ({
  borrowedBook,
  initializeCancellation,
  initializeReturn,
}) => {
  return (
    <div className="flex gap-2">
      <button
        className="flex  border p-3  rounded  bg-green-600 text-white gap-2 items-center"
        onClick={() => {
          initializeReturn(borrowedBook);
        }}
      >
        <MdOutlineKeyboardReturn
          className="
                          text-lg"
        />
        Mark as Returned
      </button>

      <button
        className="flex border p-3  rounded  bg-red-500 text-white gap-1 items-center"
        onClick={() => {
          initializeCancellation(borrowedBook);
        }}
      >
        <MdOutlineCancel
          className="
                        text-lg"
        />{" "}
        Cancel
      </button>
    </div>
  );
};
