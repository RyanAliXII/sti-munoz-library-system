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
import { ChangeEvent, useState } from "react";
import useDebounce from "@hooks/useDebounce";
import { useSearchParamsState } from "react-use-search-params-state";

const AccessionPage = () => {
  const { Get } = useRequest();

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const searchDebounce = useDebounce();
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setFilterParams({ page: 1, keyword: event.target.value });
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
            page: filterParams?.page,
            keyword: filterParams?.keyword,
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
    queryKey: ["accessions", filterParams],
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
            defaultValue={filterParams?.keyword}
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
            forcePage={filterParams?.page - 1}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setFilterParams({ page: selected + 1 });
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
