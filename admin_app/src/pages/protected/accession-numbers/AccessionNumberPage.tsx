import Container from "@components/ui/container/Container";
import { CustomInput } from "@components/ui/form/Input";
import { AccessionNumber, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Modal, Table } from "flowbite-react";
import { FormEvent, useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { number, object } from "yup";

const AccessionNumberPage = () => {
  const [accessionNumber, setAccessionNumber] =
    useState<AccessionNumber | null>(null);
  const fetchAccessionNumbers = async () => {
    try {
      const response = await Get("/accession-numbers");
      const { data } = await response.data;
      return data?.accessionNumbers ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: accessionNumbers } = useQuery<AccessionNumber[]>({
    queryFn: fetchAccessionNumbers,
    queryKey: ["accessionNumbers"],
  });
  const { Get } = useRequest();
  const accessionNumberModal = useSwitch();
  return (
    <Container>
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <Table.Head>
          <Table.HeadCell>Collections</Table.HeadCell>
          <Table.HeadCell>Last Accession Number</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {accessionNumbers?.map((a) => {
            return (
              <Table.Row key={a.accession}>
                <Table.Cell>
                  <ul className="underline underline-offset-2 font-semibold">
                    {a.collections?.map((c, idx) => {
                      return (
                        <li className="py-1" key={idx}>
                          {c}
                        </li>
                      );
                    })}
                  </ul>
                </Table.Cell>
                <Table.Cell>{a.lastValue}</Table.Cell>
                <Table.Cell>
                  <Tippy content="Edit Accession Number">
                    <Button
                      color="secondary"
                      onClick={() => {
                        setAccessionNumber(a);
                        accessionNumberModal.open();
                      }}
                    >
                      <AiOutlineEdit className="text-lg cursor-pointer" />
                    </Button>
                  </Tippy>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <UpdateAccessionNumberModal
        accessionNumber={accessionNumber}
        isOpen={accessionNumberModal.isOpen}
        closeModal={accessionNumberModal.close}
      />
    </Container>
  );
};

interface UpdateAccessionNumberModalProps extends ModalProps {
  accessionNumber: AccessionNumber | null;
}
const UpdateAccessionNumberModal = ({
  closeModal,
  isOpen,
  accessionNumber,
}: UpdateAccessionNumberModalProps) => {
  const { errors, form, validate, handleFormInput, setForm } = useForm({
    initialFormData: {
      accession: "",
      lastValue: 0,
    },
    schema: object({
      lastValue: number()
        .min(0, "Value should be atleast 0")
        .integer("Value cannot be decimal.")
        .required("Value is required."),
    }),
  });
  const { Put } = useRequest();
  useEffect(() => {
    if (!accessionNumber) return;
    setForm({
      accession: accessionNumber.accession,
      lastValue: accessionNumber.lastValue,
    });
  }, [accessionNumber]);
  const queryClient = useQueryClient();
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const form = await validate();
      await Put(`/accession-numbers/${form?.accession}`, form);
      toast.success("Accession number updated.");
      closeModal();
      queryClient.invalidateQueries(["accessionNumbers"]);
    } catch (error) {
      toast.error("Unknown error occured.");
    }
  };
  return (
    <Modal onClose={closeModal} show={isOpen} size={"lg"} dismissible>
      <Modal.Header>Edit Accession Number</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <CustomInput
            name="lastValue"
            error={errors?.lastValue}
            onChange={handleFormInput}
            value={form.lastValue}
          ></CustomInput>
          <div className="flex gap-2">
            <Button type="submit" color="primary">
              <div className="flex gap-1 items-center">
                <FaSave></FaSave>
                Save
              </div>
            </Button>
            <Button color="light" onClick={closeModal} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AccessionNumberPage;
