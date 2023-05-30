import {
  Thead,
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
} from "@components/ui/table/Table";

import { useQuery } from "@tanstack/react-query";

import { BorrowingTransaction } from "@definitions/types";
import TimeAgo from "timeago-react";
import { useNavigate } from "react-router-dom";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";
import { BorrowStatuses } from "@internal/borrow-status";
import { apiScope } from "@definitions/configs/msal/scopes";

const BorrowingTransactionPage = () => {
  const { Get } = useRequest();
  const fetchTransactions = async () => {
    try {
      const { data: response } = await Get("/circulation/transactions", {}, [
        apiScope("Checkout.Read"),
      ]);
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
        <h1 className="text-3xl font-bold text-gray-700">Borrowed Books</h1>
      </ContainerNoBackground>

      <Container>
        <Table>
          <Thead>
            <HeadingRow>
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
                  <Td>{transaction.client.displayName}</Td>

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
