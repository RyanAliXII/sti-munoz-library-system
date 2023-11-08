import { useQuery } from "@tanstack/react-query";
import { Author } from "@definitions/types";
import { ChangeEvent, useMemo, useState } from "react";
import { useBookEditFormContext } from "../BookEditFormContext";
import { useRequest } from "@hooks/useRequest";
import usePaginate from "@hooks/usePaginate";
import useDebounce from "@hooks/useDebounce";

import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { CustomInput, Input } from "@components/ui/form/Input";
import CustomPagination from "@components/pagination/CustomPagination";
import { Checkbox, Table } from "flowbite-react";

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
          keyword: keyword,
          page: currentPage,
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
  const { setForm, form } = useBookEditFormContext();

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
      <CustomInput
        type="text"
        placeholder="Search"
        className="mt-3"
        onChange={handleSearch}
      />
      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <Table>
          <Table.Head>
            <Table.HeadCell></Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {authors?.map((author) => {
              const isChecked = author.id
                ? selectedCache.hasOwnProperty(author.id)
                : false;
              return (
                <Table.Row
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
                  <Table.Cell>
                    <Checkbox color="primary" readOnly checked={isChecked} />
                  </Table.Cell>
                  <Table.Cell>{author.name}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <CustomPagination
          nextLabel="Next"
          pageRangeDisplayed={5}
          pageCount={totalPages}
          disabledClassName="opacity-60 pointer-events-none"
          onPageChange={({ selected }) => {
            setCurrentPage(selected + 1);
          }}
          isHidden={totalPages <= 1}
          forcePage={currentPage - 1}
          previousLabel="Previous"
        />
      </LoadingBoundaryV2>
    </div>
  );
};

export default AuthorSelection;
