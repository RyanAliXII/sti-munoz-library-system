import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { RiFilter3Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const Catalog = () => {
  const { Get } = useRequest();

  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", {}, [
        apiScope("Book.Read"),
      ]);
      return response?.data?.books ?? [];
    } catch {
      return [];
    }
  };
  const { data: books } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books"],
  });
  const alertDev = () => {
    window.alert("Feature still in development.");
  };
  return (
    <div className="w-full  flex flex-col items-center mt-5 gap-3">
      <div
        className="w-11/12 md:w-7/12 lg:w-6/12 flex gap-2"
        style={{
          maxWidth: "800px",
        }}
      >
        <input type="text" className="input input-bordered flex-1"></input>
        <button
          type="button"
          className="bg-primary text-sm py-1 px-3 lg:px-5 rounded text-base-100"
        >
          Search
        </button>
      </div>
      <div
        className="w-11/12 md:w-7/12 lg:w-6/12 flex gap-2"
        style={{
          maxWidth: "800px",
        }}
      >
        <span
          className="py-2 px-5 border rounded-full text-xs md:text-sm cursor-pointer flex gap-1 items-center text-gray-500"
          onClick={alertDev}
        >
          <RiFilter3Fill />
          Filter
        </span>
        <span
          className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer  text-blue-500 bg-blue-100"
          onClick={alertDev}
        >
          Thesis
        </span>
        <span
          className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer   text-blue-500 border-blue-100 border"
          onClick={alertDev}
        >
          Filipiniana
        </span>
        <span
          className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer  text-blue-500 border-blue-100 border hidden md:block"
          onClick={alertDev}
        >
          Reference
        </span>
      </div>

      {books?.map((book) => {
        let bookCover;
        if (book.covers.length > 0) {
          bookCover = buildS3Url(book.covers[0]);
        }
        const peopleAuthors = book?.authors.people?.map(
          (author) => `${author.givenName} ${author.surname}`
        );
        const orgAuthors = book?.authors.organizations?.map((org) => org.name);
        const publisherAuthors = book?.authors.publishers.map((p) => p.name);
        const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
        const isBookAvailable = book.accessions.some(
          (a) => a.isAvailable === true
        );

        return (
          <div
            className="w-11/12 md:w-7/12 lg:w-6/12 h-44 rounded shadow  md:h-60 lg:h-64 border border-gray-100 p-4 flex gap-5"
            style={{
              maxWidth: "800px",
            }}
            key={book.id}
          >
            <div className="flex items-center justify-center">
              <img
                src={bookCover}
                alt="book-cover"
                className="w-28 md:w-44 lg:w-56 object-scale-down"
                style={{
                  maxWidth: "120px",
                  maxHeight: "150px",
                }}
              ></img>
            </div>
            <div className="flex flex-col justify-center p-2  ">
              <Link
                to={`/catalog/${book.id}`}
                className="text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500"
              >
                {book.title}
              </Link>
              <p className="text-xs md:text-sm lg:text-base">
                by {authors.join(",")}
              </p>
              <p className="text-xs md:text-sm lg:text-base text-gray-500">
                Published in {book.yearPublished}
              </p>
              <p className="text-xs md:text-sm lg:text-base text-gray-500">
                {book.section.name} - {book.ddc} - {book.authorNumber}
              </p>
              {isBookAvailable && (
                <p className="text-xs md:text-sm text-success">Available</p>
              )}
              {!isBookAvailable && (
                <p className="text-xs md:text-sm text-warning">Unavailable</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Catalog;
