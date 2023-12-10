import {
  ConfirmDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";

import Container from "@components/ui/container/Container";

import LoadingBoundary from "@components/loader/LoadingBoundary";
import { ButtonClasses } from "@components/ui/button/Button";
import { Book, BorrowedBook } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { BorrowStatus } from "@internal/borrow-status";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import TableContainer from "@components/ui/table/TableContainer";
import { buildS3Url } from "@definitions/configs/s3";
import Tippy from "@tippyjs/react";
import { Avatar, Button, Table } from "flowbite-react";
import ordinal from "ordinal";
import { AiOutlineEdit } from "react-icons/ai";
import EditDueDateModal from "./EditDueDateModal";
import EditRemarksModal from "./EditRemarksModal";
import HasAccess from "@components/auth/HasAccess";
const BorrowedBooksViewPage = () => {
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
    isOpen: isEditDueDatetModalOpen,
    close: closeEditDueDateModal,
    open: openEditDueDateModal,
  } = useSwitch();

  const {
    isOpen: isEditRemarksModalOpen,
    close: closeEditRemarksModal,
    open: openEditRemarksModal,
  } = useSwitch();
  const fetchTransaction = async () => {
    const { data: response } = await Get(`/borrowing/requests/${id}`, {});
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

  const [selectedBorrowedBook, setSelectedBorrowedBook] = useState<
    Book | undefined
  >();
  const [dueDate, setDuedate] = useState("");
  const [borrowedBook, setBorrowedBook] = useState<BorrowedBook | undefined>();
  const [borrowedBookId, setBorrowedBookId] = useState("");
  const onConfirmReturn = (remarks: string) => {
    closeReturnRemarkPrompt();
    updateStatus.mutate({
      status: BorrowStatus.Returned,
      remarks: remarks,
    });
  };

  const onConfirmDueDate = ({ date }: { date: string }) => {
    closeEditDueDateModal();
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
        `/borrowing/borrowed-books/${borrowedBookId}/status`,
        {
          remarks: body.remarks,
          dueDate: body?.dueDate ?? "",
        },
        {
          params: {
            statusId: body.status,
          },
        }
      ),
    onSuccess: () => {
      toast.success("Borrowed book has been updated.");
      refetch();
    },
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
  });

  const updateRemarks = useMutation({
    mutationFn: (body: { remarks: string }) =>
      Patch(`/borrowing/borrowed-books/${borrowedBookId}/remarks`, body),
    onSuccess: () => {
      toast.success("Borrowed book has been updated.");
      refetch();
    },
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
    onSettled: () => {
      closeEditRemarksModal();
    },
  });
  const client = borrowedBooks?.[0]?.client ?? {
    displayName: "",
    email: "",
    givenName: "",
    surname: "",
  };
  const url = new URL(
    "https://ui-avatars.com/api/&background=2563EB&color=fff"
  );
  url.searchParams.set("name", `${client.givenName} ${client.surname}`);
  return (
    <>
      <Container className="px-4 py-6">
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <div className="py-4 px-2 mb-2 border rounded-lg dark:border-gray-700">
            <div className="flex gap-5">
              <div>
                <Avatar img={url.toString()} rounded></Avatar>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-bold dark:text-gray-50">
                  {client.displayName}
                </span>
                <small className="text-gray-300">{client.email}</small>
              </div>
            </div>
          </div>

          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Due Date</Table.HeadCell>
                <Table.HeadCell>Copy number</Table.HeadCell>
                <Table.HeadCell>Accession number</Table.HeadCell>
                <Table.HeadCell>Book Type</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Penalty</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {borrowedBooks?.map((borrowedBook) => {
                  return (
                    <Table.Row key={borrowedBook.id}>
                      <Table.Cell>
                        {new Date(borrowedBook.createdAt).toDateString()}
                      </Table.Cell>
                      <Table.Cell className="font-bold flex items-center gap-2">
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
                      </Table.Cell>

                      <Table.Cell>
                        {borrowedBook.dueDate === ""
                          ? "No due date"
                          : new Date(borrowedBook.dueDate).toDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        {borrowedBook.copyNumber === 0
                          ? "N/A"
                          : ordinal(borrowedBook.copyNumber)}
                      </Table.Cell>
                      <Table.Cell>
                        {borrowedBook.accessionNumber === 0
                          ? "N/A"
                          : borrowedBook.accessionNumber}
                      </Table.Cell>
                      <Table.Cell>
                        {borrowedBook.isEbook ? "eBook" : "Physical Book"}
                      </Table.Cell>
                      <Table.Cell>{borrowedBook.status}</Table.Cell>
                      <Table.Cell>
                        {borrowedBook.isEbook ? (
                          "N/A"
                        ) : (
                          <span className="text-red-400">
                            PHP {""}
                            {borrowedBook.penalty.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <HasAccess requiredPermissions={["BorrowedBook.Edit"]}>
                          <div className="flex gap-2">
                            {borrowedBook.statusId ===
                              BorrowStatus.CheckedOut &&
                              !borrowedBook.isEbook && (
                                <Tippy
                                  content="Mark borrowed book as returned."
                                  key={"return"}
                                >
                                  <Button
                                    color="success"
                                    onClick={() => {
                                      setSelectedBorrowedBook(
                                        borrowedBook.book
                                      );
                                      setBorrowedBookId(borrowedBook.id ?? "");
                                      openReturnRemarkPrompt();
                                    }}
                                  >
                                    Return
                                  </Button>
                                </Tippy>
                              )}
                            {borrowedBook.statusId === BorrowStatus.Pending && (
                              <Tippy
                                content="Mark book as for pick-up."
                                key={"approve"}
                              >
                                <Button
                                  color="primary"
                                  onClick={() => {
                                    setSelectedBorrowedBook(borrowedBook.book);
                                    setBorrowedBookId(borrowedBook.id ?? "");
                                    openApprovalConfirmationDialog();
                                  }}
                                >
                                  For pick-up
                                </Button>
                              </Tippy>
                            )}
                            {borrowedBook.statusId ===
                              BorrowStatus.Approved && (
                              <Tippy content="Checkout book.">
                                <Button
                                  color="primary"
                                  onClick={() => {
                                    setSelectedBorrowedBook(borrowedBook.book);
                                    setBorrowedBookId(borrowedBook.id ?? "");
                                    openEditDueDateModal();
                                  }}
                                >
                                  Check out
                                </Button>
                              </Tippy>
                            )}

                            {borrowedBook.statusId ===
                              BorrowStatus.CheckedOut && (
                              <Tippy content="Edit due date.">
                                <Button
                                  color="primary"
                                  onClick={() => {
                                    setSelectedBorrowedBook(borrowedBook.book);
                                    setBorrowedBook(borrowedBook);
                                    setBorrowedBookId(borrowedBook.id ?? "");
                                    openEditDueDateModal();
                                  }}
                                >
                                  Edit
                                </Button>
                              </Tippy>
                            )}

                            {borrowedBook.statusId ===
                              BorrowStatus.CheckedOut &&
                              !borrowedBook.isEbook && (
                                <Tippy content="Mark borrowed book as unreturned.">
                                  <Button
                                    color="warning"
                                    onClick={() => {
                                      setSelectedBorrowedBook(
                                        borrowedBook.book
                                      );
                                      setBorrowedBookId(borrowedBook.id ?? "");
                                      openUnreturnedRemarkPrompt();
                                    }}
                                  >
                                    Unreturn
                                  </Button>
                                </Tippy>
                              )}
                            {(borrowedBook.statusId === BorrowStatus.Pending ||
                              borrowedBook.statusId === BorrowStatus.Approved ||
                              borrowedBook.statusId ===
                                BorrowStatus.CheckedOut) && (
                              <Tippy content="Cancel Request">
                                <Button
                                  color="failure"
                                  onClick={() => {
                                    setSelectedBorrowedBook(borrowedBook.book);
                                    setBorrowedBookId(borrowedBook.id ?? "");
                                    openCancellationRemarkPrompt();
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Tippy>
                            )}

                            {(borrowedBook.statusId === BorrowStatus.Returned ||
                              borrowedBook.statusId ===
                                BorrowStatus.Cancelled ||
                              borrowedBook.statusId ===
                                BorrowStatus.Unreturned) &&
                              !borrowedBook.isEbook && (
                                <Tippy content="Edit Remarks">
                                  <button
                                    className={
                                      ButtonClasses.PrimaryOutlineButtonClasslist
                                    }
                                    onClick={() => {
                                      setSelectedBorrowedBook(
                                        borrowedBook.book
                                      );
                                      setBorrowedBookId(borrowedBook.id ?? "");
                                      setBorrowedBook(borrowedBook);
                                      openEditRemarksModal();
                                    }}
                                  >
                                    <AiOutlineEdit />
                                  </button>
                                </Tippy>
                              )}
                          </div>
                        </HasAccess>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
        </LoadingBoundary>
      </Container>
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

      <EditDueDateModal
        borrowedBook={borrowedBook}
        onConfirmDate={onConfirmDueDate}
        key={"editDueDate"}
        isOpen={isEditDueDatetModalOpen}
        closeModal={closeEditDueDateModal}
      />
      <EditRemarksModal
        isOpen={isEditRemarksModalOpen}
        closeModal={closeEditRemarksModal}
        borrowedBook={borrowedBook}
        onConfirm={(data) => {
          updateRemarks.mutate(data);
        }}
        key={"forEditRemarks"}
      />
      <ConfirmDialog
        key={"forApproval"}
        title="Mark book for pick-up"
        text="Are you sure you want to mark the book for pick-up?"
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

export default BorrowedBooksViewPage;
