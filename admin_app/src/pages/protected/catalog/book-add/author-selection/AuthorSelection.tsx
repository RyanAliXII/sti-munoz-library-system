import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { useQuery } from "@tanstack/react-query";
import { Author } from "@definitions/types";
import { ChangeEvent, useMemo, useState } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";
import { useRequest } from "@hooks/useRequest";
import usePaginate from "@hooks/usePaginate";
import ReactPaginate from "react-paginate";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { Input } from "@components/ui/form/Input";
import useDebounce from "@hooks/useDebounce";

const AuthorSelection = () => {
  const { Get } = useRequest();
  const [keyword, setKeyword] = useState("");
  const { currentPage, totalPages, setTotalPages, setCurrentPage } =
    usePaginate({
      useURLParamsAsState: false,
      initialPage: 1,
      numberOfPages: 1,
    });
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get("/authors/", {
        params: {
          pages: currentPage,
          keyword: keyword,
        },
      });
      if (response?.data?.metaData) {
        setTotalPages(response?.data?.metaData.pages ?? 1);
      }
      return response?.data?.authors ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const { setForm, form } = useBookAddFormContext();

  const {
    data: authors,
    isFetching,
    isError,
  } = useQuery<Author[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors", currentPage, keyword],
  });
  const selectAuthor = (author: Author) => {
    setForm((prev) => ({ ...prev, authors: [...prev.authors, author] }));
  };
  const removeAuthor = (author: Author) => {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a.id != author.id) ?? [],
    }));
  };

  const selectedCache = useMemo(
    () =>
      form.authors.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors]
  );
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center mt-4";
  const searchDebounce = useDebounce();
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setKeyword(event.target.value);
        setCurrentPage(1);
      },
      "",
      500
    );
  };
  return (
    <div>
      <Input
        type="text"
        placeholder="Search"
        className="mt-3"
        onChange={handleSearch}
      />
      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <Table className="w-full border-b-0">
          <Thead>
            <HeadingRow>
              <Th></Th>
              <Th>Name</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {authors?.map((author) => {
              const isChecked = author.id
                ? selectedCache.hasOwnProperty(author.id)
                : false;
              return (
                <BodyRow
                  key={author.id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!isChecked) {
                      selectAuthor(author);
                      return;
                    }
                    removeAuthor(author);
                  }}
                >
                  <Td>
                    <input
                      type="checkbox"
                      readOnly
                      checked={isChecked}
                      className="h-4 w-4 border"
                    />
                  </Td>
                  <Td>{author.name}</Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
        <ReactPaginate
          nextLabel="Next"
          pageLinkClassName="border px-3 py-0.5  text-center rounded"
          pageRangeDisplayed={5}
          pageCount={totalPages}
          disabledClassName="opacity-60 pointer-events-none"
          onPageChange={({ selected }) => {
            setCurrentPage(selected + 1);
          }}
          forcePage={currentPage - 1}
          className={paginationClass}
          previousLabel="Previous"
          previousClassName="px-2 border text-gray-500 py-1 rounded"
          nextClassName="px-2 border text-blue-500 py-1 rounded"
          renderOnZeroPageCount={null}
          activeClassName="border-none bg-blue-500 text-white rounded"
        />
      </LoadingBoundaryV2>
    </div>
  );
};

export default AuthorSelection;
