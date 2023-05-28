import ProfileIcon from "@components/ProfileIcon";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  ConfirmDialog,
  DangerConfirmDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/configs/s3";
import { OnlineBorrowedBook } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import useToggle, { useSwitch } from "@hooks/useToggle";
import {
  OnlineBorrowStatus,
  OnlineBorrowStatuses,
} from "@internal/borrow-status";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ordinal from "ordinal";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DueDateInputModal from "./DueDateInputModal";
import {
  ApprovedActionsButtons,
  CheckedOutActionsButtons,
  PendingActionsButtons,
} from "./BorrowRequestActions";
import {
  LightOutlineButton,
  PrimaryButton,
  SecondaryButton,
} from "@components/ui/button/Button";
import { AiOutlineEdit, AiOutlineSave } from "react-icons/ai";

const OnlineBorrowBookViewPage = () => {
  const { id } = useParams();
  const { Get, Patch } = useRequest();
  const navigate = useNavigate();

  const { value: isEditMode, toggle: toggleEditMode } = useToggle();
  const fetchBorrowedBook = async () => {
    const { data: response } = await Get(
      `/circulation/online/borrowed-books/${id}`,
      {},
      [apiScope("Checkout.Read")]
    );

    return response?.data?.borrowedBook;
  };
  const {
    data: borrowedBook,
    refetch,
    isError,
    isFetching,
  } = useQuery<OnlineBorrowedBook>({
    queryFn: fetchBorrowedBook,
    queryKey: ["borrowedBook"],
    retry: false,
    onError: () => {
      navigate("/void");
    },
  });

  const {
    isOpen: isDueDateInputModalOpen,
    close: closeInputDueDateModal,
    open: openInputDueDateModal,
  } = useSwitch();
  const {
    isOpen: isApprovalConfirmationDialogOpen,
    close: closeApprovalConfirmationDialog,
    open: openApprovalConfirmationDialog,
  } = useSwitch();

  const {
    isOpen: isCancelConfirmationDialogOpen,
    close: closeCancelConfirmationDialog,
    open: openCancelConfirmationDialog,
  } = useSwitch();
  const {
    isOpen: isRemarkPromptOpen,
    close: closeRemarkPrompt,
    open: openRemarkPrompt,
  } = useSwitch();
  const queryClient = useQueryClient();
  const [selectedBorrowedBook, setSelectedBorrowedBook] =
    useState<OnlineBorrowedBook>();
  const updateBorrowRequest = useMutation({
    mutationFn: (updateBody: {
      id: string;
      status: OnlineBorrowStatus;
      dueDate?: string;
      remarks?: string;
    }) =>
      Patch(
        `/circulation/online/borrowed-books/${updateBody.id}`,
        updateBody,
        {},
        [apiScope("Checkout.Edit")]
      ),
    onSuccess: () => {
      toast.success("Borrow request has been updated.");
      queryClient.invalidateQueries(["borrowedBook"]);
    },
    onError: () => {
      toast.error("Unknown error occured. Please try again later.");
    },
    onSettled: () => {
      closeApprovalConfirmationDialog();
      closeCancelConfirmationDialog();
    },
  });

  const initializeApproval = (borrowedBook: OnlineBorrowedBook) => {
    openApprovalConfirmationDialog();
    setSelectedBorrowedBook(borrowedBook);
  };
  const initializeCancellation = (borrowedBook: OnlineBorrowedBook) => {
    openCancelConfirmationDialog();
    setSelectedBorrowedBook(borrowedBook);
  };

  const onConfirmApproval = () => {
    updateBorrowRequest.mutate({
      id: selectedBorrowedBook?.id ?? "",
      status: OnlineBorrowStatuses.Approved,
    });
  };
  const onConfirmCancel = () => {
    updateBorrowRequest.mutate({
      id: selectedBorrowedBook?.id ?? "",
      status: OnlineBorrowStatuses.Cancelled,
    });
  };

  const initializeCheckout = (borrowedBook: OnlineBorrowedBook) => {
    openInputDueDateModal();
    setSelectedBorrowedBook(borrowedBook);
  };
  const initializeReturn = (borrowedBook: OnlineBorrowedBook) => {
    openRemarkPrompt();
    setSelectedBorrowedBook(borrowedBook);
  };

  const onConfirmReturn = (remarks: string) => {
    closeRemarkPrompt();
    updateBorrowRequest.mutate({
      id: selectedBorrowedBook?.id ?? "",
      status: OnlineBorrowStatuses.Returned,
      remarks: remarks,
    });
  };
  const onConfirmDueDate = (date: string) => {
    closeInputDueDateModal();
    updateBorrowRequest.mutate({
      id: selectedBorrowedBook?.id ?? "",
      status: OnlineBorrowStatuses.CheckedOut,
      dueDate: date,
    });
  };
  const book = borrowedBook?.book;
  let bookCover = "";
  if ((book?.covers?.length ?? 0) > 0) {
    bookCover = buildS3Url(book?.covers?.[0] ?? "");
  }
  const peopleAuthors =
    book?.authors.people?.map(
      (author) => `${author.givenName} ${author.surname}`
    ) ?? [];

  const [remarks, setRemarks] = useState<string>("");
  useEffect(() => {
    setRemarks(borrowedBook?.remarks ?? "");
  }, [borrowedBook]);
  const updateRemarks = () => {
    if (borrowedBook?.status && borrowedBook?.id) {
      updateBorrowRequest.mutate({
        id: borrowedBook.id ?? "",
        status: borrowedBook.status,
        remarks: remarks,
      });
    }

    toggleEditMode();
  };
  const orgAuthors = book?.authors.organizations?.map((org) => org.name) ?? [];
  const publisherAuthors = book?.authors.publishers.map((p) => p.name) ?? [];
  const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
  if (!borrowedBook) return null;
  return (
    <>
      <LoadingBoundary isLoading={isFetching} isError={isError}>
        <ContainerNoBackground>
          <h1 className="text-3xl font-bold text-gray-700">Borrow Request</h1>
        </ContainerNoBackground>
        <Container className="flex flex-col md:flex-row justify-around px-4 py-6">
          <div className="mb-2">
            <div className="flex gap-5  ">
              <div>
                <ProfileIcon
                  givenName={borrowedBook?.client.givenName ?? ""}
                  surname={borrowedBook?.client.surname ?? ""}
                ></ProfileIcon>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-bold">
                  {borrowedBook?.client.displayName}
                </span>
                <small className="text-gray-500">
                  {borrowedBook?.client.email}
                </small>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 mb-1">
            <span className="font-bold text-gray-600 text-sm md:text-base">
              Due Date
            </span>
            <span className="text-gray-500 text-sm md:text-base">
              {borrowedBook?.status === "checked-out" ||
              borrowedBook?.status === "returned"
                ? new Date(borrowedBook?.dueDate ?? "").toLocaleDateString(
                    "default",
                    { month: "long", day: "2-digit", year: "numeric" }
                  )
                : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 mb-1">
            <span className="font-bold  text-gray-600 text-sm md:text-base ">
              Status
            </span>
            <span className="text-gray-500 text-sm md:text-base capitalize">
              {borrowedBook?.status}
            </span>
          </div>
          <div className="grid grid-cols-2 mb-1 md:grid-cols-1">
            <span className="font-bold  text-gray-600 text-sm md:text-base ">
              Penalty
            </span>
            <span className="text-gray-500 text-sm md:text-base">
              PHP{" "}
              {borrowedBook?.penalty.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </Container>
        <Container>
          <div
            className="w-full  md:h-60 lg:h-64  p-4 flex gap-5"
            style={{
              maxWidth: "800px",
            }}
            key={book?.id}
          >
            <div className="flex items-center justify-center">
              {bookCover.length > 0 ? (
                <img
                  src={bookCover}
                  className="w-28 md:w-72 h-40 object-scale-down   rounded"
                ></img>
              ) : (
                <div className="w-28 md:w-72 h-40 bg-gray-200  rounded flex items-center justify-center">
                  <small className="font-bold">NO COVER</small>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-2  ">
              <Link
                to={`/books/edit/${book?.id}`}
                className="text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500"
              >
                {book?.title}
              </Link>
              <p className="text-xs md:text-sm lg:text-base">
                by {authors.join(",")}
              </p>
              <p className="text-xs md:text-sm lg:text-base text-gray-500">
                Published in {book?.yearPublished}
              </p>
              <p className="text-xs md:text-sm lg:text-base text-gray-500">
                {book?.section.name} - {book?.ddc} - {book?.authorNumber} - {""}
                {ordinal(borrowedBook?.copyNumber ?? 0)} Copy - Accession(
                {borrowedBook?.accessionNumber})
              </p>
            </div>
          </div>
        </Container>
        {borrowedBook.status === "returned" && (
          <ContainerNoBackground className="p-2">
            <div className="mb-1">
              <label className="text-sm">Remarks</label>
            </div>
            <textarea
              className="w-full resize-none border h-40 p-2 disabled:pointer-events-none focus:outline-none disabled:opacity-90
          "
              onChange={(e) => {
                setRemarks(e.target.value);
              }}
              value={remarks}
              disabled={!isEditMode}
            ></textarea>
            <div className="flex w-full justify-end gap-2 h-10">
              {!isEditMode && (
                <SecondaryButton
                  className="flex gap-1 items-center"
                  onClick={toggleEditMode}
                >
                  <AiOutlineEdit className="text-lg" />
                  Edit
                </SecondaryButton>
              )}
              {isEditMode && (
                <LightOutlineButton
                  className="flex gap-1 items-center"
                  onClick={toggleEditMode}
                >
                  <AiOutlineEdit className="text-lg" />
                  Cancel
                </LightOutlineButton>
              )}
              <PrimaryButton
                className="flex gap-1 items-center"
                disabled={!isEditMode}
                onClick={updateRemarks}
              >
                <AiOutlineSave className="text-lg" />
                Save
              </PrimaryButton>
            </div>
          </ContainerNoBackground>
        )}
        <ContainerNoBackground>
          {borrowedBook.status === "pending" && (
            <PendingActionsButtons
              borrowedBook={borrowedBook}
              initializeApproval={initializeApproval}
              initializeCancellation={initializeCancellation}
            />
          )}
          {borrowedBook.status === "approved" && (
            <ApprovedActionsButtons
              borrowedBook={borrowedBook}
              initializeCheckout={initializeCheckout}
              initializeCancellation={initializeCancellation}
            />
          )}
          {borrowedBook.status === "checked-out" && (
            <CheckedOutActionsButtons
              borrowedBook={borrowedBook}
              initializeReturn={initializeReturn}
              initializeCancellation={initializeCancellation}
            />
          )}
        </ContainerNoBackground>
        <DueDateInputModal
          closeModal={closeInputDueDateModal}
          isOpen={isDueDateInputModalOpen}
          onConfirmDate={onConfirmDueDate}
        />
        <ConfirmDialog
          title="Approve Borrow Request!"
          text="Are you sure you want to approve borrow request?"
          isOpen={isApprovalConfirmationDialogOpen}
          close={closeApprovalConfirmationDialog}
          onConfirm={onConfirmApproval}
        ></ConfirmDialog>
        <DangerConfirmDialog
          title="Cancel Borrow Request!"
          text="Are you sure you want to cancel borrow request?"
          isOpen={isCancelConfirmationDialogOpen}
          close={closeCancelConfirmationDialog}
          onConfirm={onConfirmCancel}
        ></DangerConfirmDialog>

        <PromptTextAreaDialog
          close={closeRemarkPrompt}
          isOpen={isRemarkPromptOpen}
          label="Remarks"
          proceedBtnText="Save"
          title="Return Remarks"
          placeholder="Eg. Returned with no damage or Damage."
          onProceed={onConfirmReturn}
        ></PromptTextAreaDialog>
      </LoadingBoundary>
    </>
  );
};

export default OnlineBorrowBookViewPage;
