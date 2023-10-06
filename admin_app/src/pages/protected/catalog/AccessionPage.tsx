import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
  HeadingRow,
  Th,
  Table,
  Thead,
  Tbody,
  BodyRow,
  Td,
} from "@components/ui/table/Table";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { DetailedAccession } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import ReactPaginate from "react-paginate";
import { useSearchParams } from "react-router-dom";
import usePaginate from "@hooks/usePaginate";
import { ChangeEvent, useEffect, useState } from "react";
import useDebounce from "@hooks/useDebounce";

const AccessionPage = () => {
  const { Get } = useRequest();
  const [params, setUrlSearchParams] = useSearchParams();
  const initCurrentPage = () => {
    const page = params.get("page");
    if (!page) {
      return 1;
    }
    const parsedPage = parseInt(page);
    if (isNaN(parsedPage)) {
      return 1;
    }
    if (parsedPage <= 0) {
      return 1;
    }
    return parsedPage;
  };

  const { currentPage, totalPages, setTotalPages, setCurrentPage } =
    usePaginate({
      initialPage: initCurrentPage,
      numberOfPages: 1,
    });
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  useEffect(() => {
    setUrlSearchParams({ page: currentPage.toString() });
  }, [currentPage]);

  const searchDebounce = useDebounce();
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setSearchKeyword(event.target.value);
        setCurrentPage(1);
      },
      null,
      500
    );
  };
  const fetchAccessions = async () => {
    try {
      const { data: response } = await Get(
        "/books/accessions",
        {
          params: {
            page: currentPage,
            keyword: searchKeyword,
          },
        },
        [apiScope("Accession.Read")]
      );

      if (response?.data?.metadata) {
        setTotalPages(response?.data?.metadata?.pages ?? 1);
      }
      return response?.data?.accessions ?? [];
    } catch {
      return [];
    }
  };
  const {
    data: accessions,
    isFetching,
    isError,
  } = useQuery<DetailedAccession[]>({
    queryFn: fetchAccessions,
    queryKey: ["accessions", currentPage, searchKeyword],
  });
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Accession</h1>
      </ContainerNoBackground>
      <ContainerNoBackground>
        <div className="lg:flex gap-2">
          <Input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
          ></Input>
          <div className="w-full lg:w-5/12  mb-4 ">
            <CustomSelect placeholder="Section" />
          </div>
        </div>
      </ContainerNoBackground>
      <LoadingBoundary isError={isError} isLoading={isFetching}>
        <Container className="p-0 lg:p-0">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Accession Number</Th>
                <Th>Book Title</Th>
                <Th>Section</Th>
                <Th>Year Published</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {accessions?.map((accession) => {
                return (
                  <BodyRow key={accession.id}>
                    <Td>{accession.number}</Td>
                    <Td>{accession.book.title}</Td>
                    <Td>{accession.book.section.name}</Td>
                    <Td>{accession.book.yearPublished}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </Container>
        <ContainerNoBackground>
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            forcePage={currentPage - 1}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            className={paginationClass}
            previousLabel="Previous"
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </ContainerNoBackground>
      </LoadingBoundary>
    </>
  );
};

export default AccessionPage;
