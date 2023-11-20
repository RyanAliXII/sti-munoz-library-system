import { buildS3Url } from "@definitions/s3";
import { useBookView } from "@hooks/data-fetching/book";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiFillCalendar } from "react-icons/ai";
import { MdPublish } from "react-icons/md";
import { RiPagesLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CatalogBookView = () => {
  const { Post } = useRequest();
  const navigate = useNavigate();

  const { data: bookView } = useBookView({
    onError: () => {
      navigate("/404");
    },
  });
  const authors = bookView?.book?.authors.map((author) => author.name);
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
      queryClient.invalidateQueries(["book"]);
    },
  });

  const isAddToBagDisable =
    !bookView?.status.isAvailable ||
    bookView?.status.isAlreadyBorrowed ||
    bookView.status.isAlreadyInBag;
  const isPlaceHoldDisable =
    bookView?.status.isAlreadyBorrowed ||
    bookView?.status.isInQueue ||
    bookView?.status.isAvailable;
  const initializeItem = () => {
    const availableAccession = bookView?.book.accessions.find(
      (accession) => accession.isAvailable
    );
    if (!availableAccession) return;
    addItemToBag.mutate({ accessionId: availableAccession.id });
  };
  const placeHold = useMutation({
    mutationFn: () =>
      Post(
        "/borrowing/queues",
        { bookId: bookView?.book?.id ?? "" },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      toast.success("Book has been placed on hold.");
      queryClient.invalidateQueries(["book"]);
    },
    onError: () => {
      toast.error("Unknown error occured");
    },
  });
  const initHold = () => {
    placeHold.mutate();
  };

  if (!bookView?.book) return null;
  let bookCover = "";
  if ((bookView?.book.covers.length ?? 0) > 0) {
    bookCover = buildS3Url(bookView?.book.covers[0]);
  }

  return (
    <>
      <div className="min-h-screen p-5">
        <div className="w-11/12 md:w-8/12 rounded mx-auto flex flex-col md:flex-row gap-5 py-10">
          <div className="flex  flex-col  rounded">
            {bookCover.length > 1 ? (
              <img
                src={bookCover}
                className="w-44 object-scale-down"
                style={{ maxHeight: "269px", maxWidth: "220px" }}
                alt="bookView?.book-image"
              ></img>
            ) : (
              <div
                className="w-44 h-60 flex items-center justify-center bg-gray-100 "
                style={{ maxHeight: "269px", maxWidth: "220px" }}
              >
                <small className="font-bold">NO COVER</small>
              </div>
            )}
            <div className="flex flex-col gap-2 py-2">
              <button
                className="btn btn-primary w-full "
                disabled={addItemToBag.isLoading || isAddToBagDisable}
                onClick={initializeItem}
              >
                Add to Bag
              </button>
              <button
                className="btn btn-outline w-full"
                onClick={initHold}
                disabled={isPlaceHoldDisable}
              >
                Place Hold
              </button>
            </div>
          </div>
          <div>
            <div>
              <h1 className="font-bold text-3xl">{bookView?.book?.title}</h1>
              <h2 className="text-2xl text-gray-600">
                {bookView.book.subject}
              </h2>
              {(authors?.length ?? 0) > 0 && (
                <span>By {authors?.join(",")} </span>
              )}
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: bookView?.book?.description ?? "",
              }}
            ></p>
            <div className="mt-5">
              <h2 className="text-lg font-bold">Overview</h2>
              <div className="w-full h-20 flex gap-2 items-center p-2">
                <div>
                  <RiPagesLine className="text-4xl" />
                </div>
                <div>
                  <span className="block">{bookView?.book?.pages}</span>
                  <small>Pages</small>
                </div>
              </div>
              <div className="w-full h-20 flex gap-2 items-center p-2">
                <div>
                  <MdPublish className="text-4xl" />
                </div>
                <div>
                  <span className="block">
                    {bookView?.book?.publisher.name}
                  </span>
                  <small>Publisher</small>
                </div>
              </div>
              <div className="w-full h-20 flex gap-2 items-center p-2">
                <div>
                  <AiFillCalendar className="text-4xl" />
                </div>
                <div>
                  <span className="block">{bookView?.book?.yearPublished}</span>
                  <small>Publish Date</small>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-lg font-bold">Book Details</h2>
              <div className="p-2 flex flex-col gap-3">
                {bookView?.book?.isbn.length > 0 && (
                  <div className="grid grid-cols-2">
                    <div>ISBN</div>
                    <div>{bookView?.book?.isbn}</div>
                  </div>
                )}
                {bookView?.book?.isbn.length > 0 && (
                  <div className="grid grid-cols-2">
                    <div>DDC</div>
                    <div>{bookView?.book?.ddc}</div>
                  </div>
                )}
                {bookView?.book?.authorNumber.length > 0 && (
                  <div className="grid grid-cols-2">
                    <div>Author Number</div>
                    <div>{bookView?.book?.authorNumber}</div>
                  </div>
                )}
                <div className="grid grid-cols-2">
                  <div>Section</div>
                  <div>{bookView?.book?.section.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogBookView;
