import { useEffect, useState } from "react";
import Document from "react-pdf/dist/cjs/Document";
import Page from "react-pdf/dist/cjs/Page";
import pdfjs from "react-pdf/dist/cjs/pdfjs";
import { CustomInput } from "@components/ui/form/Input";
import { Button } from "flowbite-react";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const DocumentView = ({ eBookUrl = "" }) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tempPageNumber, setTempPageNumber] = useState<number>(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setPageNumber(1);
    setNumPages(numPages);
  }
  useEffect(() => {
    setTempPageNumber(1);
    setNumPages(1);
    setPageNumber(1);
  }, [eBookUrl]);
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
    <>
      <div className="header flex gap-2 mb-2 items-center ">
        <div className="mb-1">
          <CustomInput
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

        <Button
          color="light"
          onClick={() => {
            setPageNumber((prev) => {
              if (prev === 1) {
                return prev;
              }
              return prev - 1;
            });
          }}
        >
          Previous
        </Button>
        <Button
          color="light"
          onClick={() => {
            setPageNumber((prev) => {
              if (prev === numPages) {
                return prev;
              }
              return prev + 1;
            });
          }}
        >
          Next
        </Button>
      </div>
      <Document
        file={eBookUrl}
        noData={
          <span className="dark:text-white text-gray-900">
            Book has no eBook
          </span>
        }
        className="w-full flex justify-center flex-col items-center p-4 gap-2"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <p className="mb-3">
          Page {pageNumber} of {numPages}
        </p>

        <Page
          renderAnnotationLayer={false}
          pageNumber={pageNumber}
          className="shadow border"
          scale={1.2}
        />
      </Document>
    </>
  );
};

export default DocumentView;
