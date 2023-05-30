import ProfileIcon from "@components/ProfileIcon";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import {
  LightOutlineButton,
  PrimaryButton,
  SecondaryButton,
} from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  ConfirmDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/configs/s3";
import { BorrowedCopy, OnlineBorrowedBook } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import useToggle, { useSwitch } from "@hooks/useToggle";
import {
  BorrowStatus,
  OnlineBorrowStatus,
  OnlineBorrowStatuses,
} from "@internal/borrow-status";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ordinal from "ordinal";
import { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { BsFillQuestionDiamondFill } from "react-icons/bs";
import { MdOutlineCancel, MdOutlineKeyboardReturn } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { date } from "yup";

const BorrowBookViewPage = () => {
  const { id, bookId, accessionNumber } = useParams();
  const { Get, Patch } = useRequest();
  const navigate = useNavigate();

  const { value: isEditMode, toggle: toggleEditMode } = useToggle();
  const fetchBorrowedBook = async () => {
    const { data: response } = await Get(
      `/circulation/transactions/${id}/books/${bookId}/accessions/${accessionNumber}`,
      {},
      [apiScope("Checkout.Read")]
    );

    return response?.data?.borrowedCopy;
  };
  const {
    data: borrowedBook,

    isError,
    isFetching,
  } = useQuery<BorrowedCopy>({
    queryFn: fetchBorrowedBook,
    queryKey: ["walkInBorrowedBook"],
    retry: false,
    onError: () => {
      navigate("/void");
    },
  });

  const {
    isOpen: isReturnRemarkPromptOpen,
    close: closeReturnRemarkPrompt,
    open: openReturnRemarkPrompt,
  } = useSwitch();

  const {
    isOpen: isUnreturnedRemarkPrompOpen,
    close: closeUnreturnedRemarkPrompt,
    open: openUnreturnedRemarkPrompt,
  } = useSwitch();
  const onConfirmReturn = (remarks: string) => {
    closeReturnRemarkPrompt();
    updateBorrowRequest.mutate({
      status: "returned",
      remarks: remarks,
    });
  };
  const onConfirmCancel = (remarks: string) => {
    closeCancellationRemarkPrompt();
    updateBorrowRequest.mutate({
      status: "cancelled",
      remarks: remarks,
    });
  };
  const onConfirmUnreturn = (remarks: string) => {
    closeUnreturnedRemarkPrompt();
    updateBorrowRequest.mutate({
      status: "unreturned",
      remarks: remarks,
    });
  };
  const {
    isOpen: isCancellationRemarkPromptOpen,
    close: closeCancellationRemarkPrompt,
    open: openCancellationRemarkPrompt,
  } = useSwitch();
  const queryClient = useQueryClient();
  const [selectedBorrowedBook, setSelectedBorrowedBook] =
    useState<BorrowedCopy>();
  const updateBorrowRequest = useMutation({
    mutationFn: (updateBody: { status: BorrowStatus; remarks?: string }) =>
      Patch(
        `/circulation/transactions/${id}/books/${bookId}/accessions/${accessionNumber}`,
        updateBody,
        {},
        [apiScope("Checkout.Edit")]
      ),
    onSuccess: () => {
      toast.success("Borrow request has been updated.");
      queryClient.invalidateQueries(["walkInBorrowedBook"]);
    },
    onError: () => {
      toast.error("Unknown error occured. Please try again later.");
    },
  });

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
    updateBorrowRequest.mutate({
      status: borrowedBook?.isCancelled
        ? "cancelled"
        : borrowedBook?.isReturned
        ? "returned"
        : "unreturned",
      remarks: remarks,
    });

    toggleEditMode();
  };

  const orgAuthors = book?.authors.organizations?.map((org) => org.name) ?? [];
  const publisherAuthors = book?.authors.publishers.map((p) => p.name) ?? [];
  const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];

  if (!borrowedBook) return null;
  const isTransactionFinished =
    borrowedBook?.isReturned ||
    borrowedBook?.isCancelled ||
    borrowedBook?.isUnreturned;
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
              {new Date(borrowedBook.dueDate).toDateString()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 mb-1">
            <span className="font-bold  text-gray-600 text-sm md:text-base ">
              Status
            </span>
            <span className="text-gray-500 text-sm md:text-base capitalize">
              {borrowedBook?.isCancelled && "Cancelled"}
              {borrowedBook?.isReturned && "Returned"}
              {borrowedBook?.isUnreturned && "Unreturned"}
              {!isTransactionFinished && "Checked Out"}
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
                {borrowedBook?.number})
              </p>
            </div>
          </div>
        </Container>

        {isTransactionFinished && (
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
        {!isTransactionFinished && (
          <ContainerNoBackground>
            <div className="flex gap-2">
              <button
                className="flex  border p-3  rounded  bg-green-600 text-white gap-2 items-center"
                onClick={() => {
                  openReturnRemarkPrompt();
                }}
              >
                <MdOutlineKeyboardReturn
                  className="
                          text-lg"
                />
                Mark as Returned
              </button>
              <button
                className="flex items-center border p-2 gap-2  rounded bg-white text-orange-500 border-orange-500"
                onClick={() => {
                  openUnreturnedRemarkPrompt();
                }}
              >
                <BsFillQuestionDiamondFill
                  className="
                          text-lg"
                />
                Mark as Unreturned
              </button>
              <button
                className="flex border p-3  rounded  bg-red-500 text-white gap-1 items-center"
                onClick={() => {
                  openCancellationRemarkPrompt();
                }}
              >
                <MdOutlineCancel
                  className="
                        text-lg"
                />{" "}
                Cancel
              </button>
            </div>
          </ContainerNoBackground>
        )}

        <PromptTextAreaDialog
          close={closeReturnRemarkPrompt}
          isOpen={isReturnRemarkPromptOpen}
          label="Remarks"
          proceedBtnText="Save"
          title="Return Remarks"
          onProceed={onConfirmReturn}
          placeholder="Eg. Returned with no damage or Damage."
        ></PromptTextAreaDialog>
        <PromptTextAreaDialog
          close={closeCancellationRemarkPrompt}
          isOpen={isCancellationRemarkPromptOpen}
          label="Remarks"
          proceedBtnText="Save"
          title="Cancellation Remarks"
          onProceed={onConfirmCancel}
          placeholder="Eg. Cancellation reason"
        />
        <PromptTextAreaDialog
          close={closeUnreturnedRemarkPrompt}
          isOpen={isUnreturnedRemarkPrompOpen}
          label="Remarks"
          proceedBtnText="Save"
          title="Unreturn Remarks"
          onProceed={onConfirmUnreturn}
          placeholder="Eg. reason for not returning book."
        />
      </LoadingBoundary>
    </>
  );
};

export default BorrowBookViewPage;
