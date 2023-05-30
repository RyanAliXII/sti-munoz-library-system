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

import { BorrowedCopy, BorrowingTransaction } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ButtonClasses,
  PrimaryButton,
  SecondaryOutlineButton,
} from "@components/ui/button/Button";
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
const TransactionByIdPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { Get, Patch } = useRequest();
  const fetchTransaction = async () => {
    const { data: response } = await Get(
      `/circulation/transactions/${id}`,
      {},
      [apiScope("Checkout.Read")]
    );
    return response?.data?.transaction ?? BorrowingTransactionInitialValue;
  };
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
  const {
    data: transaction,
    refetch,
    isError,
    isFetching,
  } = useQuery<BorrowingTransaction>({
    queryFn: fetchTransaction,
    queryKey: ["transaction"],
    retry: false,
    onError: () => {
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
    closeReturnRemarkPrompt();
    updateStatus.mutate({
      status: "cancelled",
      remarks: remarks,
    });
  };
  const onConfirmUnreturn = (remarks: string) => {
    closeReturnRemarkPrompt();
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
        [apiScope("Checkout.Add")]
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
                  givenName={transaction?.client.givenName ?? ""}
                  surname={transaction?.client.surname ?? ""}
                ></ProfileIcon>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-bold">
                  {transaction?.client.displayName}
                </span>
                <small className="text-gray-500">
                  {transaction?.client.email}
                </small>
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
                  <Th>Copy number</Th>
                  <Th>Accession number</Th>
                  <Th>Due Date</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {transaction?.borrowedCopies?.map((accession) => {
                  const isTransactionFinished =
                    accession.isReturned ||
                    accession.isCancelled ||
                    accession.isUnreturned;
                  return (
                    <BodyRow key={`${accession.number}_${accession.bookId}`}>
                      <Td>{accession.book.title}</Td>
                      <Td>{accession.copyNumber}</Td>
                      <Td>{accession.number}</Td>

                      <Td>{new Date(accession.dueDate).toDateString()}</Td>
                      {!isTransactionFinished && (
                        <Td className="flex gap-2">
                          <Tippy content="View Book">
                            <Link
                              to={`/circulation/online-borrowed-books/`}
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
                                setSelectedCopy(accession);
                                openReturnRemarkPrompt();
                              }}
                            >
                              <MdOutlineKeyboardReturn
                                className="
                          text-lg"
                              />
                            </button>
                          </Tippy>
                          <Tippy content="Mark Book as Unreturned">
                            <button
                              className="flex items-center border p-2  rounded bg-white text-orange-500 border-orange-500"
                              onClick={() => {
                                setSelectedCopy(accession);
                                openUnreturnedRemarkPrompt();
                              }}
                            >
                              <BsFillQuestionDiamondFill
                                className="
                          text-lg"
                              />
                            </button>
                          </Tippy>
                          <Tippy content="Cancel Borrow Request">
                            <button
                              className="flex items-center border p-2  rounded bg-white text-red-500 border-red-500"
                              onClick={() => {
                                setSelectedCopy(accession);
                                openCancellationRemarkPrompt();
                              }}
                            >
                              <MdOutlineCancel
                                className="
                          text-lg"
                              />
                            </button>
                          </Tippy>
                        </Td>
                      )}

                      {isTransactionFinished && (
                        <Td>
                          {accession.isReturned && "Returned"}
                          {accession.isCancelled && "Cancelled"}
                          {accession.isUnreturned && "Unreturned"}
                        </Td>
                      )}
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
