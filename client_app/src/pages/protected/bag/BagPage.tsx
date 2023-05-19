import { buildS3Url } from "@definitions/s3";
import { BagItem } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BsTrashFill } from "react-icons/bs";
import { Link } from "react-router-dom";
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
const BagPage = () => {
  const { Get, Delete, Patch, Post } = useRequest();
  const fetchBagItems = async () => {
    try {
      const response = await Get("/circulation/bag", {}, [
        apiScope("Bag.Read"),
      ]);
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
    refetchOnWindowFocus: false,
  });
  const [selectedItem, setSelectedItem] = useState<BagItem>();

  const queryClient = useQueryClient();
  const deleteItemFromBag = useMutation({
    mutationFn: () =>
      Delete(`/circulation/bag/${selectedItem?.id}`, {}, [
        apiScope("Bag.Delete"),
      ]),
    onSuccess: () => {
      toast.success("Book has been removed.");
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
      Patch(`/circulation/bag/${id}/checklist`, {}, {}, [apiScope("Bag.Edit")]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const updateChecklist = useMutation({
    mutationFn: (action: "check" | "uncheck") =>
      Patch(`/circulation/bag/checklist?action=${action}`, {}, {}, [
        apiScope("Bag.Edit"),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const deleteCheckedItems = useMutation({
    mutationFn: () =>
      Delete("/circulation/bag/checklist", {}, [apiScope("Bag.Delete")]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });
  const isAllItemSelected = useMemo(
    () => bagItems?.every((item) => item.isChecked == true),
    [bagItems]
  );
  const hasSelectedItems = useMemo(
    () => bagItems?.some((item) => item.isChecked == true),
    [bagItems]
  );

  const checkout = useMutation({
    mutationFn: () =>
      Post("/circulation/checklist/checkout", {}, {}, [
        apiScope("Book.Checkout"),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later.");
    },
  });

  return (
    <>
      <div
        className=" flex flex-col mx-auto gap-2"
        style={{
          maxWidth: "800px",
        }}
      >
        <div className="w-full h-16 border p-5 flex justify-between">
          <div className="flex h-full items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              disabled={bagItems?.length === 0}
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
            <span>
              {isAllItemSelected && bagItems?.length != 0
                ? "Unselect All"
                : "Select All"}
            </span>
          </div>
          <div className="flex h-full items-center gap-2">
            <button
              className="btn btn-primary"
              disabled={!hasSelectedItems}
              onClick={() => {
                openConfirmCheckoutDialog();
              }}
            >
              Checkout
            </button>
            <button
              className="btn btn-error btn-outline"
              disabled={!hasSelectedItems ?? false}
              onClick={() => {
                deleteCheckedItems.mutate();
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          {bagItems?.map((item) => {
            let bookCover;
            if (item.book.covers.length > 0) {
              bookCover = buildS3Url(item.book.covers[0]);
            } else {
              bookCover =
                "https://media.istockphoto.com/id/1357365823/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=PM_optEhHBTZkuJQLlCjLz-v3zzxp-1mpNQZsdjrbns=";
            }

            return (
              <div
                className="w-full h-44 rounded shadow  md:h-60 lg:h-64 border border-gray-100 p-4 flex justify-between"
                style={{
                  maxWidth: "800px",
                }}
                key={item.accessionId}
              >
                <div className="flex gap-5">
                  <div className="flex items-center justify-center gap-5">
                    <div>
                      <input
                        type="checkbox"
                        className="h-6 w-6"
                        checked={item.isChecked ?? false}
                        onChange={() => {
                          checkItem.mutate(item.id ?? "");
                        }}
                      />
                    </div>
                    <img
                      src={bookCover}
                      className="w-28 md:w-44 lg:w-56"
                      style={{
                        maxWidth: "120px",
                        maxHeight: "150px",
                      }}
                    ></img>
                  </div>
                  <div className="flex flex-col justify-center p-2  ">
                    <Link
                      to={`/catalog/${item.book.id}`}
                      className="text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500"
                    >
                      {item.book.title}
                    </Link>

                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                      {item.book.section.name} - {item.book.ddc} -{" "}
                      {item.book.authorNumber}
                    </p>
                    <p className="text-xs md:text-sm lg:text-base text-gray-500">
                      {ordinal(item.copyNumber)} - Copy
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-2  ">
                  <BsTrashFill
                    className="text-xl text-error mr-5 cursor-pointer"
                    role="button"
                    onClick={() => {
                      setSelectedItem(item);
                      openConfirmDeleteDialog();
                    }}
                  />
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
    </>
  );
};

export default BagPage;
