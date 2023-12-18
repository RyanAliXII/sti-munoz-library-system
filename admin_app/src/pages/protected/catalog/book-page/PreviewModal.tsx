import { buildS3Url } from "@definitions/configs/s3";
import { Book, ModalProps } from "@definitions/types";
import { Modal, useThemeMode } from "flowbite-react";
import { FC } from "react";
import { AiFillCalendar } from "react-icons/ai";
import { MdPublish } from "react-icons/md";
import { RiPagesLine } from "react-icons/ri";
import DOMPurify from "dompurify";
interface PreviewModalProps extends ModalProps {
  book: Book;
}
const PreviewModal: FC<PreviewModalProps> = ({ isOpen, closeModal, book }) => {
  if (!book || !isOpen) return null;
  let bookCover = "";
  if ((book.covers.length ?? 0) > 0) {
    bookCover = buildS3Url(book.covers[0]);
  }
  const authors = book?.authors.map((author) => author.name);
  const sanitizedDesc = DOMPurify.sanitize(book.description);
  const [mode] = useThemeMode();

  return (
    <Modal
      show={isOpen}
      onClose={closeModal}
      size="7xl"
      position="top-center"
      dismissible
    >
      <Modal.Header>Preview of Book : {book.title} </Modal.Header>
      <Modal.Body className="small-scroll">
        <div
          className="w-11/12 rounded mx-auto flex flex-col md:flex-row gap-5 py-10 dark"
          style={{
            maxHeight: "800px",
          }}
        >
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
          </div>
          <div>
            <div>
              <h1
                className={`font-bold text-3xl ${
                  mode === "dark" ? "text-white" : ""
                }`}
              >
                {book?.title}
              </h1>
              <h2
                className={`text-2xl  ${
                  mode === "dark" ? "!text-gray-200" : "text-gray-600"
                }`}
              >
                {book.subject}
              </h2>
              {(authors?.length ?? 0) > 0 && (
                <span className={` ${mode === "dark" ? "!text-gray-300" : ""}`}>
                  By {authors?.join(",")}{" "}
                </span>
              )}
            </div>
            <div
              className={`mt-2 ${mode === "dark" ? "!text-gray-300" : ""}`}
              dangerouslySetInnerHTML={{
                __html: sanitizedDesc,
              }}
            ></div>
            <div className={`mt-5 ${mode === "dark" ? "!text-gray-100" : ""}`}>
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

            <div className={`mt-5 ${mode === "dark" ? "!text-gray-100" : ""}`}>
              <h2 className="text-lg font-bold">Book Details</h2>
              <div className="p-2 flex flex-col gap-3">
                {book?.isbn.length > 0 && (
                  <div className="grid grid-cols-2">
                    <div>ISBN</div>
                    <div>{book?.isbn}</div>
                  </div>
                )}
                {book?.ddc.length > 0 && (
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
      </Modal.Body>
    </Modal>
  );
};

export default PreviewModal;
