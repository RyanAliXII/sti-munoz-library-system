import axiosClient from "@definitions/configs/axios";
import { Accession, Audit, Book } from "@definitions/types";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import jsonpack from "jsonpack";
import {
  Thead,
  Table,
  HeadingRow,
  Tbody,
  Th,
  BodyRow,
  Td,
} from "@components/table/Table";
import { Html5QrcodeScanner } from "html5-qrcode";

export interface AuditedAccession
  extends Omit<
    Accession,
    "title" | "ddc" | "authorNumber" | "yearPublished" | "section" | "bookId"
  > {
  isAudited: boolean;
}
export interface AuditedBooks extends Omit<Book, "authors"> {
  accessions: AuditedAccession[];
}

const AuditScan = () => {
  const { id } = useParams();

  const fetchAudit = async () => {
    const { data: response } = await axiosClient.get(`/inventory/audits/${id}`);
    return response?.data?.audit ?? {};
  };
  const navigate = useNavigate();
  let html5QrcodeScanner: Html5QrcodeScanner;
  const { data: audit } = useQuery<Audit>({
    queryFn: fetchAudit,
    queryKey: ["audit"],
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: (data) => {},
    onError: () => {
      {
        navigate("/void");
      }
    },
  });

  useEffect(() => {
    initializeScanner();

    return () => {
      html5QrcodeScanner.clear();
    };
  }, []);
  const initializeScanner = () => {
    html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 30,
        rememberLastUsedCamera: true,
        aspectRatio: 4 / 3,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        qrbox: 75,
      },
      /* verbose= */ false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  };
  function onScanSuccess(decodedText: any, decodedResult: any) {
    const data = jsonpack.unpack(decodedText);
    console.log(data);
  }
  function onScanFailure(error: unknown) {}
  const fetchAuditedBooks = async () => {
    try {
      const { data: response } = await axiosClient.get(
        `inventory/audits/${id}/books`
      );
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };

  const { data: auditedBooks } = useQuery<AuditedBooks[]>({
    queryFn: fetchAuditedBooks,
    queryKey: ["auditedBooks"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">
          Inventory: {audit?.name}
        </h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 drop-shadow-md lg:rounded-md mx-auto mb-2 ">
        <div id="reader" className="w-96"></div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 drop-shadow-md lg:rounded-md mx-auto">
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
                      <HeadingRow>
                        <Th>Accession Number</Th>
                        <Th>Copy Number</Th>
                        <Th>Scanned</Th>
                      </HeadingRow>
                      <Tbody>
                        {book.accessions?.map((accession) => {
                          return (
                            <BodyRow>
                              <Td>{accession.number}</Td>
                              <Td>Copy {accession.copyNumber}</Td>

                              <Td>
                                {accession.isAudited ? (
                                  <span className="text-green-400">
                                    Scanned.
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
      </div>
    </>
  );
};

export default AuditScan;
