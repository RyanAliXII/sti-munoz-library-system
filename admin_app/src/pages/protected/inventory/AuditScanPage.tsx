import { Accession, Audit, Book } from "@definitions/types";
import { useNavigate, useParams } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import jsonpack from "jsonpack";
import {
  Thead,
  Table,
  HeadingRow,
  Tbody,
  Th,
  BodyRow,
  Td,
} from "@components/ui/table/Table";

import useQRScanner from "@hooks/useQRScanner";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";

export interface AuditedAccession
  extends Omit<
    Accession,
    "title" | "ddc" | "authorNumber" | "yearPublished" | "section" | "bookId"
  > {
  isAudited: boolean;
  isCheckedOut: boolean;
}
export interface AuditedBooks extends Omit<Book, "authors"> {
  accessions: AuditedAccession[];
}
type QrResult = {
  accessionNumber: number;
  bookId: string;
};
const AuditScan = () => {
  const { id } = useParams();
  const { Get, Post } = useRequest();
  const fetchAudit = async () => {
    const { data: response } = await Get(`/inventory/audits/${id}`);
    return response?.data?.audit ?? {};
  };
  const navigate = useNavigate();

  const { data: audit } = useQuery<Audit>({
    queryFn: fetchAudit,
    queryKey: ["audit"],
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
    onError: () => {
      {
        navigate("/void");
      }
    },
  });

  const fetchAuditedBooks = async () => {
    try {
      const { data: response } = await Get(`inventory/audits/${id}/books`);
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const { data: auditedBooks } = useQuery<AuditedBooks[]>({
    queryFn: fetchAuditedBooks,
    queryKey: ["auditedBooks"],
  });

  const sendBook = useMutation({
    mutationFn: (qrResult: QrResult) =>
      Post(
        `/inventory/audits/${id}/books/${qrResult.bookId}/accessions/${qrResult.accessionNumber}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["auditedBooks"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const onQRScan = (decodedText: string) => {
    let data: QrResult = jsonpack.unpack(decodedText);
    sendBook.mutate(data);
  };

  useQRScanner({ elementId: "reader", onScan: onQRScan });

  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">
          Inventory: {audit?.name}
        </h1>
      </ContainerNoBackground>
      <Container>
        <div id="reader" className="w-96"></div>
      </Container>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Book Title</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {auditedBooks?.map((book) => {
              return (
                <BodyRow key={book.id}>
                  <Td className="border-r border-l">{book.title}</Td>
                  <Td className="border-r">
                    <Table>
                      <Thead>
                        <HeadingRow>
                          <Th>Accession Number</Th>
                          <Th>Copy Number</Th>
                          <Th>Status</Th>
                        </HeadingRow>
                      </Thead>
                      <Tbody>
                        {book.accessions?.map((accession) => {
                          return (
                            <BodyRow key={`${book.id}_${accession.copyNumber}`}>
                              <Td>{accession.number}</Td>
                              <Td>Copy {accession.copyNumber}</Td>

                              <Td>
                                {accession.isCheckedOut ? (
                                  <span className="text-gray-400">
                                    Book has been checked out
                                  </span>
                                ) : accession.isAudited ? (
                                  <span className="text-green-400">
                                    OK: Found
                                  </span>
                                ) : (
                                  <span className="text-yellow-500">
                                    Unscanned.
                                  </span>
                                )}
                              </Td>
                            </BodyRow>
                          );
                        })}
                      </Tbody>
                    </Table>
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

export default AuditScan;
