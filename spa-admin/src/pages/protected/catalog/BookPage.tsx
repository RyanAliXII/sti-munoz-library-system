import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Book } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

const BookPage = () => {
  const fetchBooks = async () => {
    try {
      const { data: response } = await axiosClient.get("/books/");
      return response.data.books ?? [];
    } catch (error) {
      console.error(error);
    }
  };

  const { data: books } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books"],
  });
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold ">Books</h1>
      </div>
      <Table>
        <Thead>
          <HeadingRow>
            <Th>Title</Th>
            <Th>ISBN</Th>
            <Th>Copies</Th>
            <Th>Year Published</Th>
          </HeadingRow>
        </Thead>
        <Tbody>
          {books?.map((book) => {
            return (
              <BodyRow>
                <Td>{book.title}</Td>
                <Td>{book.isbn}</Td>
                <Td>{book.copies}</Td>
                <Td>{book.yearPublished}</Td>
              </BodyRow>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
};

export default BookPage;
