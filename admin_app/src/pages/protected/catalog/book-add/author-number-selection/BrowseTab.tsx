import { AuthorNumber } from "@definitions/types";
import { useState } from "react";

import { useBookAddFormContext } from "../BookAddFormContext";
import { Input } from "@components/ui/form/Input";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import useDebounce from "@hooks/useDebounce";
import useScrollWatcher from "@hooks/useScrollWatcher";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import usePaginate from "@hooks/usePaginate";
import ReactPaginate from "react-paginate";

type BrowseTabProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};

const BrowseTab = ({ modalRef }: BrowseTabProps) => {
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

  const { data: authorNumbers, refetch } = useQuery<AuthorNumber[]>({
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
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center mt-4";
  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <Input
            label="Author Number"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber}
          />
        </div>
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          onChange={(event) => {
            // setKeyword(event.target.value);
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
        ></Input>
      </div>

      <Table>
        <Thead>
          <HeadingRow>
            {/* <Th></Th> */}
            <Th>Surname</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {authorNumbers?.map((authorNumber, index) => {
            return (
              <BodyRow
                key={authorNumber.surname}
                onClick={() => {
                  selectAuthorNumber(authorNumber);
                }}
                className="cursor-pointer"
              >
                {/* <Td>
                    <Input
                      wrapperclass="flex items-center"
                      type="checkbox"
                      className="h-4"
                      readOnly
                    ></Input>
                  </Td> */}
                <Td>{authorNumber.surname}</Td>
                <Td>{authorNumber.number}</Td>
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
    </div>
  );
};

export default BrowseTab;
