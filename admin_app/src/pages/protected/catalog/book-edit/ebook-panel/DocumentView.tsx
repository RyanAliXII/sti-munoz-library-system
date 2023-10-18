import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { LightOutlineButton } from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
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
        className="w-full flex justify-center flex-col items-center p-4 gap-2"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <p className="mb-3">
          Page {pageNumber} of {numPages}
        </p>
        {Array.from(Array(numPages)).map((_, index) => {
          return (
            <Page
              pageNumber={index + 1}
              className="shadow border"
              scale={1.5}
            />
          );
        })}
      </Document>
    </>
  );
};

export default DocumentView;
