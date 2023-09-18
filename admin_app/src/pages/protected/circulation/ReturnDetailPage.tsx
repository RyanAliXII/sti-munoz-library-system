import ProfileIcon from "@components/ProfileIcon";
import { PromptTextAreaDialog } from "@components/ui/dialog/Dialog";

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

import {
  BorrowedBook,
  BorrowedCopy,
  BorrowingTransaction,
} from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ButtonClasses } from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";
import { useState } from "react";
import {
  BorrowedCopyInitialValue,
  BorrowingTransactionInitialValue,
} from "@definitions/defaults";
import { useRequest } from "@hooks/useRequest";
import { BorrowStatus } from "@internal/borrow-status";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
import { AiOutlineEye } from "react-icons/ai";
import { BsFillQuestionDiamondFill } from "react-icons/bs";
import { MdOutlineCancel, MdOutlineKeyboardReturn } from "react-icons/md";
import { buildS3Url } from "@definitions/configs/s3";
import ordinal from "ordinal";
const TransactionByIdPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { Get, Patch } = useRequest();

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

  const {
    isOpen: isCancellationRemarkPromptOpen,
    close: closeCancellationRemarkPrompt,
    open: openCancellationRemarkPrompt,
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

  const [selectedCopy, setSelectedCopy] = useState<BorrowedCopy>(
    BorrowedCopyInitialValue
  );
  const onConfirmReturn = (remarks: string) => {
    closeReturnRemarkPrompt();
    updateStatus.mutate({
      status: "returned",
      remarks: remarks,
    });
  };
  const onConfirmCancel = (remarks: string) => {
    closeCancellationRemarkPrompt();
    updateStatus.mutate({
      status: "cancelled",
      remarks: remarks,
    });
  };
  const onConfirmUnreturn = (remarks: string) => {
    closeUnreturnedRemarkPrompt();
    updateStatus.mutate({
      status: "unreturned",
      remarks: remarks,
    });
  };

  const updateStatus = useMutation({
    mutationFn: (body: { status: BorrowStatus; remarks: string }) =>
      Patch(
        `/circulation/transactions/${id}/books/${selectedCopy.bookId}/accessions/${selectedCopy.number}`,
        body,
        {},
        [apiScope("Checkout.Edit")]
      ),
    onSuccess: () => {
      toast.success("Borrowed book has been updated.");
    },
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
    onSettled: () => {
      refetch();
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
                      <Td>{new Date(borrowedBook.dueDate).toDateString()}</Td>
                      <Td>{new Date(borrowedBook.dueDate).toDateString()}</Td>
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

                      <Td className="flex gap-2"></Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </Container>
        </LoadingBoundary>
      </ContainerNoBackground>
      <PromptTextAreaDialog
        close={closeReturnRemarkPrompt}
        isOpen={isReturnRemarkPromptOpen}
        label="Remarks"
        proceedBtnText="Save"
        title="Return Remarks"
        placeholder="Eg. Returned with no damage or Damage."
        onProceed={onConfirmReturn}
      />

      <PromptTextAreaDialog
        close={closeCancellationRemarkPrompt}
        isOpen={isCancellationRemarkPromptOpen}
        label="Remarks"
        proceedBtnText="Save"
        title="Cancellation Remarks"
        placeholder="Eg. Cancellation reason"
        onProceed={onConfirmCancel}
      />
      <PromptTextAreaDialog
        close={closeUnreturnedRemarkPrompt}
        isOpen={isUnreturnedRemarkPrompOpen}
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
