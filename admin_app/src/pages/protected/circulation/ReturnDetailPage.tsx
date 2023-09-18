import ProfileIcon from "@components/ProfileIcon";
import {
  ConfirmDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";

import {
  Thead,
  BodyRow,
  HeadingRow,
  Table,
  Td,
  Tbody,
  Th,
} from "@components/ui/table/Table";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { BorrowedBook } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ButtonClasses } from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";
import { useState } from "react";
import { useRequest } from "@hooks/useRequest";
import { BorrowStatus } from "@internal/borrow-status";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
import {
  BsArrowReturnLeft,
  BsHandThumbsUpFill,
  BsQuestionDiamond,
} from "react-icons/bs";
import { GrDocumentMissing } from "react-icons/gr";
import { buildS3Url } from "@definitions/configs/s3";
import ordinal from "ordinal";
import DueDateInputModal from "./DueDateInputModal";
import { AiFillCheckCircle } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
const TransactionByIdPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { Get, Patch } = useRequest();
  const {
    isOpen: isApprovalConfirmationDialogOpen,
    close: closeApprovalConfirmationDialog,
    open: openApprovalConfirmationDialog,
  } = useSwitch();
  const {
    isOpen: isReturnRemarkPromptOpen,
    close: closeReturnRemarkPrompt,
    open: openReturnRemarkPrompt,
  } = useSwitch();

  const {
    isOpen: isUnreturnedRemarkPromptOpen,
    close: closeUnreturnedRemarkPrompt,
    open: openUnreturnedRemarkPrompt,
  } = useSwitch();

  const {
    isOpen: isCancellationRemarkPromptOpen,
    close: closeCancellationRemarkPrompt,
    open: openCancellationRemarkPrompt,
  } = useSwitch();
  const {
    isOpen: isDueDateInputModalOpen,
    close: closeInputDueDateModal,
    open: openInputDueDateModal,
  } = useSwitch();
  const fetchTransaction = async () => {
    const { data: response } = await Get(`/borrowing/requests/${id}`, {}, [
      apiScope("Checkout.Read"),
    ]);
    return response?.data?.borrowedBooks ?? [];
  };
  const {
    data: borrowedBooks,
    refetch,
    isError,
    isFetching,
  } = useQuery<BorrowedBook[]>({
    queryFn: fetchTransaction,
    queryKey: ["transaction"],
    retry: false,
    onError: (err) => {
      navigate("/void");
    },
  });

  const [selectedBorrowedBookId, setSelectedBorrowedBookId] =
    useState<string>("");
  const onConfirmReturn = (remarks: string) => {
    closeReturnRemarkPrompt();
    updateStatus.mutate({
      status: BorrowStatus.Returned,
      remarks: remarks,
    });
  };

  const onConfirmDueDate = (date: string) => {
    closeInputDueDateModal();
    updateStatus.mutate({
      status: BorrowStatus.CheckedOut,
      remarks: "",
      dueDate: date,
    });
  };

  const onConfirmCancel = (remarks: string) => {
    closeCancellationRemarkPrompt();
    updateStatus.mutate({
      status: BorrowStatus.Cancelled,
      remarks: remarks,
    });
  };
  const onConfirmApproval = () => {
    closeApprovalConfirmationDialog();
    updateStatus.mutate({
      status: BorrowStatus.Approved,
      remarks: "",
    });
  };
  const onConfirmUnreturn = (remarks: string) => {
    closeUnreturnedRemarkPrompt();
    updateStatus.mutate({
      status: BorrowStatus.Unreturned,
      remarks: remarks,
    });
  };

  const updateStatus = useMutation({
    mutationFn: (body: {
      status: BorrowStatus;
      remarks: string;
      dueDate?: string;
    }) =>
      Patch(
        `/borrowing/borrowed-books/${selectedBorrowedBookId}/status`,
        {
          remarks: body.remarks,
          dueDate: body?.dueDate ?? "",
        },
        {
          params: {
            statusId: body.status,
          },
        },
        [apiScope("Checkout.Edit")]
      ),
    onSuccess: () => {
      toast.success("Borrowed book has been updated.");
      refetch();
    },
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
  });

  const client = borrowedBooks?.[0]?.client ?? {
    displayName: "",
    email: "",
    givenName: "",
    surname: "",
  };
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Borrowed Book</h1>
      </ContainerNoBackground>
      <Container className="flex px-4 py-6">
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <div>
            <div className="flex gap-5">
              <div>
                <ProfileIcon
                  givenName={client.givenName ?? ""}
                  surname={client.surname ?? ""}
                ></ProfileIcon>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-bold">
                  {client.displayName}
                </span>
                <small className="text-gray-500">{client.email}</small>
              </div>
            </div>
          </div>
        </LoadingBoundary>
      </Container>
      <ContainerNoBackground className="px-4 py-6">
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <Divider
            heading="h2"
            headingProps={{
              className: "text-xl",
            }}
            hrProps={{
              className: "mb-5",
            }}
          >
            Borrowed Books
          </Divider>
          <Container className="mx-0 lg:w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Title</Th>
                  <Th>Created At</Th>
                  <Th>Due Date</Th>
                  <Th>Copy number</Th>
                  <Th>Accession number</Th>
                  <Th>Status</Th>
                  <Th>Penalty</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {borrowedBooks?.map((borrowedBook) => {
                  return (
                    <BodyRow key={borrowedBook.id}>
                      <Td className="font-bold flex items-center gap-2">
                        {borrowedBook.book.covers?.[0] ? (
                          <img
                            className="rounded"
                            width={"40px"}
                            height={"40px"}
                            src={
                              buildS3Url(borrowedBook.book.covers?.[0]) ?? ""
                            }
                          />
                        ) : (
                          <div
                            className="bg-gray-200 rounded"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          ></div>
                        )}
                        {borrowedBook.book.title}
                      </Td>
                      <Td>{new Date(borrowedBook.createdAt).toDateString()}</Td>
                      <Td>
                        {borrowedBook.dueDate === ""
                          ? "No due date"
                          : new Date(borrowedBook.dueDate).toDateString()}
                      </Td>
                      <Td>{ordinal(borrowedBook.copyNumber)}</Td>
                      <Td>{borrowedBook.accessionNumber}</Td>

                      <Td>{borrowedBook.status}</Td>
                      <Td className="text-red-500">
                        PHP{" "}
                        {borrowedBook.penalty.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </Td>

                      <Td>
                        <div className="flex gap-2">
                          {borrowedBook.statusId ===
                            BorrowStatus.CheckedOut && (
                            <Tippy content="Mark borrowed book as returned.">
                              <button
                                className={
                                  ButtonClasses.PrimaryOutlineButtonClasslist
                                }
                                onClick={() => {
                                  setSelectedBorrowedBookId(borrowedBook.id);
                                  openReturnRemarkPrompt();
                                }}
                              >
                                <BsArrowReturnLeft />
                              </button>
                            </Tippy>
                          )}
                          {borrowedBook.statusId === BorrowStatus.Pending && (
                            <Tippy content="Approve borrowing request.">
                              <button
                                className={
                                  ButtonClasses.PrimaryOutlineButtonClasslist
                                }
                                onClick={() => {
                                  setSelectedBorrowedBookId(borrowedBook.id);
                                  openApprovalConfirmationDialog();
                                }}
                              >
                                <BsHandThumbsUpFill />
                              </button>
                            </Tippy>
                          )}
                          {borrowedBook.statusId === BorrowStatus.Approved && (
                            <Tippy content="Approve borrowing request.">
                              <button
                                className={
                                  ButtonClasses.PrimaryOutlineButtonClasslist
                                }
                                onClick={() => {
                                  setSelectedBorrowedBookId(borrowedBook.id);
                                  openInputDueDateModal();
                                }}
                              >
                                <AiFillCheckCircle />
                              </button>
                            </Tippy>
                          )}
                          {borrowedBook.statusId ===
                            BorrowStatus.CheckedOut && (
                            <Tippy content="Mark borrowed book as unreturned.">
                              <button
                                className={
                                  ButtonClasses.WarningButtonOutlineClasslist
                                }
                                onClick={() => {
                                  setSelectedBorrowedBookId(borrowedBook.id);
                                  openUnreturnedRemarkPrompt();
                                }}
                              >
                                <BsQuestionDiamond />
                              </button>
                            </Tippy>
                          )}
                          {(borrowedBook.statusId === BorrowStatus.Pending ||
                            borrowedBook.statusId === BorrowStatus.Approved ||
                            borrowedBook.statusId ===
                              BorrowStatus.CheckedOut) && (
                            <Tippy content="Cancel Request">
                              <button
                                className={
                                  ButtonClasses.DangerButtonOutlineClasslist
                                }
                                onClick={() => {
                                  setSelectedBorrowedBookId(borrowedBook.id);
                                  openCancellationRemarkPrompt();
                                }}
                              >
                                <MdOutlineCancel />
                              </button>
                            </Tippy>
                          )}
                        </div>
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </Container>
        </LoadingBoundary>
      </ContainerNoBackground>
      <PromptTextAreaDialog
        key={"forReturn"}
        close={closeReturnRemarkPrompt}
        isOpen={isReturnRemarkPromptOpen}
        label="Remarks"
        proceedBtnText="Save"
        title="Return Remarks"
        placeholder="Eg. Returned with no damage or Damage."
        onProceed={onConfirmReturn}
      />

      <PromptTextAreaDialog
        key={"forCancellation"}
        close={closeCancellationRemarkPrompt}
        isOpen={isCancellationRemarkPromptOpen}
        label="Remarks"
        proceedBtnText="Save"
        title="Cancellation Remarks"
        placeholder="Eg. Cancellation reason"
        onProceed={onConfirmCancel}
      />
      <DueDateInputModal
        closeModal={closeInputDueDateModal}
        isOpen={isDueDateInputModalOpen}
        onConfirmDate={onConfirmDueDate}
      />
      <ConfirmDialog
        key={"forApproval"}
        title="Approve Borrow Request!"
        text="Are you sure you want to approve borrow request?"
        isOpen={isApprovalConfirmationDialogOpen}
        close={closeApprovalConfirmationDialog}
        onConfirm={onConfirmApproval}
      ></ConfirmDialog>
      <PromptTextAreaDialog
        key={"forUnreturn"}
        close={closeUnreturnedRemarkPrompt}
        isOpen={isUnreturnedRemarkPromptOpen}
        label="Remarks"
        proceedBtnText="Save"
        title="Unreturn Remarks"
        placeholder="Eg. reason for not returning book."
        onProceed={onConfirmUnreturn}
      />
    </>
  );
};

export default TransactionByIdPage;
