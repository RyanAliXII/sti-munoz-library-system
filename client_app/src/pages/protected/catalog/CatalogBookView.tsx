import { BookInitialValue } from "@definitions/defaults";
import { buildS3Url } from "@definitions/s3";

import { BagItem, Book, DetailedAccession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AiFillCalendar } from "react-icons/ai";
import { MdPublish } from "react-icons/md";
import { RiPagesLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";

import BookCopySelectionModal from "./BookCopySelectionModal";
import { useSwitch } from "@hooks/useToggle";
import { toast } from "react-toastify";
import { useMemo } from "react";

const CatalogBookView = () => {
  const { id } = useParams();
  const { Get, Post } = useRequest();

  const fetchBookById = async () => {
    const { data: response } = await Get(`/books/${id}`, {});
    return response?.data?.book ?? BookInitialValue;
  };
  const navigate = useNavigate();
  const { data: book } = useQuery<Book>({
    queryFn: fetchBookById,
    queryKey: ["book"],
    retry: false,
    onError: () => {
      navigate("/404");
    },
  });

  const {
    close: closeCopySelection,
    isOpen: isCopySelectionOpen,
    open: openCopySelection,
  } = useSwitch();

  const authors = book?.authors.map((author) => author.name);

  const queryClient = useQueryClient();
  const addItemToBag = useMutation({
    mutationFn: (item: { accessionId?: string; bookId?: string }) =>
      Post("/bag/", item, {}),
    onSuccess: () => {
      toast.success("Item has been added to bag.");
      queryClient.invalidateQueries(["bagItems"]);
    },
    onError: () => {
      toast.error("Unknown error occurred. Please try again later.");
    },
    onSettled: () => {
      closeCopySelection();
    },
  });

  const fetchBagItems = async () => {
    try {
      const response = await Get("/bag/", {});
      const { data } = response.data;
      return data?.bag ?? [];
    } catch (error) {
      return [];
    }
  };

  const onSelectCopy = (value: DetailedAccession | string) => {
    if (typeof value === "string") {
      addItemToBag.mutate({ bookId: value });
      return;
    }
    addItemToBag.mutate({ accessionId: value.id ?? "" });
  };
  const { data: bagItems } = useQuery<BagItem[]>({
    queryFn: fetchBagItems,
    queryKey: ["bagItems"],
    refetchOnWindowFocus: false,
  });
  const bagItemsIds = useMemo(
    () => bagItems?.map((item) => item.accessionId ?? "") ?? [],
    [bagItems]
  );
  const isBookAvailable = book?.accessions.some((a) => a.isAvailable === true);
  const isBookCopiesAlreadyOnTheBag = book?.accessions.every((a) =>
    bagItemsIds.includes(a.id ?? "")
  );
  const initializeItem = () => {
    if (
      ((book?.accessions?.length ?? 1) > 1 &&
        isBookAvailable &&
        !isBookCopiesAlreadyOnTheBag) ||
      (book?.ebook ?? "").length > 0
    ) {
      openCopySelection();
    } else {
      const accession = book?.accessions[0];
      if (
        !bagItemsIds.includes(accession?.id ?? "") &&
        isBookAvailable &&
        !isBookCopiesAlreadyOnTheBag
      ) {
        addItemToBag.mutate({ accessionId: accession?.id ?? "" });
      } else {
        toast.info("Item already is already on your bag.");
      }
    }
  };
  if (!book) return null;
  let bookCover = "";
  if ((book.covers.length ?? 0) > 0) {
    bookCover = buildS3Url(book.covers[0]);
  }
  return (
    <>
      <div className="min-h-screen mt-3">
        <div className="w-11/12 md:w-8/12 lg:w-5/12 rounded shadow border mx-auto p-4">
          <div className="w-full flex justify-center bg-gray-100 p-2 rounded">
            {bookCover.length > 1 ? (
              <img
                src={bookCover}
                className="w-44 object-scale-down"
                style={{ maxHeight: "269px", maxWidth: "220px" }}
                alt="book-image"
              ></img>
            ) : (
              <div
                className="w-44 h-60 flex items-center justify-center "
                style={{ maxHeight: "269px", maxWidth: "220px" }}
              >
                <small className="font-bold">NO COVER</small>
              </div>
            )}
          </div>
          <div className="mt-5">
            <h1 className="font-bold text-3xl">{book?.title}</h1>
            {(authors?.length ?? 0) > 0 && (
              <span>By {authors?.join(",")} </span>
            )}
          </div>
          <div className="w-full mt-2">
            <button
              className="btn btn-primary  w-full"
              disabled={
                (!isBookAvailable || isBookCopiesAlreadyOnTheBag) &&
                book.ebook.length === 0
              }
              onClick={initializeItem}
            >
              Add to Bag
            </button>
          </div>
          <div className="mt-5">
            <h2 className="text-lg font-bold">Overview</h2>
            <div className="w-full h-20 flex gap-2 items-center p-2">
              <div>
                <RiPagesLine className="text-4xl" />
              </div>
              <div>
                <span className="block">{book?.pages}</span>
                <small>Pages</small>
              </div>
            </div>
            <div className="w-full h-20 flex gap-2 items-center p-2">
              <div>
                <MdPublish className="text-4xl" />
              </div>
              <div>
                <span className="block">{book?.publisher.name}</span>
                <small>Publisher</small>
              </div>
            </div>
            <div className="w-full h-20 flex gap-2 items-center p-2">
              <div>
                <AiFillCalendar className="text-4xl" />
              </div>
              <div>
                <span className="block">{book?.yearPublished}</span>
                <small>Publish Date</small>
              </div>
            </div>
          </div>
          <p dangerouslySetInnerHTML={{ __html: book?.description ?? "" }}></p>
          <div className="mt-5">
            <h2 className="text-lg font-bold">Book Details</h2>
            <div className="p-2 flex flex-col gap-3">
              {book?.isbn.length > 0 && (
                <div className="grid grid-cols-2">
                  <div>ISBN</div>
                  <div>{book?.isbn}</div>
                </div>
              )}
              {book?.isbn.length > 0 && (
                <div className="grid grid-cols-2">
                  <div>DDC</div>
                  <div>{book?.ddc}</div>
                </div>
              )}
              {book?.authorNumber.length > 0 && (
                <div className="grid grid-cols-2">
                  <div>Author Number</div>
                  <div>{book?.authorNumber}</div>
                </div>
              )}
              <div className="grid grid-cols-2">
                <div>Section</div>
                <div>{book?.section.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BookCopySelectionModal
        book={book ?? BookInitialValue}
        isOpen={isCopySelectionOpen}
        closeModal={closeCopySelection}
        bagItemIds={bagItemsIds}
        onSelectCopy={onSelectCopy}
      />
    </>
  );
};

export default CatalogBookView;
