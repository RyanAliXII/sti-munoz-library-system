import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { LightOutlineButton } from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
import { useParams } from "react-router-dom";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const EbookView = () => {
  const { id } = useParams();
  return (
    <div>
      <div className="w-full  flex flex-col items-center mt-5 gap-3">
        <div
          className=" flex flex-col w-11/12 sm:flex-row md:w-7/12 lg:w-6/12 gap-2"
          style={{
            maxWidth: "800px",
          }}
        >
          <DocumentView eBookUrl="" />
        </div>
      </div>
    </div>
  );
};

const DocumentView = ({ eBookUrl = "" }) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tempPageNumber, setTempPageNumber] = useState<number>(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setPageNumber(1);
    setNumPages(numPages);
  }

  useEffect(() => {
    if (isNaN(tempPageNumber)) {
      console.log("nan");
      setPageNumber(1);
      return;
    }
    if (tempPageNumber == 0) {
      setPageNumber(numPages);
      return;
    }
    if (tempPageNumber >= numPages) {
      setPageNumber(numPages);
      return;
    }
    setPageNumber(tempPageNumber);
  }, [tempPageNumber]);

  useEffect(() => {
    setTempPageNumber(pageNumber);
  }, [pageNumber]);
  return (
    <div className="flex flex-col">
      <div className="header flex gap-2 mb-2 items-center ">
        <div className="mb-1">
          <Input
            label="Page"
            type="number"
            min={1}
            max={numPages}
            value={tempPageNumber}
            onChange={(event) => {
              let value: string | number = event.target.value;
              value = parseInt(value);
              setTempPageNumber(value);
            }}
          />
        </div>

        <LightOutlineButton
          onClick={() => {
            setPageNumber((prev) => {
              if (prev === 1) {
                return prev;
              }
              return prev - 1;
            });
          }}
        >
          {" "}
          Previous
        </LightOutlineButton>
        <LightOutlineButton
          onClick={() => {
            setPageNumber((prev) => {
              if (prev === numPages) {
                return prev;
              }
              return prev + 1;
            });
          }}
        >
          {" "}
          Next{" "}
        </LightOutlineButton>
      </div>
      <Document
        file={eBookUrl}
        noData={"Book has no eBook"}
        className="w-full flex justify-center flex-col items-center p-4"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <p className="mb-3">
          Page {pageNumber} of {numPages}
        </p>

        <Page pageNumber={pageNumber} className="shadow border" scale={1.5} />
      </Document>
    </div>
  );
};

export default EbookView;
