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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, useRef, useState } from "react";

import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";

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
        modal: "w-11/12 lg:w-9/12 rounded h-[600px]",
      }}
    >
      <DDCTable modalRef={modalRef} />
    </Modal>
  );
};

enum SearchBy {
  Name = "name",
  Number = "number",
}
type DDCTableProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};
const DDCTable = ({ modalRef }: DDCTableProps) => {
  const PAGE_OFFSET_INCREMENT = 50;
  const { form, setForm, removeFieldError } = useBookAddFormContext();
  const searchDebounce = useDebounce();
  const [filters, setFilters] = useState({
    keyword: "",
    searchBy: SearchBy.Name,
  });

  const queryClient = useQueryClient();

  const handleFilters = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    searchDebounce(search, {}, 300);
  };

  const search = () => {};
  const { Get } = useRequest();
  const fetchDDC = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await Get("/ddc/", {
        params: {},
      });

      return response?.data?.ddc ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const { data: ddc } = useQuery<DDC[]>({
    queryFn: fetchDDC,
    queryKey: ["ddc"],
    refetchOnWindowFocus: false,
  });

  const selectDDC = (ddc: DDC) => {
    setForm((prevForm) => ({ ...prevForm, ddc: ddc.number }));
    removeFieldError("ddc");
    toast.info(`${ddc.name} has been selected as classification.`);
  };
  return (
    <>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <Input
            label="DDC"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            value={form.ddc}
            readOnly
            disabled
          />
        </div>
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          name="keyword"
          onChange={handleFilters}
          type="text"
          placeholder="Search..."
        ></Input>
        <div className="w-48 h-16 flex items-end ">
          <select
            className={`${InputClasses.InputDefaultClasslist} mb-1 `}
            onChange={handleFilters}
            name="searchBy"
          >
            <option value="name">Name</option>
            <option value="number">Number</option>
          </select>
        </div>
      </div>
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
                    checked={form.ddc === d.number}
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
    </>
  );
};

export default DDCSelectionModal;
