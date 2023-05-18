import { BookInitialValue } from "@definitions/defaults";
import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { AiFillCalendar } from "react-icons/ai";
import { MdPublish } from "react-icons/md";
import { RiPagesLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import BookCopySelectionModal from "./BookCopySelectionModal";
import { useSwitch } from "@hooks/useToggle";

const CatalogBookView = () => {
  const { id } = useParams();
  const { Get } = useRequest();
  const fetchBookById = async () => {
    const { data: response } = await Get(`/books/${id}`);
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
  const peopleAuthors = book?.authors.people?.map(
    (author) => `${author.givenName} ${author.surname}`
  );
  const orgAuthors = book?.authors.organizations?.map((org) => org.name);
  const publisherAuthors = book?.authors.publishers.map((p) => p.name);
  const authors = [
    ...(peopleAuthors ?? []),
    ...(orgAuthors ?? []),
    ...(publisherAuthors ?? []),
  ];

  const reserve = () => {
    openCopySelection();
  };
  const bookImg =
    (book?.covers?.length ?? 0) > 0
      ? buildS3Url(book?.covers?.[0] ?? "")
      : "https://media.istockphoto.com/id/1357365823/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=PM_optEhHBTZkuJQLlCjLz-v3zzxp-1mpNQZsdjrbns=";
  return (
    <>
      <div className="min-h-screen">
        <div className=" w-11/12 md:w-8/12 lg:w-5/12 rounded shadow border mx-auto p-4">
          <div className="w-full flex justify-center">
            <img
              src={bookImg}
              className="w-44"
              style={{ maxHeight: "269px", maxWidth: "220px" }}
              alt="book-image"
            ></img>
          </div>
          <div className="mt-5">
            <h1 className="font-bold  text-3xl">{book?.title}</h1>
            <span>By {authors.join(",")} </span>
          </div>
          <div className="w-full mt-2">
            <button className="btn btn-primary w-full mb-2">Checkout</button>
            <button
              className="btn btn-primary btn-outline w-full"
              onClick={reserve}
            >
              Reserve
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
              <div className="grid grid-cols-2">
                <div>ISBN</div>
                <div>{book?.isbn}</div>
              </div>
              <div className="grid grid-cols-2">
                <div>DDC</div>
                <div>{book?.ddc}</div>
              </div>
              <div className="grid grid-cols-2">
                <div>Author Number</div>
                <div>{book?.authorNumber}</div>
              </div>
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
      />
    </>
  );
};

export default CatalogBookView;
