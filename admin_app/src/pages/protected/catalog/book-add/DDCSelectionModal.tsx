import { CustomInput } from "@components/ui/form/Input";

import { DDC, ModalProps } from "@definitions/types";

import { useBookAddFormContext } from "./BookAddFormContext";

import { useQuery } from "@tanstack/react-query";
import { BaseSyntheticEvent, useState } from "react";

import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";

import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import usePaginate from "@hooks/usePaginate";
import { Button, Checkbox, Modal, Table } from "flowbite-react";

const DDCSelectionModal: React.FC<ModalProps> = ({ closeModal, isOpen }) => {
  return (
    <Modal onClose={closeModal} show={isOpen} dismissible size={"4xl"}>
      <Modal.Body style={{ maxHeight: "800px" }} className="small-scroll">
        <DDCTable closeModal={closeModal} />
      </Modal.Body>
    </Modal>
  );
};

type DDCTableProps = {
  closeModal: () => void;
};
const DDCTable = ({ closeModal }: DDCTableProps) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { setForm, removeFieldError } = useBookAddFormContext();

  const INITIAL_PAGE = 1;
  const searchDebounce = useDebounce();

  const search = (q: any) => {
    setSearchKeyword(q);
    setCurrentPage(INITIAL_PAGE);
  };

  const handleSearch = (event: BaseSyntheticEvent) => {
    searchDebounce(search, event.target.value, 500);
  };
  const { Get } = useRequest();
  const { currentPage, setCurrentPage, setTotalPages, totalPages } =
    usePaginate({
      initialPage: INITIAL_PAGE,
      numberOfPages: 1,
    });
  const fetchDDC = async () => {
    try {
      const { data: response } = await Get("/ddc/", {
        params: {
          page: currentPage,
          keyword: searchKeyword,
        },
      });
      setTotalPages(response?.data?.metadata?.pages ?? 1);
      return response?.data?.ddc ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const {
    data: ddc,
    isFetching,
    isError,
  } = useQuery<DDC[]>({
    queryFn: fetchDDC,
    queryKey: ["ddc", currentPage, searchKeyword],
    refetchOnWindowFocus: false,
  });
  const [selectedDDC, setSelectedDDC] = useState<DDC>({
    id: 0,
    name: "",
    number: "",
  });
  const selectDDC = (ddc: DDC) => {
    setSelectedDDC(ddc);
  };

  const proceed = () => {
    setForm((prev) => ({ ...prev, ddc: selectedDDC.number }));
    removeFieldError("ddc");
    closeModal();
  };
  return (
    <>
      {selectedDDC.id != 0 && (
        <p className="text-gray-900 dark:text-gray-50">
          <span className="underline underline-offset-2 ">
            {selectedDDC.name}{" "}
          </span>
          has been selected.
        </p>
      )}
      <div className="mt-2">
        <CustomInput
          name="keyword"
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        ></CustomInput>
      </div>

      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <Table>
          <Table.Head>
            <Table.HeadCell></Table.HeadCell>
            <Table.HeadCell>Class name</Table.HeadCell>
            <Table.HeadCell>Number</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y dark:divide-gray-700">
            {ddc?.map((d) => {
              return (
                <Table.Row
                  key={d.id}
                  onClick={() => {
                    selectDDC(d);
                  }}
                  className="cursor-pointer"
                >
                  <Table.Cell>
                    <Checkbox
                      color="primary"
                      checked={d.number === selectedDDC.number}
                      className="h-4"
                      readOnly
                    ></Checkbox>
                  </Table.Cell>
                  <Table.Cell>
                    <div className=" font-semibold text-gray-900 dark:text-white">
                      {d.name}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{d.number}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <div className="flex justify-between items-center mt-10">
          <CustomPagination
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            marginPagesDisplayed={1}
            pageRangeDisplayed={1}
            forcePage={currentPage - 1}
            pageCount={totalPages}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            previousLabel="Previous"
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
          <div className="flex gap-2">
            <Button
              color="primary"
              disabled={selectedDDC.id != 0 ? false : true}
              onClick={proceed}
            >
              Proceed
            </Button>
            <Button
              color="light"
              onClick={() => {
                closeModal();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </LoadingBoundaryV2>
    </>
  );
};

export default DDCSelectionModal;
