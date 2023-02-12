import {
  Thead,
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
} from "@components/table/Table";

import { Input } from "@components/forms/Forms";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import { BorrowingTransaction } from "@definitions/types";
import TimeAgo from "timeago-react";
import { useNavigate } from "react-router-dom";

const BorrowingTransactionPage = () => {
  const fetchTransactions = async () => {
    try {
      const { data: response } = await axiosClient.get(
        "/circulation/transactions"
      );
      return response?.data?.transactions ?? [];
    } catch {
      return [];
    }
  };
  const { data: transactions } = useQuery<BorrowingTransaction[]>({
    queryFn: fetchTransactions,
    queryKey: ["transactions"],
  });
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Return Book</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 first-letter: -md lg:rounded-md mx-auto mb-4 flex gap-2 border border-gray-100">
        <div className="w-5/12">
          <Input type="text" label="Search" placeholder="Search.."></Input>
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 -md lg:rounded-md mx-auto border border-gray-100">
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Transaction Id</Th>
              <Th>Client</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {transactions?.map((transaction) => {
              return (
                <BodyRow
                  key={transaction.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/circulation/transactions/${transaction.id}`)
                  }
                >
                  <Td>{transaction.id}</Td>
                  <Td>{transaction.accountDisplayName}</Td>
                  <Td>
                    <TimeAgo datetime={transaction.createdAt} />
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default BorrowingTransactionPage;
