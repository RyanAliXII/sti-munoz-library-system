import { Card, Badge, Button } from "flowbite-react";
import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import { Link } from "react-router-dom";
import useWindowDimensions from "@hooks/useWindowDimensions";
import { size } from "lodash";


const BookImage = ({cover}:{
  cover: string | undefined
})=>{
  if(!cover){
    return (
      <div className="flex justify-center p-2">
      <div style={{
        
      }} className="bg-gray-200 w-full h-44 dark:bg-gray-900  md:h-52 lg:h-56 xl:h-64"></div>
      </div>
    )
  }
  return (
    <div className="flex justify-center p-2">
    <img 
    className="max-w-44 max-h-44 md:max-w-52 md:max-h-52 lg:max-w-56 lg:max-h-56 xl:max-w-64 xl:max-h-64" loading="lazy"  src={cover} alt="book-cover" />
    </div>  
  )
}
const BookCard = ({ book }:{book: Book}) => {
  const bookCover = book.covers.length > 0 ? buildS3Url(book.covers[0]) : undefined;
  const isEbook = book.ebook.length > 0;
  const isAvailable = book.accessions.some((a) => a.isAvailable);
  const authors = book.authors.map((author) => author.name).join(", ");
  
  const {width} = useWindowDimensions();
  const LARGE_SCREEN = 1024// 1024 px
  console.log(width)
  const seeMoreBtnSize = (width ?? 0)  >=  LARGE_SCREEN ? "sm" : "xs"
  console.log(seeMoreBtnSize)
  return (
    <Card
    key={book.id}
    renderImage={() => <BookImage cover={bookCover}/>}
    className="w-full"
   
  >
  <div className="w-full p-5">
    <Link to={`/catalog/${book.id}`}>
    <h5 className="text-sm md:text-base lg:text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
      {book.title}
    </h5>
  </Link>
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
        <Button as={Link} to={`/catalog/${book.id}`}  className="w-full" color="blue" size={seeMoreBtnSize}>See More</Button>
      </div>
      </div>
      </div>
  </Card>
  );
};

export default BookCard;
