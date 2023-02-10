import ProfileIcon from "@components/ProfileIcon";
import {
  Thead,
  BodyRow,
  HeadingRow,
  Table,
  Td,
  Tbody,
  Th,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import {
  BorrowStatus,
  BorrowStatuses,
  BorrowingTransaction,
} from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const TransactionByIdPage = () => {
  const navigate = useNavigate();
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
      } as BorrowingTransaction)
    );
  };

  const { data: transaction } = useQuery<BorrowingTransaction>({
    queryFn: fetchTransaction,
    queryKey: ["transaction"],
    retry: false,
    onError: () => {
      navigate("/void");
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
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Transaction: {id}</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4 flex gap-2 justify-between">
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
          <span className="text-gray-500 text-sm">{checkStatus()}</span>
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 -md lg:rounded-md mx-auto">
        <h4 className="mb-2">Borrowed Books</h4>
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
      </div>
    </>
  );
};

export default TransactionByIdPage;
