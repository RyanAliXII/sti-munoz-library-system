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
import { Link, useSearchParams } from "react-router-dom";

const BorrowedBooksPage = () => {
  const [seachParams, setSearchParam] = useSearchParams();
  const { Get } = useRequest();
  let initialStatus = seachParams.get("status");
  const STATUSES = [
    "all",
    "pending",
    "approved",
    "checked-out",
    "cancelled",
    "returned",
  ];
  const [activeTab, setActiveTab] = useState<OnlineBorrowStatus | "all">(
    !initialStatus
      ? "all"
      : STATUSES.includes(initialStatus)
      ? (initialStatus as OnlineBorrowStatus)
      : "all"
  );
  const fetchBorrowedBooks = async (activeTab: OnlineBorrowStatus | "all") => {
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
      <div className="tabs mt-5  ">
        <a
          className={isTabActive(activeTab, "all")}
          onClick={() => {
            setSearchParam({ status: "all" });
            setActiveTab("all");
          }}
        >
          All
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Pending)}
          onClick={() => {
            setSearchParam({ status: OnlineBorrowStatuses.Pending });
            setActiveTab(OnlineBorrowStatuses.Pending);
          }}
        >
          Pending
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Approved)}
          onClick={() => {
            setSearchParam({ status: OnlineBorrowStatuses.Approved });
            setActiveTab(OnlineBorrowStatuses.Approved);
          }}
        >
          Approved
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.CheckedOut)}
          onClick={() => {
            setSearchParam({ status: OnlineBorrowStatuses.CheckedOut });
            setActiveTab(OnlineBorrowStatuses.CheckedOut);
          }}
        >
          Checked Out
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Returned)}
          onClick={() => {
            setSearchParam({ status: OnlineBorrowStatuses.Returned });
            setActiveTab(OnlineBorrowStatuses.Returned);
          }}
        >
          Returned
        </a>
        <a
          className={isTabActive(activeTab, OnlineBorrowStatuses.Cancelled)}
          onClick={() => {
            setSearchParam({ status: OnlineBorrowStatuses.Cancelled });
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
              <div className="h-54 shadow" key={borrowedCopy.id}>
                <div className="p-2 border border-b text-green-700">
                  <small className="text-xs lg:text-sm">
                    {borrowedCopy.status === OnlineBorrowStatuses.Pending &&
                      StatusText.Pending}
                    {borrowedCopy.status === OnlineBorrowStatuses.Approved &&
                      StatusText.Approved}
                    {borrowedCopy.status ===
                      OnlineBorrowStatuses.CheckedOut && (
                      <>
                        {`${StatusText.CheckedOut} Please return the book on `}
                        <span className="underline underline-offset-2">
                          {new Date(borrowedCopy.dueDate ?? "").toDateString()}
                        </span>
                      </>
                    )}
                    {borrowedCopy.status === OnlineBorrowStatuses.Returned &&
                      StatusText.Returned}
                    {borrowedCopy.status === OnlineBorrowStatuses.Cancelled &&
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
  activeTab: OnlineBorrowStatus | "all",
  tab: OnlineBorrowStatus | "all"
) => {
  return activeTab === tab
    ? "tab  tab-bordered tab-active"
    : "tab tab-bordered ";
};
export default BorrowedBooksPage;
