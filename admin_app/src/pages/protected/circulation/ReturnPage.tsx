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

import { BorrowRequest, BorrowingTransaction } from "@definitions/types";
import { useNavigate } from "react-router-dom";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";
import TimeAgo from "timeago-react";

const BorrowingTransactionPage = () => {
  const { Get } = useRequest();
  const fetchTransactions = async () => {
    try {
      const { data: response } = await Get("/borrowing/requests", {}, [
        apiScope("Checkout.Read"),
      ]);

      return response?.data?.borrowRequests ?? [];
    } catch {
      return [];
    }
  };
  const { data: requests } = useQuery<BorrowRequest[]>({
    queryFn: fetchTransactions,
    queryKey: ["transactions"],
  });
  const navigate = useNavigate();
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Borrow Requests</h1>
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
            {requests?.map((request) => {
              return (
                <BodyRow
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/circulation/transactions/${request.id}`)
                  }
                >
                  <Td>{request.client.displayName}</Td>

                  <Td>
                    <TimeAgo datetime={request.createdAt} />
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
