import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import Tippy from "@tippyjs/react";
import { Button, Checkbox, Modal } from "flowbite-react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { SectionSchema } from "../schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import { BaseSyntheticEvent } from "react";
import useModalToggleListener from "@hooks/useModalToggleListener";

const AddSectionModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const FORM_DEFAULT_VALUES: Section = {
    name: "",
    prefix: "",
    hasOwnAccession: false,
  };
  const { form, errors, handleFormInput, validate, resetForm } =
    useForm<Section>({
      initialFormData: FORM_DEFAULT_VALUES,
      schema: SectionSchema,
    });

  const queryClient = useQueryClient();
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/sections/", form, {}),
    onSuccess: () => {
      toast.success("New section added");
      queryClient.invalidateQueries(["sections"]);
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>New Section</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div className="w-full">
            <CustomInput
              label="Section name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="w-full pt-1">
            <CustomInput
              label="Section Prefix"
              error={errors?.prefix}
              type="text"
              name="prefix"
              value={form.prefix}
              onChange={handleFormInput}
            />
          </div>
          <div className="pt-1">
            <div className="flex gap-2 items-center">
              <Checkbox
                color="primary"
                name="hasOwnAccession"
                value={form.prefix}
                checked={form.hasOwnAccession}
                onChange={handleFormInput}
              />
              <label className="text-gray-500 dark:text-gray-400 text-sm">
                Separate Generated Accession Number
              </label>
              <Tippy content="This prefix will be used in generated book printables. E.g. 'Th' for thesis, 'Ref' for reference">
                <span>
                  <AiOutlineInfoCircle className="text-base text-gray-600 hover:text-blue-400"></AiOutlineInfoCircle>
                </span>
              </Tippy>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              color="primary"
              type="submit"
              isProcessing={mutation.isLoading}
            >
              Add section
            </Button>
            <Button color="light" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddSectionModal;