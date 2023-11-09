import { Accession, Audit, Book } from "@definitions/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";

import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import BookSearchBox from "@components/BookSearchBox";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import ordinal from "ordinal";
import { AiFillCheckCircle } from "react-icons/ai";
import { BsFillQuestionDiamondFill } from "react-icons/bs";

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

const AuditScan = () => {
  const { id } = useParams();
  const { Get, Post, Delete } = useRequest();
  const fetchAudit = async () => {
    const { data: response } = await Get(`/inventory/audits/${id}`, {});
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
      const { data: response } = await Get(`inventory/audits/${id}/books`, {});
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
      Post(`/inventory/audits/${id}/`, { accessionId: accessionId }, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["auditedBooks"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const sendBook = useMutation({
    mutationFn: (bookId: string) =>
      Post(`/inventory/audits/${id}/books/${bookId}`, {}, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["auditedBooks"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const deleteBookCopy = useMutation({
    mutationFn: (accessionId: string) =>
      Delete(`/inventory/audits/${id}/accessions/${accessionId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["auditedBooks"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });
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

  const onSelectBook = (book: Book) => {
    sendBook.mutate(book.id ?? "");
  };
  return (
    <>
      <Container>
        <h1 className="text-2xl font-bold text-gray-900 py-3 dark:text-gray-50">
          Audit: {audit?.name}
        </h1>
        <div className="flex gap-2 items-center my-4">
          <Button
            color="primary"
            onClick={() => {
              toast.info("Feature is still in development.");
            }}
          >
            <HiOutlineDocumentReport className="text-lg mr-2" />
            Generate Report
          </Button>
          <div className="flex-1">
            <BookSearchBox selectBook={onSelectBook} />
          </div>
        </div>

        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <Table>
            <Table.Head>
              <Table.HeadCell>Book title</Table.HeadCell>
              <Table.HeadCell>Accession number</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {auditedBooks?.map((book) => {
                return book.accessions?.map((accession) => {
                  return (
                    <Table.Row key={`${book.id}_${accession.copyNumber}`}>
                      <Table.Cell>
                        <div>
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {book.title}
                          </div>
                          <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {book.copies === 1
                              ? "Single Copy"
                              : `${ordinal(accession.copyNumber)} copy`}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{accession.number}</Table.Cell>

                      <Table.Cell>
                        {accession.isCheckedOut ? (
                          <span className="text-gray-400">
                            Book has been checked out
                          </span>
                        ) : accession.isAudited ? (
                          <span className="text-green-400">Found</span>
                        ) : (
                          <span className="text-yellow-500">Missing</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="flex gap-2">
                        {!accession.isAudited && !accession.isCheckedOut && (
                          <Tippy content="Mark Book as Found">
                            <button
                              className="flex items-center border p-2  rounded bg-white text-green-600 border-green-600"
                              onClick={() => {
                                sendBookCopy.mutate(accession.id ?? "");
                              }}
                            >
                              <AiFillCheckCircle
                                className="
                          text-lg"
                              />
                            </button>
                          </Tippy>
                        )}

                        {accession.isAudited && !accession.isCheckedOut && (
                          <Tippy content="Mark as Missing">
                            <button className="flex items-center border p-2  rounded bg-white text-orange-500 border-orange-500">
                              <BsFillQuestionDiamondFill
                                className="
                          text-lg"
                                onClick={() => {
                                  deleteBookCopy.mutate(accession.id ?? "");
                                }}
                              />
                            </button>
                          </Tippy>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                });
              })}
            </Table.Body>
          </Table>
          {(auditedBooks?.length ?? 0) === 0 ? (
            <div className="w-full flex justify-center h-20 items-center dark:text-gray-50">
              <small>No books have been scanned.</small>
            </div>
          ) : null}
        </LoadingBoundary>
      </Container>
    </>
  );
};

export default AuditScan;
{
}
