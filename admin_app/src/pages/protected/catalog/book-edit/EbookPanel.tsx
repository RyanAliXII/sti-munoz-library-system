import { useRequest } from "@hooks/useRequest";
import { useBookEditFormContext } from "./BookEditFormContext";
import { useQuery } from "@tanstack/react-query";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  DangerButton,
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import { Input, InputClasses } from "@components/ui/form/Input";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useSwitch } from "@hooks/useToggle";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const EbookPanel = () => {
  const { form: book } = useBookEditFormContext();
  const { Get } = useRequest();
  const fetchEbook = async () => {
    try {
      const response = await Get(`/books/${book.id}/ebooks`, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const { data: eBookUrl } = useQuery({
    queryFn: fetchEbook,
    queryKey: ["eBook"],
    enabled: book.ebook.length > 1,
  });
  const {
    close: closeRemoveDialog,
    isOpen: isOpenRemoveDialog,
    open: openRemoveDialog,
  } = useSwitch();
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10 ">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">eBook</h1>
      </div>
      <div className="flex gap-2">
        <DangerButton
          disabled={book.ebook.length === 0}
          onClick={openRemoveDialog}
        >
          Remove eBook
        </DangerButton>
        <PrimaryButton>Update eBook</PrimaryButton>
      </div>
      <hr className="mb-3 mt-3"></hr>
      <DocumentView eBookUrl={eBookUrl} />
      <DangerConfirmDialog
        title="Remove ebook!"
        text="Are you sure you want to remove the ebook? This will delete the eBook permamanently."
        close={closeRemoveDialog}
        isOpen={isOpenRemoveDialog}
      />
    </div>
  );
};
const DocumentView = ({ eBookUrl = "" }) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tempPageNumber, setTempPageNumber] = useState<number>(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
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
    <>
      <div className="header flex gap-2 mb-2 items-center ">
        <div className="mb-1">
          <Input
            label="Page"
            type="number"
            min={1}
            max={numPages}
            placeholder="page number"
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
        className="w-10/12 flex justify-center flex-col items-center p-4"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <p className="mb-3">
          Page {pageNumber} of {numPages}
        </p>
        <Page pageNumber={pageNumber} className="shadow border" scale={1.5} />
      </Document>
    </>
  );
};
export default EbookPanel;
