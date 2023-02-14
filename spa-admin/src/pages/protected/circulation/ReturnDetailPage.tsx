import ProfileIcon from "@components/ProfileIcon";
import { PromptTextAreaDialog } from "@components/ui/dialog/Dialog";
import { TextAreaClasses } from "@components/ui/form/Input";
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
import axiosClient from "@definitions/configs/axios";
import {
  BorrowStatus,
  BorrowStatuses,
  BorrowingTransaction,
} from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PrimaryButton } from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";

const TransactionByIdPage = () => {
  const navigate = useNavigate();
  const {
    close: closePrompt,
    open: openPrompt,
    isOpen: isPromptOpen,
  } = useSwitch();
  const { id } = useParams();
  const fetchTransaction = async () => {
    const { data: response } = await axiosClient.get(
      `/circulation/transactions/${id}`
    );
    return (
      response?.data?.transaction ??
      ({
        accountDisplayName: "",
        accountEmail: "",
        accountId: "",
        borrowedAccessions: [],
        createdAt: "",
        dueDate: "",
        returnedAt: "",
        remarks: "",
      } as BorrowingTransaction)
    );
  };

  const { data: transaction, refetch } = useQuery<BorrowingTransaction>({
    queryFn: fetchTransaction,
    queryKey: ["transaction"],
    retry: false,
    onError: () => {
      navigate("/void");
    },
  });
  const returnBooks = useMutation({
    mutationFn: (remarks: string) =>
      axiosClient.patch(`/circulation/transactions/${id}`, {
        remarks: remarks,
      }),
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
    onSuccess: () => {
      toast.success("Book successfully returned.");
      refetch();
    },
  });
  const checkStatus = (): BorrowStatus => {
    const returnedDate = new Date(transaction?.returnedAt ?? "");
    const INVALID_YEAR = 1;
    if (
      returnedDate instanceof Date &&
      !isNaN(returnedDate.getTime()) &&
      returnedDate.getFullYear() != INVALID_YEAR
    ) {
      return BorrowStatuses.Returned;
    } else {
      const now = new Date();
      const dueDate = new Date(transaction?.dueDate ?? "");
      if (now.setHours(0, 0, 0, 0) > dueDate.setHours(0, 0, 0, 0)) {
        return BorrowStatuses.Overdue;
      }
      return BorrowStatuses.CheckedOut;
    }
  };
  const status = checkStatus();
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Transaction: {id}</h1>
      </ContainerNoBackground>
      <Container className="flex justify-between px-4 py-6">
        <div>
          <div className="flex gap-5">
            <div>
              <ProfileIcon givenName="test" surname="test"></ProfileIcon>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 font-bold">
                {transaction?.accountDisplayName}
              </span>
              <small className="text-gray-500">
                {transaction?.accountEmail}
              </small>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-2/12 ">
          <span className="font-bold text-gray-600">Due Date</span>
          <span className="text-gray-500 text-sm">
            {new Date(transaction?.dueDate ?? "").toLocaleDateString(
              "default",
              { month: "long", day: "2-digit", year: "numeric" }
            )}
          </span>
        </div>
        <div className="flex flex-col w-3/12">
          <span className="font-bold text-gray-600">Status</span>
          <span className="text-gray-500 text-sm">{status}</span>
        </div>
      </Container>
      <ContainerNoBackground className="px-4 py-6">
        <Divider
          heading="h2"
          headingProps={{
            className: "text-xl",
          }}
          hrProps={{
            className: "mb-5",
          }}
        >
          Borrowed Books{" "}
        </Divider>
        <Container className="mx-0 lg:w-full">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Title</Th>
                <Th>Copy number</Th>
                <Th>Accession number</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {transaction?.borrowedAccessions?.map((accession) => {
                return (
                  <BodyRow key={`${accession.number}_${accession.bookId}`}>
                    <Td>{accession.title}</Td>
                    <Td>{accession.copyNumber}</Td>
                    <Td>{accession.number}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </Container>
      </ContainerNoBackground>

      {status == BorrowStatuses.Returned ? (
        <ContainerNoBackground className="px-4 py-6">
          <Divider
            heading="h2"
            headingProps={{
              className: "text-xl",
            }}
            hrProps={{
              className: "mb-5",
            }}
          >
            Remarks
          </Divider>
          <div className="mt-2">
            <textarea
              defaultValue={
                transaction?.remarks.length ?? 0 > 0
                  ? transaction?.remarks
                  : "No remarks"
              }
              className={TextAreaClasses.DefaultClasslist}
              disabled={true}
            ></textarea>
          </div>
        </ContainerNoBackground>
      ) : null}

      {status != BorrowStatuses.Returned ? (
        <ContainerNoBackground className="px-4 py-6">
          <div>
            <PrimaryButton
              className="ml-2 lg:ml-0"
              type="submit"
              onClick={() => {
                openPrompt();
              }}
            >
              Return Books
            </PrimaryButton>
          </div>
        </ContainerNoBackground>
      ) : null}
      <PromptTextAreaDialog
        close={closePrompt}
        isOpen={isPromptOpen}
        title="Return Remarks"
        proceedBtnText="Proceed"
        placeholder="Add remarks e.g. Missing or Returned with damage etc."
        onProceed={(text: string) => {
          returnBooks.mutate(text);
          closePrompt();
        }}
      ></PromptTextAreaDialog>
    </>
  );
};

export default TransactionByIdPage;