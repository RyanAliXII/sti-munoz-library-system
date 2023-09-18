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
import { apiScope } from "@definitions/configs/msal/scopes";
import noData from "@assets/images/no-data.svg";
const BagPage = () => {
  const { Get, Delete, Patch, Post } = useRequest();
  const fetchBagItems = async () => {
    try {
      const response = await Get("/bag/", {}, [apiScope("Bag.Read")]);
      const { data } = response.data;
      return data?.bag ?? [];
    } catch (error) {
      return [];
    }
  };
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
    mutationFn: () =>
      Delete(`/bag/${selectedItem?.id}`, {}, [apiScope("Bag.Delete")]),
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
    mutationFn: (id: string) =>
      Patch(`/bag/${id}/checklist`, {}, {}, [apiScope("Bag.Edit")]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const updateChecklist = useMutation({
    mutationFn: (action: "check" | "uncheck") =>
      Patch(`/bag/checklist?action=${action}`, {}, {}, [apiScope("Bag.Edit")]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const deleteCheckedItems = useMutation({
    mutationFn: () => Delete("/bag/checklist", {}, [apiScope("Bag.Delete")]),
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
    mutationFn: () =>
      Post("/bag/checklist/checkout", {}, {}, [apiScope("Book.Checkout")]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
      toast.success("Book has been checked out.");
      navigate("/borrowed-books?status=pending");
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });

  return (
    <>
      <div
        className=" flex flex-col mx-auto gap-2  "
        style={{
          maxWidth: "800px",
        }}
      >
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
                disabled={!hasSelectedItems}
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
                      {item.book.title}
                    </Link>

                    <p
                      className={
                        "text-xs md:text-sm lg:text-base text-gray-500 " +
                        unavailableClass
                      }
                    >
                      {item.book.section.name} - {item.book.ddc} -{" "}
                      {item.book.authorNumber}
                    </p>
                    <p
                      className={
                        "text-xs md:text-sm lg:text-base text-gray-500 " +
                        unavailableClass
                      }
                    >
                      {ordinal(item.copyNumber)} - Copy
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
