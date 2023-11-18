import CustomSelect from "@components/ui/form/CustomSelect";
import { CustomInput } from "@components/ui/form/Input";
import Container from "@components/ui/container/Container";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import TableContainer from "@components/ui/table/TableContainer";
import { DetailedAccession } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { Table } from "flowbite-react";
import { ChangeEvent, useState } from "react";
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
      const { data: response } = await Get("/books/accessions", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });

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
      <Container>
        <div className="lg:flex gap-2">
          <CustomInput
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          ></CustomInput>
          <div className="w-full lg:w-5/12  mb-4 ">
            <CustomSelect placeholder="Section" />
          </div>
        </div>
        <LoadingBoundary isError={isError} isLoading={isFetching}>
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Accession Number</Table.HeadCell>
                <Table.HeadCell>Book Title</Table.HeadCell>
                <Table.HeadCell>Section</Table.HeadCell>
                <Table.HeadCell>Year Published</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {accessions?.map((accession) => {
                  return (
                    <Table.Row key={accession.id}>
                      <Table.Cell>{accession.number}</Table.Cell>
                      <Table.Cell>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {accession.book.title}
                        </div>
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {accession.book.section.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{accession.book.section.name}</Table.Cell>
                      <Table.Cell>{accession.book.yearPublished}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
          <div className="mt-3">
            <CustomPagination
              nextLabel="Next"
              pageRangeDisplayed={1}
              pageCount={totalPages}
              forcePage={filterParams?.page - 1}
              onPageChange={({ selected }) => {
                setFilterParams({ page: selected + 1 });
              }}
              isHidden={totalPages <= 1}
              previousLabel="Previous"
              renderOnZeroPageCount={null}
            />
          </div>
        </LoadingBoundary>
      </Container>
    </>
  );
};

export default AccessionPage;
