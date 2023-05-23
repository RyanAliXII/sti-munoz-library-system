import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/s3";
import { OnlineBorrowedBook } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  OnlineBorrowStatus,
  OnlineBorrowStatuses,
  StatusText,
} from "@internal/borrow_status";
import { useQuery } from "@tanstack/react-query";
import ordinal from "ordinal";
import { useState } from "react";
import { Link } from "react-router-dom";

const CheckedOutBookPage = () => {
  const { Get } = useRequest();
  const [activeTab, setActiveTab] = useState<OnlineBorrowStatus>("pending");
  const fetchBorrowedBooks = async (activeTab: OnlineBorrowStatus) => {
    try {
      const response = await Get(
        "/circulation/online/borrowed-books",
        {
          params: {
            status: activeTab,
          },
        },
        [apiScope("Checkout.Read")]
      );
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
  } = useQuery<OnlineBorrowedBook[]>({
    queryFn: () => fetchBorrowedBooks(activeTab),
    queryKey: ["borrowedBooks", activeTab],
  });
  return (
    <div className="mt-3 container mx-auto px-2" style={{ maxWidth: "800px" }}>
      <div className="tabs mt-5 w-full ">
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Pending)}
          onClick={() => {
            setActiveTab(OnlineBorrowStatuses.Pending);
          }}
        >
          Pending
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Approved)}
          onClick={() => {
            setActiveTab(OnlineBorrowStatuses.Approved);
          }}
        >
          Approved
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.CheckedOut)}
          onClick={() => {
            setActiveTab(OnlineBorrowStatuses.CheckedOut);
          }}
        >
          Checked Out
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Returned)}
          onClick={() => {
            setActiveTab(OnlineBorrowStatuses.Returned);
          }}
        >
          Returned
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Cancelled)}
          onClick={() => {
            setActiveTab(OnlineBorrowStatuses.Cancelled);
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
            return (
              <div className="h-54 shadow" key={borrowedCopy.accessionId}>
                <div className="p-2 border border-b text-green-700">
                  <small className="text-xs lg:text-sm">
                    {activeTab === OnlineBorrowStatuses.Pending &&
                      StatusText.Pending}
                    {activeTab === OnlineBorrowStatuses.Approved &&
                      StatusText.Approved}
                    {activeTab === OnlineBorrowStatuses.CheckedOut && (
                      <>
                        {`${StatusText.CheckedOut} Please return the book on `}
                        <span className="underline underline-offset-2">
                          {new Date(borrowedCopy.dueDate ?? "").toDateString()}
                        </span>
                      </>
                    )}
                    {activeTab === OnlineBorrowStatuses.Returned &&
                      StatusText.Returned}
                    {activeTab === OnlineBorrowStatuses.Cancelled &&
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
                        {book.title}
                      </Link>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500">
                        {book.section.name} - {book.ddc} - {book.authorNumber}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-gray-500">
                        {ordinal(borrowedCopy.copyNumber)} - Copy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end justify-self-end">
                    {(borrowedCopy.status === "pending" ||
                      borrowedCopy.status === "approved") && (
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
const isTabActive = (
  activeTab: OnlineBorrowStatus,
  tab: OnlineBorrowStatus
) => {
  return activeTab === tab
    ? "tab flex tab-bordered flex-1 tab-active"
    : "tab tab-bordered flex-1 ";
};
export default CheckedOutBookPage;
