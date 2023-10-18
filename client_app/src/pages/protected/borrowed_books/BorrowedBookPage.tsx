import LoadingBoundary from "@components/loader/LoadingBoundary";
import { buildS3Url } from "@definitions/s3";
import { BorrowedBook } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  BorrowStatus,
  EbookStatusText,
  StatusText,
} from "@internal/borrow_status";
import { useQuery } from "@tanstack/react-query";
import ordinal from "ordinal";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BorrowedBooksPage = () => {
  const [searchParams, setSearchParam] = useSearchParams();
  const { Get } = useRequest();

  const [activeTab, setActiveTab] = useState<BorrowStatus | 0>(() => {
    let statusId = searchParams.get("statusId");
    let parsedStatusId = parseInt(statusId ?? "");
    if (isNaN(parsedStatusId)) {
      return 0;
    }
    return parsedStatusId;
  });
  const fetchBorrowedBooks = async (activeTab: BorrowStatus | 0) => {
    try {
      let params = {};
      if (activeTab != 0) {
        params = {
          statusId: activeTab,
        };
      }
      const response = await Get("/borrowing/borrowed-books", {
        params,
      });
      const { data } = response.data;
      return data?.borrowedBooks ?? [];
    } catch (error) {
      return [];
    }
  };

  const {
    data: onlineBorrowedBooks,
    isFetching,
    isError,
  } = useQuery<BorrowedBook[]>({
    queryFn: () => fetchBorrowedBooks(activeTab),
    queryKey: ["borrowedBooks", activeTab],
  });

  return (
    <div className="mt-3 container mx-auto px-2" style={{ maxWidth: "800px" }}>
      <div className="mt-5 w-full flex overflow-x-scroll md:overflow-auto overflow-y-hidden ">
        <a
          className={isTabActive(activeTab, 0)}
          onClick={() => {
            setSearchParam({ statusId: "0" });
            setActiveTab(0);
          }}
        >
          All
        </a>
        <a
          className={isTabActive(activeTab, BorrowStatus.Pending)}
          onClick={() => {
            setSearchParam({ statusId: BorrowStatus.Pending.toString() });
            setActiveTab(BorrowStatus.Pending);
          }}
        >
          Pending
        </a>
        <a
          className={isTabActive(activeTab, BorrowStatus.Approved)}
          onClick={() => {
            setSearchParam({ statusId: BorrowStatus.Approved.toString() });
            setActiveTab(BorrowStatus.Approved);
          }}
        >
          Approved
        </a>
        <a
          className={isTabActive(activeTab, BorrowStatus.CheckedOut)}
          onClick={() => {
            setSearchParam({ statusId: BorrowStatus.CheckedOut.toString() });
            setActiveTab(BorrowStatus.CheckedOut);
          }}
        >
          Borrowed
        </a>
        <a
          className={isTabActive(activeTab, BorrowStatus.Returned)}
          onClick={() => {
            setSearchParam({ statusId: BorrowStatus.Returned.toString() });
            setActiveTab(BorrowStatus.Returned);
          }}
        >
          Returned
        </a>
        <a
          className={isTabActive(activeTab, BorrowStatus.Cancelled)}
          onClick={() => {
            setSearchParam({ statusId: BorrowStatus.Cancelled.toString() });
            setActiveTab(BorrowStatus.Cancelled);
          }}
        >
          Cancelled
        </a>
      </div>
      <div className=" flex flex-col mx-auto gap-4 py-5 ">
        <LoadingBoundary isError={isError} isLoading={isFetching}>
          {onlineBorrowedBooks?.map((borrowedCopy) => {
            const book = borrowedCopy.book;
            let bookCover = "";
            if (book.covers.length > 0) {
              bookCover = buildS3Url(book.covers[0]);
            }
            const isEbook = book.ebook.length > 0;
            return (
              <div className="h-54 shadow" key={borrowedCopy.id}>
                <div className="p-2 border border-b text-green-700">
                  <small className="text-xs lg:text-sm">
                    {borrowedCopy.statusId === BorrowStatus.Pending &&
                      (borrowedCopy.isEbook
                        ? EbookStatusText.Pending
                        : StatusText.Pending)}
                    {borrowedCopy.statusId === BorrowStatus.Approved &&
                      (borrowedCopy.isEbook
                        ? EbookStatusText.Approved
                        : StatusText.Approved)}
                    {borrowedCopy.statusId === BorrowStatus.CheckedOut && (
                      <>
                        {`${
                          borrowedCopy.isEbook
                            ? EbookStatusText.CheckedOut
                            : StatusText.CheckedOut
                        }`}
                        <span className="underline underline-offset-2">
                          {" "}
                          {new Date(borrowedCopy.dueDate ?? "").toDateString()}
                        </span>
                      </>
                    )}
                    {borrowedCopy.statusId === BorrowStatus.Returned &&
                      StatusText.Returned}
                    {borrowedCopy.statusId === BorrowStatus.Cancelled &&
                      StatusText.Cancelled}
                  </small>
                </div>

                <div className="w-full  p-5 flex  mt-1 rounded justify-between">
                  <div className="flex gap-5 items-center">
                    <div className="flex">
                      {bookCover.length > 0 && (
                        <img
                          src={bookCover}
                          className="w-24 h-24 rounded object-scale-down"
                        ></img>
                      )}
                      {bookCover.length == 0 && (
                        <div className="w-24 h-24 rounded bg-gray-200 "></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Link
                        to={`/catalog/${book.id}`}
                        className="text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500"
                      >
                        {book.title}{" "}
                        {isEbook
                          ? "- eBook"
                          : `- ${borrowedCopy.accessionNumber}`}
                      </Link>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500">
                        {book.section.name}
                        {book.ddc.length > 0 ? ` - ${book.ddc}` : ""}
                        {book.authorNumber.length > 0
                          ? ` - ${book.authorNumber}`
                          : ""}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500">
                        {isEbook
                          ? ""
                          : `${ordinal(borrowedCopy.copyNumber)} - Copy`}
                      </p>

                      {borrowedCopy.penalty > 0 &&
                        borrowedCopy.statusId === BorrowStatus.CheckedOut && (
                          <small className="text-xs md:text-sm text-error">
                            You are past due. Penalty:{" "}
                            <strong>
                              PHP{" "}
                              {borrowedCopy.penalty.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </small>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end justify-self-end">
                    {(borrowedCopy.statusId === BorrowStatus.Pending ||
                      borrowedCopy.statusId === BorrowStatus.Approved) && (
                      <a
                        role="button"
                        className="text-xs text-error lg:text-sm mr-2"
                      >
                        Cancel
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </LoadingBoundary>
      </div>
    </div>
  );
};
const isTabActive = (activeTab: BorrowStatus | 0, tab: BorrowStatus | 0) => {
  return activeTab === tab
    ? "tab  tab-bordered tab-active inline"
    : "tab tab-bordered inline";
};

export default BorrowedBooksPage;
