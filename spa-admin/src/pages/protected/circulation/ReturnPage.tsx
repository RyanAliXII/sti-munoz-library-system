import {
  Thead,
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
} from "@components/ui/table/Table";

import { Input } from "@components/ui/form/Input";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import { BorrowingTransaction } from "@definitions/types";
import TimeAgo from "timeago-react";
import { useNavigate } from "react-router-dom";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

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
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Return Book</h1>
      </ContainerNoBackground>
      {/* <Container>
        <div className="w-5/12">
          <Input type="text" label="Search" placeholder="Search.."></Input>
        </div>
      </Container> */}
      <Container>
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
      </Container>
    </>
  );
};

export default BorrowingTransactionPage;
