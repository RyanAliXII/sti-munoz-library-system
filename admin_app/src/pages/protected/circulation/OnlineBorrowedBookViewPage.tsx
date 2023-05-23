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
import { useSwitch } from "@hooks/useToggle";
import {
  OnlineBorrowStatus,
  OnlineBorrowStatuses,
} from "@internal/borrow-status";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ordinal from "ordinal";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DueDateInputModal from "./DueDateInputModal";
import {
  ApprovedActionsButtons,
  CheckedOutActionsButtons,
  PendingActionsButtons,
} from "./BorrowRequestActions";

const OnlineBorrowBookViewPage = () => {
  const { id } = useParams();
  const { Get, Patch } = useRequest();
  const navigate = useNavigate();
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
  const orgAuthors = book?.authors.organizations?.map((org) => org.name) ?? [];
  const publisherAuthors = book?.authors.publishers.map((p) => p.name) ?? [];
  const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
  if (!borrowedBook) return null;
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Borrow Request</h1>
      </ContainerNoBackground>
      <Container className="flex justify-between px-4 py-6">
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <div>
            <div className="flex gap-5">
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
          <div className="flex flex-col w-2/12 ">
            <span className="font-bold text-gray-600">Due Date</span>
            <span className="text-gray-500 text-sm">
              {borrowedBook?.status === "checked-out" ||
              borrowedBook?.status === "returned"
                ? new Date(borrowedBook?.dueDate ?? "").toLocaleDateString(
                    "default",
                    { month: "long", day: "2-digit", year: "numeric" }
                  )
                : "N/A"}
            </span>
          </div>
          <div className="flex flex-col w-3/12">
            <span className="font-bold text-gray-600">Status</span>
            <span className="text-gray-500 text-sm">
              {borrowedBook?.status}
            </span>
          </div>
        </LoadingBoundary>
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
    </>
  );
};

export default OnlineBorrowBookViewPage;
