import { Card, Badge, Button } from "flowbite-react";
import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import { Link } from "react-router-dom";

const BookCard = ({ book }:{book: Book}) => {
  const bookCover = book.covers.length > 0 ? buildS3Url(book.covers[0]) : undefined;
  const isEbook = book.ebook.length > 0;
  const isAvailable = book.accessions.some((a) => a.isAvailable);
  const authors = book.authors.map((author) => author.name).join(", ");

  return (
    <Card
    key={book.id}
    imgAlt={book.title}
    imgSrc={bookCover}
    className="w-full"
   
  >
  <div className="w-full">
    <a href="#">
    <h5 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
      {book.title}
    </h5>
  </a>
  {authors.length > 0 && (
        <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 text-nowrap">
          {authors}
        </p>
    )}
  <p className="text-xs md:text-sm lg:text-base text-gray-500 dark:text-gray-400">
        Published in {book.yearPublished}
  </p>
<div className="mt-2">
  {(isAvailable || book.ebook.length > 0) && (
        <div>
          <p className="text-xs md:text-sm text-green-500 font-semibold">
            Available
          </p>
          {isEbook && (
            <span className="badge text-xs bg-primary border-none">
              Ebook
            </span>
          )}
        </div>
      )}
      {!isAvailable && book.ebook.length == 0 && (
        <div>
          <Badge color="primary" className="text-xs">
            Unavailable
          </Badge>
          {isEbook && (
            <Badge color="primary" className="text-xs">
              Ebook
            </Badge>
          )}
        </div>
      )}
      {book.section.isNonCirculating && (
        <div>
          <Badge color="primary" className="text-xs">
            Non-circulating
          </Badge>
        </div>
      )}
      <div className="mt-2">
        <Button as={Link} to={`/catalog/${book.id}`}  className="w-full" color="blue" size="sm">See More</Button>
      </div>
      </div>
      </div>
  </Card>
  );
};

export default BookCard;
