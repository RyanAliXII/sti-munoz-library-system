import Document from "react-pdf/dist/cjs/Document";
import Page from "react-pdf/dist/cjs/Page";
import pdfjs from "react-pdf/dist/cjs/pdfjs";
import { useEffect, useLayoutEffect, useState } from "react";

import "react-pdf/dist/esm/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const DocumentView = ({
  eBookUrl = "",
  windowData = {
    width: 0,
    height: 0,
  },
}) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tempPageNumber, setTempPageNumber] = useState<number>(1);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setPageNumber(1);
    setNumPages(numPages);
  }
  useLayoutEffect(() => {
    if (windowData.width >= 1200) {
      setWidth(700);
      setHeight(windowData.height);
      return;
    }
    setWidth(windowData.width);
    setHeight(windowData.height);
  }, [windowData]);
  useEffect(() => {
    if (isNaN(tempPageNumber)) {
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
  const gotoTop = () => {
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    setTempPageNumber(pageNumber);
    gotoTop();
  }, [pageNumber]);
  return (
    <div className="flex flex-col ">
      <Document
        file={eBookUrl}
        noData={"Book has no eBook"}
        className="w-full ebook-view "
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <div>
          <p className="mb-3 text-xs text-center font-bold lg:text-sm">
            Page {pageNumber} of {numPages}
          </p>
        </div>
        <Page
          height={height}
          width={width}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          pageNumber={pageNumber}
        />
      </Document>
      <div className="footer  flex gap-2 items-center justify-center pb-6 mt-2">
        <div>
          <input
            type="number"
            min={1}
            className="py-1 px-2 border rounded text-sm lg:text-base"
            max={numPages}
            value={tempPageNumber}
            onChange={(event) => {
              let value: string | number = event.target.value;
              value = parseInt(value);
              setTempPageNumber(value);
            }}
          />
        </div>
        <div className="flex gap-1">
          <button
            className="text-sm border px-2 py-1 rounded lg:text-base"
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
          </button>
          <button
            className="text-sm border px-2 py-1 rounded lg:text-base"
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
