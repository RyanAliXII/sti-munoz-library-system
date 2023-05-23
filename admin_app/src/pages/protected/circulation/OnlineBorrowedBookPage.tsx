import {
  Thead,
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
} from "@components/ui/table/Table";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BorrowingTransaction, OnlineBorrowedBook } from "@definitions/types";
import TimeAgo from "timeago-react";
import { useNavigate } from "react-router-dom";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";
import {
  BorrowStatuses,
  OnlineBorrowStatus,
  OnlineBorrowStatuses,
  STATUSES_OPTIONS,
} from "@internal/borrow-status";
import { apiScope } from "@definitions/configs/msal/scopes";
import { useState } from "react";

import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { Input } from "@components/ui/form/Input";
import CustomSelect from "@components/ui/form/CustomSelect";

import DueDateInputModal from "./DueDateInputModal";
import { useSwitch } from "@hooks/useToggle";
import {
  ConfirmDialog,
  DangerConfirmDialog,
} from "@components/ui/dialog/Dialog";
import { toast } from "react-toastify";
import {
  ApprovedActions,
  CheckedOutActions,
  PendingActions,
} from "./BorrowRequestActions";
import LoadingBoundary from "@components/loader/LoadingBoundary";

const OnlineBorrowedBookPage = () => {
  const { Get, Patch } = useRequest();
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
  const [statusFiter, setStatusFilter] = useState<OnlineBorrowStatus | "all">(
    "all"
  );
  const fetchBorrowedBooks = async (status: OnlineBorrowStatus | "all") => {
    try {
      const { data: response } = await Get(
        "/circulation/online/borrowed-books",
        {
          params: {
            status: status,
          },
        },
        [apiScope("Checkout.Read")]
      );
      return response?.data?.borrowedBooks ?? [];
    } catch {
      return [];
    }
  };

  const [selectedBorrowedBook, setSelectedBorrowedBook] =
    useState<OnlineBorrowedBook>();
  const {
    data: borrowedBooks,
    isFetching,
    isError,
  } = useQuery<OnlineBorrowedBook[]>({
    queryFn: () => fetchBorrowedBooks(statusFiter),
    queryKey: ["onlineBorrowRequests", statusFiter],
  });
  const queryClient = useQueryClient();
  const updateBorrowRequest = useMutation({
    mutationFn: (updateBody: {
      id: string;
      status: OnlineBorrowStatus;
      dueDate?: string;
    }) =>
      Patch(
        `/circulation/online/borrowed-books/${updateBody.id}`,
        updateBody,
        {},
        [apiScope("Checkout.Edit")]
      ),
    onSuccess: () => {
      toast.success("Borrow request has been updated.");
      queryClient.invalidateQueries(["onlineBorrowRequests"]);
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
  const initializeReturn = (borrowedBooks: OnlineBorrowedBook) => {};
  const onConfirmDueDate = (date: string) => {
    updateBorrowRequest.mutate({
      id: selectedBorrowedBook?.id ?? "",
      status: OnlineBorrowStatuses.CheckedOut,
      dueDate: date,
    });
  };

  return (
    <>
      <ContainerNoBackground className="flex gap-2 justify-between px-0 mb-0 lg:mb-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-700">
            Online Borrowed Books
          </h1>
        </div>
        <div className="gap-2 items-center lg:basis-9/12 lg:flex">
          <div className="w-5/12 hidden lg:block">
            <Input type="text" label="Search" placeholder="Search..."></Input>
          </div>
          <div className="hidden lg:block">
            <CustomDatePicker
              label="Borrowed Date"
              wrapperclass="flex flex-col"
              selected={new Date()}
              onChange={() => {}}
              showYearPicker
              dateFormat="yyyy"
              yearItemNumber={9}
            />
          </div>
          <div className="w-3/12 hidden lg:block mb-4 ">
            <CustomSelect
              label="Status"
              onChange={(option) => {
                setStatusFilter((option?.value ?? "all") as OnlineBorrowStatus);
              }}
              options={STATUSES_OPTIONS}
            />
          </div>
          <div className="w-32 mt-1"></div>
        </div>
      </ContainerNoBackground>
      <LoadingBoundary isLoading={isFetching} isError={isError}>
        <Container>
          <div className="overflow-auto">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Client</Th>
                  <Th>Borrowed Book</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {borrowedBooks?.map((bb) => {
                  const book = bb.book;
                  return (
                    <BodyRow key={bb.accessionId}>
                      <Td className="font-bold">{bb.client.displayName}</Td>
                      <Td className="font-bold">{book.title}</Td>

                      <Td>
                        {bb.status === "checked-out"
                          ? new Date(bb.dueDate ?? "").toLocaleDateString()
                          : "Due date not set."}
                      </Td>

                      <Td>{bb.status}</Td>
                      {bb.status === "pending" && (
                        <PendingActions
                          borrowedBook={bb}
                          initializeCancellation={initializeCancellation}
                          initializeApproval={initializeApproval}
                        />
                      )}
                      {bb.status === "approved" && (
                        <ApprovedActions
                          borrowedBook={bb}
                          initializeCancellation={initializeCancellation}
                          initializeCheckout={initializeCheckout}
                        />
                      )}
                      {bb.status === "checked-out" && (
                        <CheckedOutActions
                          initializeReturn={initializeReturn}
                          borrowedBook={bb}
                          initializeCancellation={initializeCancellation}
                        />
                      )}
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </Container>
      </LoadingBoundary>
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
    </>
  );
};

export default OnlineBorrowedBookPage;
