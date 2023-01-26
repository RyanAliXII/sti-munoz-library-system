import axiosClient from "@definitions/configs/axios";
import { Audit } from "@definitions/types";
import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuditPage from "./AuditPage";
import { useQuery } from "@tanstack/react-query";
import jsonpack from "jsonpack";
import {
  Thead,
  Table,
  HeadingRow,
  BodyRow,
  Td,
  Tbody,
  Th,
} from "@components/table/Table";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";

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
              <Th>Book</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {/* {audits?.map((audit) => {
                return (
                  <BodyRow key={audit.id}>
                    <Td>{audit.name}</Td>
                    <Td>
                      <Link to={`/inventory/audits/${audit.id}`}>
                        <AiOutlineScan className="text-blue-500 text-lg cursor-pointer"></AiOutlineScan>
                      </Link>
                    </Td>
                  </BodyRow>
                );
              })} */}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default AuditScan;
