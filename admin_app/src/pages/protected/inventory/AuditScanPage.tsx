import { Accession, Audit, Book } from "@definitions/types";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineDocumentReport } from "react-icons/hi";
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
import { BaseSyntheticEvent, useEffect, useRef } from "react";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { PrimaryButton } from "@components/ui/button/Button";
import { toast } from "react-toastify";
import { apiScope } from "@definitions/configs/msal/scopes";

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
    const { data: response } = await Get(`/inventory/audits/${id}`, {}, [
      apiScope("Audit.Read"),
    ]);
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
      const { data: response } = await Get(`inventory/audits/${id}/books`, {}, [
        apiScope("Audit.Read"),
      ]);
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const {
    data: auditedBooks,
    isFetching,
    isError,
  } = useQuery<AuditedBooks[]>({
    queryFn: fetchAuditedBooks,
    queryKey: ["auditedBooks"],
  });

  const sendBookCopy = useMutation({
    mutationFn: (accessionId: string) =>
      Post(`/inventory/audits/${id}`, { accessionId: accessionId }, {}, [
        apiScope("Audit.Add"),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries(["auditedBooks"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const onQRScan = (decodedText: string) => {
    let data: QrResult = jsonpack.unpack(decodedText);
    // sendBook.mutate(data);
  };

  // useQRScanner({ elementId: "reader", onScan: onQRScan });
  const textArr = useRef<string[]>([]);
  useEffect(() => {
    const waitForEvent = (event: KeyboardEvent) => {
      if (event.key != "Enter") {
        textArr.current.push(event.key.toString());
      } else {
        const text = textArr.current.join("");
        sendBookCopy.mutate(text.toString());
        textArr.current = [];
      }
    };
    window.addEventListener("keypress", waitForEvent);

    return () => {
      window.removeEventListener("keypress", waitForEvent);
    };
  }, []);
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">
          Inventory: {audit?.name}
        </h1>
      </ContainerNoBackground>
      <ContainerNoBackground>
        <PrimaryButton
          className="mb-2 flex items-center"
          onClick={() => {
            toast.info("Feature is still in development.");
          }}
        >
          <HiOutlineDocumentReport className="text-lg mr-2" />
          Generate Report
        </PrimaryButton>
        <LoadingBoundary isLoading={isFetching} isError={isError}>
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
                              <BodyRow
                                key={`${book.id}_${accession.copyNumber}`}
                              >
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
          {(auditedBooks?.length ?? 0) === 0 ? (
            <div className="w-full flex justify-center h-20 items-center">
              <small>No books have been scanned.</small>
            </div>
          ) : null}
        </LoadingBoundary>
      </ContainerNoBackground>
    </>
  );
};

export default AuditScan;
