import ProfileIcon from "@components/ProfileIcon";
import { Input } from "@components/forms/Forms";
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
import { BorrowingTransaction } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const TransactionByIdPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fetchTransaction = async () => {
    const { data: response } = await axiosClient.get(
      `/circulation/transactions/${id}`
    );
    return response?.data?.transaction;
  };

  const { data: transaction } = useQuery<BorrowingTransaction>({
    queryFn: fetchTransaction,
    queryKey: ["transaction"],
    retry: false,
    onError: () => {
      navigate("/void");
    },
  });
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Transaction: {id}</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 first-letter: -md lg:rounded-md mx-auto mb-4 flex gap-2">
        <div className="w-5/12">
          <div className="flex gap-5">
            <div>
              <ProfileIcon givenName="test" surname="test"></ProfileIcon>
            </div>
            <div>
              <h4>{transaction?.accountDisplayName}</h4>
              <small className="text-gray-500">
                {transaction?.accountEmail}
              </small>
            </div>
          </div>
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
