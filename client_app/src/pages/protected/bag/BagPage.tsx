import { buildS3Url } from "@definitions/s3";
import { BagItem } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BsTrashFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import ordinal from "ordinal";
import {
  ConfirmDialog,
  DangerConfirmDialog,
} from "@components/ui/dialog/Dialog";
import { useSwitch } from "@hooks/useToggle";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import LoadingBoundary from "@components/loader/LoadingBoundary";

import noData from "@assets/images/no-data.svg";
import { useAccountStats } from "@hooks/data-fetching/account";
const BagPage = () => {
  const { Get, Delete, Patch, Post } = useRequest();
  const fetchBagItems = async () => {
    try {
      const response = await Get("/bag/", {});
      const { data } = response.data;
      return data?.bag ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: stats } = useAccountStats();
  const {
    isOpen: isConfirmDeleteDialogOpen,
    close: closeConfirmDeleteDialog,
    open: openConfirmDeleteDialog,
  } = useSwitch();
  const {
    isOpen: isConfirmCheckoutDialogOpen,
    close: closeConfirmCheckoutDialog,
    open: openConfirmCheckoutDialog,
  } = useSwitch();

  const {
    data: bagItems,
    isFetching,
    isError,
  } = useQuery<BagItem[]>({
    queryFn: fetchBagItems,
    queryKey: ["bagItems"],
  });
  const [selectedItem, setSelectedItem] = useState<BagItem>();

  const queryClient = useQueryClient();
  const deleteItemFromBag = useMutation({
    mutationFn: () => Delete(`/bag/${selectedItem?.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });

  const onConfirmDelete = () => {
    closeConfirmDeleteDialog();
    deleteItemFromBag.mutate();
  };
  const onConfirmCheckout = () => {
    closeConfirmCheckoutDialog();
    checkout.mutate();
  };
  const checkItem = useMutation({
    mutationFn: (id: string) => Patch(`/bag/${id}/checklist`, {}, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const updateChecklist = useMutation({
    mutationFn: (action: "check" | "uncheck") =>
      Patch(`/bag/checklist?action=${action}`, {}, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });

  const deleteCheckedItems = useMutation({
    mutationFn: () => Delete("/bag/checklist", {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const isAllItemSelected = useMemo(
    () => bagItems?.every((item) => item.isChecked),
    [bagItems]
  );
  const hasSelectedItems = useMemo(
    () => bagItems?.some((item) => item.isChecked && item.isAvailable),
    [bagItems]
  );
  const hasAvailableItems = useMemo(
    () => bagItems?.some((item) => item.isAvailable),
    [bagItems]
  );
  const disabledClass = !hasAvailableItems ? "opacity-50 " : "";
  const navigate = useNavigate();
  const checkout = useMutation({
    mutationFn: () => Post("/bag/checklist/checkout", {}, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
      toast.success("Book has been checked out.");
      navigate("/borrowed-books?status=pending");
      queryClient.invalidateQueries(["accountStats"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const totalSelectedItem =
    bagItems?.reduce((a, i) => {
      if (i.isChecked) a++;
      return a;
    }, 0) ?? 0;

  const totalItems =
    (stats?.totalBorrowedBooks ?? 0) + (totalSelectedItem ?? 0);

  return (
    <>
      <div
        className=" flex flex-col mx-auto gap-2  "
        style={{
          maxWidth: "800px",
        }}
      >
        {totalItems > (stats?.maxAllowedBorrowedBooks ?? 0) && (
          <div className="px-2">
            <div className="alert alert-warning shadow-lg mt-5 text-sm">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  You have exceeded the maximum amount of book you can borrow.
                </span>
              </div>
            </div>
          </div>
        )}
        {(bagItems?.length ?? 0) > 0 && (
          <div className="w-full h-16 border p-5 flex justify-between mt-1 rounded">
            <div className="flex h-full items-center gap-2">
              <input
                type="checkbox"
                className="lg:w-4 lg:h-4"
                disabled={bagItems?.length === 0 || !hasAvailableItems}
                checked={
                  bagItems?.length === 0 ? false : isAllItemSelected ?? false
                }
                onChange={() => {
                  if (isAllItemSelected) {
                    updateChecklist.mutate("uncheck");
                    return;
                  }
                  updateChecklist.mutate("check");
                }}
              />

              <span className={"text-xs lg:text-sm " + disabledClass}>
                {isAllItemSelected && bagItems?.length != 0
                  ? "Unselect All"
                  : "Select All"}
              </span>
            </div>
            <div className="flex h-full items-center gap-2">
              <button
                className="text-xs lg:text-sm p-2 bg-primary text-white rounded disabled:opacity-50"
                disabled={
                  !hasSelectedItems ||
                  totalItems > (stats?.maxAllowedBorrowedBooks ?? 0)
                }
                onClick={() => {
                  openConfirmCheckoutDialog();
                }}
              >
                Checkout
              </button>
              <button
                className="text-xs lg:text-sm p-2 bg-error text-white rounded disabled:opacity-50"
                disabled={!hasSelectedItems ?? false}
                onClick={() => {
                  deleteCheckedItems.mutate();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          {bagItems?.map((item) => {
            let bookCover = "";
            if (item.book.covers.length > 0) {
              bookCover = buildS3Url(item.book.covers[0]);
            }
            const unavailableClass = !item.isAvailable ? "opacity-50 " : "";
            return (
              <div
                className="w-full h-32 rounded shadow  border border-gray-100 p-4 flex justify-between "
                style={{
                  maxWidth: "800px",
                }}
                key={item.accessionId}
              >
                <div className="flex gap-5">
                  <div className="flex items-center justify-center gap-5">
                    <div>
                      {item.isAvailable ? (
                        <input
                          type="checkbox"
                          className="lg:h-4 lg:w-4"
                          checked={item.isChecked ?? false}
                          onChange={() => {
                            checkItem.mutate(item.id ?? "");
                          }}
                        />
                      ) : (
                        <div className="h-5 w-5"></div>
                      )}
                    </div>
                    {bookCover.length > 0 ? (
                      <img
                        src={bookCover}
                        alt="book-cover"
                        className={"w-14 " + unavailableClass}
                        style={{
                          maxWidth: "120px",
                          maxHeight: "150px",
                        }}
                      />
                    ) : (
                      <div
                        className={
                          "w-14 bg-gray-300 no-cover h-20 " + unavailableClass
                        }
                        style={{
                          maxWidth: "120px",
                          maxHeight: "150px",
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-2  ">
                    <Link
                      to={`/catalog/${item.book.id}`}
                      className={
                        "text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500 " +
                        unavailableClass
                      }
                    >
                      {item.book.title}{" "}
                      {item.isEbook ? "- eBook" : `- ${item.accessionNumber}`}
                    </Link>

                    <p
                      className={
                        "text-xs md:text-sm lg:text-base text-gray-500 " +
                        unavailableClass
                      }
                    >
                      {item.book.section.name}{" "}
                      {item.book.ddc.length > 0 && `- ${item.book.ddc}`}
                      {item.book.authorNumber.length > 0 &&
                        `- ${item.book.authorNumber}`}
                    </p>
                    <p
                      className={
                        "text-xs md:text-sm lg:text-base text-gray-500 " +
                        unavailableClass
                      }
                    >
                      {item.isEbook ? "" : `${ordinal(item.copyNumber)} - Copy`}
                    </p>
                    {!item.isAvailable && (
                      <small className="text-sm text-warning">
                        Unavailable
                      </small>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-center p-2  ">
                  {
                    <BsTrashFill
                      className="lg:text-xl text-error mr-5 cursor-pointer"
                      role="button"
                      onClick={() => {
                        setSelectedItem(item);
                        openConfirmDeleteDialog();
                      }}
                    />
                  }
                </div>
              </div>
            );
          })}
        </LoadingBoundary>
      </div>
      <DangerConfirmDialog
        isOpen={isConfirmDeleteDialogOpen}
        close={closeConfirmDeleteDialog}
        title="Remove Item!"
        onConfirm={onConfirmDelete}
        text="Are you sure you want to remove book from your bag?"
      />
      <ConfirmDialog
        isOpen={isConfirmCheckoutDialogOpen}
        close={closeConfirmCheckoutDialog}
        title="Checkout Item!"
        onConfirm={onConfirmCheckout}
        text="Are you sure you want to checkout selected books?"
      />
      {bagItems?.length === 0 && (
        <div className="flex items-center flex-col gap-10 mt-24">
          <h1 className="text-2xl lg:text-4xl text-center font-bold  text-gray-400">
            YOUR BAG IS EMPTY
          </h1>
          <img src={noData} className="w-44 lg:w-72" alt="No data"></img>
          <Link to={"/catalog"} className="btn btn-primary text-sm">
            Browse Catalog
          </Link>
        </div>
      )}
    </>
  );
};

export default BagPage;
