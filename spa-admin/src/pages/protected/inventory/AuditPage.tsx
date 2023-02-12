import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import { Input, LighButton, PrimaryButton } from "@components/forms/Forms";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Audit, EditModalProps, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiOutlineEdit, AiOutlineScan } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";
import { AuditSchemaValidation } from "../catalog/schema";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { useSwitch } from "@hooks/useToggle";
import Container, {
  ContainerNoBackground,
} from "@components/ui/Container/Container";

const AuditPage = () => {
  const {
    close: closeNewAuditModal,
    open: openNewAuditModal,
    isOpen: isNewAuditModalOpen,
  } = useSwitch();
  const {
    close: closeEditAuditModal,
    open: openEditAuditModal,
    isOpen: isEditAuditModalOpen,
  } = useSwitch();

  const [editModalFormData, setEditModalFormData] = useState<Audit>({
    name: "",
    id: "",
  });
  const fetchAudits = async () => {
    try {
      const { data: response } = await axiosClient("/inventory/audits");
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };
  const { data: audits } = useQuery<Audit[]>({
    queryFn: fetchAudits,
    queryKey: ["audits"],
  });
  return (
    <>
      <ContainerNoBackground className="flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Inventory Audit</h1>

        <PrimaryButton type="button" onClick={openNewAuditModal}>
          New Audit
        </PrimaryButton>
      </ContainerNoBackground>

      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Name</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {audits?.map((audit) => {
              return (
                <BodyRow key={audit.id}>
                  <Td>{audit.name}</Td>
                  <Td className="flex gap-5">
                    <Link to={`/inventory/audits/${audit.id}`}>
                      <AiOutlineScan className="text-blue-500 text-lg cursor-pointer"></AiOutlineScan>
                    </Link>
                    <AiOutlineEdit
                      className="text-yellow-400  text-lg cursor-pointer"
                      onClick={() => {
                        setEditModalFormData({ ...audit });
                        openEditAuditModal();
                      }}
                    ></AiOutlineEdit>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </Container>
      <NewAuditModal
        closeModal={closeNewAuditModal}
        isOpen={isNewAuditModalOpen}
      ></NewAuditModal>
      <EditAuditModal
        closeModal={closeEditAuditModal}
        isOpen={isEditAuditModalOpen}
        formData={editModalFormData}
      ></EditAuditModal>
    </>
  );
};

type NewAuditForm = Omit<Audit, "id">;
const NewAuditModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, validate, handleFormInput, resetForm } =
    useForm<NewAuditForm>({
      initialFormData: {
        name: "",
      },
      schema: AuditSchemaValidation,
    });
  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      let parsedForm = await validate();
      if (!parsedForm) return;
      newAudit.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };

  const newAudit = useMutation({
    mutationFn: (parsedForm: NewAuditForm) =>
      axiosClient.post("/inventory/audits", parsedForm),
    onSuccess: () => {
      toast.success("New audit has been added.");
      queryClient.invalidateQueries(["audits"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
      resetForm();
    },
  });

  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-44">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Audit</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Name"
              error={errors?.name}
              type="text"
              name="name"
              onChange={handleFormInput}
              value={form.name}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Add audit</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const EditAuditModal: React.FC<EditModalProps<Audit>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { form, errors, validate, handleFormInput, resetForm, setForm } =
    useForm<Audit>({
      initialFormData: {
        name: "",
      },
      schema: AuditSchemaValidation,
    });

  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      let parsedForm = await validate();
      if (!parsedForm) return;
      updateAudit.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };

  const updateAudit = useMutation({
    mutationFn: (parsedForm: Audit) =>
      axiosClient.put(`/inventory/audits/${parsedForm.id}`, parsedForm),
    onSuccess: () => {
      toast.success("Audit has been updated.");
      queryClient.invalidateQueries(["audits"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });

  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-44">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Update Audit</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Name"
              error={errors?.name}
              type="text"
              name="name"
              onChange={handleFormInput}
              value={form.name}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
export default AuditPage;
