import { AuthorNumber } from "@definitions/types";
import { useState } from "react";

import { CustomInput } from "@components/ui/form/Input";
import { useQuery } from "@tanstack/react-query";
import { useBookAddFormContext } from "../BookAddFormContext";

import useDebounce from "@hooks/useDebounce";

import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import usePaginate from "@hooks/usePaginate";
import { useRequest } from "@hooks/useRequest";
import { Table } from "flowbite-react";
import { toast } from "react-toastify";

const BrowseTab = () => {
  const { form, setFieldValue, removeFieldError } = useBookAddFormContext();
  const [searchKeyword, setKeyword] = useState("");

  const { Get } = useRequest();
  const { currentPage, totalPages, setTotalPages, setCurrentPage } =
    usePaginate({
      useURLParamsAsState: false,
      initialPage: 1,
      numberOfPages: 1,
    });
  const fetchCuttersTable = async () => {
    try {
      const { data: response } = await Get(`/author-numbers/`, {
        params: {
          page: currentPage,
          keyword: searchKeyword,
        },
      });
      if (response?.data?.metadata) {
        setTotalPages(response?.data?.metadata?.pages ?? 1);
      }
      return response?.data?.cutters ?? [];
    } catch (error) {
      return [];
    }
  };
  const {
    data: authorNumbers,
    isFetching,
    isError,
  } = useQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["authorNumbers", currentPage, searchKeyword],
  });
  const debounceSearch = useDebounce();

  const selectAuthorNumber = (authorNumber: AuthorNumber) => {
    setFieldValue(
      "authorNumber",
      `${authorNumber.surname.charAt(0)}${authorNumber.number}`
    );
    removeFieldError("authorNumber");
    toast.info("Author number has been selected.");
  };

  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <CustomInput
            label="Author Number"
            type="text"
            readOnly
            disabled
            value={form.authorNumber}
          />
        </div>
        <CustomInput
          className="flex-1"
          onChange={(event) => {
            debounceSearch(
              () => {
                setKeyword(event.target.value);
                setCurrentPage(1);
              },
              {},
              500
            );
          }}
          type="text"
          placeholder="Search..."
        ></CustomInput>
      </div>

      <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Surname</Table.HeadCell>
            <Table.HeadCell>Number</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y dark:divide-gray-700">
            {authorNumbers?.map((authorNumber, index) => {
              return (
                <Table.Row
                  key={authorNumber.surname}
                  onClick={() => {
                    selectAuthorNumber(authorNumber);
                  }}
                  className="cursor-pointer"
                >
                  <Table.Cell>{authorNumber.surname}</Table.Cell>
                  <Table.Cell>{authorNumber.number}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <div className="mt-3">
          <CustomPagination
            nextLabel="Next"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            forcePage={currentPage - 1}
            isHidden={totalPages <= 1}
            previousLabel="Previous"
          />
        </div>
      </LoadingBoundaryV2>
    </div>
  );
};

export default BrowseTab;
