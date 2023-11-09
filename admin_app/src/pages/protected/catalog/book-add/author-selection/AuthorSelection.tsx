import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import { CustomInput } from "@components/ui/form/Input";
import TableContainer from "@components/ui/table/TableContainer";
import { Author } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import usePaginate from "@hooks/usePaginate";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { Checkbox, Table } from "flowbite-react";
import { ChangeEvent, useMemo, useState } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";

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
      <CustomInput placeholder="Search" onChange={handleSearch}></CustomInput>
      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <TableContainer>
          <Table className="w-full border-b-0">
            <Table.Head>
              <Table.HeadCell>Action</Table.HeadCell>
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
                    color="primary"
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
                    <Table.Cell>
                      <div className=" font-semibold text-gray-900 dark:text-white">
                        {author.name}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </TableContainer>
        <div className="mt-3">
          <CustomPagination
            nextLabel="Next"
            pageRangeDisplayed={-5}
            pageCount={totalPages}
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            forcePage={currentPage - 1}
            isHidden={totalPages <= 1}
            previousLabel="Previous"
            renderOnZeroPageCount={null}
          />
        </div>
      </LoadingBoundaryV2>
    </div>
  );
};

export default AuthorSelection;
