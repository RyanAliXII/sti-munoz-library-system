import { Input, InputClasses } from "@components/ui/form/Input";
import {
  Th,
  Thead,
  Table,
  HeadingRow,
  Tbody,
  Td,
  BodyRow,
} from "@components/ui/table/Table";
import { ModalProps, DDC } from "@definitions/types";
import Modal from "react-responsive-modal";
import { useBookAddFormContext } from "./BookAddFormContext";

import { useQuery } from "@tanstack/react-query";
import { BaseSyntheticEvent, useRef, useState } from "react";

import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";

import ReactPaginate from "react-paginate";
import usePaginate from "@hooks/usePaginate";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";

const DDCSelectionModal: React.FC<ModalProps> = ({ closeModal, isOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;
  return (
    <Modal
      ref={modalRef}
      onClose={closeModal}
      open={isOpen}
      closeIcon
      center
      styles={{
        modal: {
          maxWidth: "none",
        },
      }}
      classNames={{
        modalContainer: "",
        modal: "w-11/12 lg:w-9/12 rounded h-[750px]",
      }}
    >
      <DDCTable closeModal={closeModal} />
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
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center mt-2";
  const proceed = () => {
    setForm((prev) => ({ ...prev, ddc: selectedDDC.number }));
    removeFieldError("ddc");
    closeModal();
  };
  return (
    <>
      {selectedDDC.id != 0 && (
        <p className="">
          <span className="underline underline-offset-2">
            {selectedDDC.name}{" "}
          </span>
          has been selected.
        </p>
      )}
      <div className="flex gap-2 items-center mb-3">
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          name="keyword"
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        ></Input>
      </div>

      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <Table>
          <Thead>
            <HeadingRow>
              <Th></Th>
              <Th>Class name</Th>
              <Th>Number</Th>
            </HeadingRow>
          </Thead>

          <Tbody>
            {ddc?.map((d) => {
              return (
                <BodyRow
                  key={d.id}
                  onClick={() => {
                    selectDDC(d);
                  }}
                  className="cursor-pointer"
                >
                  <Td>
                    <Input
                      wrapperclass="flex items-center"
                      type="checkbox"
                      checked={d.number === selectedDDC.number}
                      className="h-4"
                      readOnly
                    ></Input>
                  </Td>
                  <Td>{d.name}</Td>
                  <Td>{d.number}</Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
        <div className="flex justify-between items-center mt-10">
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={3}
            forcePage={currentPage - 1}
            pageCount={totalPages}
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
          <div className="flex gap-2">
            <PrimaryButton
              disabled={selectedDDC.id != 0 ? false : true}
              onClick={proceed}
            >
              Proceed
            </PrimaryButton>
            <LighButton
              onClick={() => {
                closeModal();
              }}
            >
              Cancel
            </LighButton>
          </div>
        </div>
      </LoadingBoundaryV2>
    </>
  );
};

export default DDCSelectionModal;
