import CustomSelect from "@components/ui/form/CustomSelect";
import { CustomInput } from "@components/ui/form/Input";
import { ModalProps, Section } from "@definitions/types";
import { generatePrefixBasedOnText } from "@helpers/prefix";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button, Checkbox, Label, Modal } from "flowbite-react";
import { StatusCodes } from "http-status-codes";
import { BaseSyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { SectionSchema } from "../schema";

interface AddCollectionForm
  extends Omit<
    Section,
    "isDeleteable" | "isSubCollection" | "accessionTable"
  > {}
interface AddCollectionModalProps extends ModalProps {
  collections: Section[];
}
const AddSectionModal: React.FC<AddCollectionModalProps> = ({
  isOpen,
  collections,
  closeModal,
}) => {
  const FORM_DEFAULT_VALUES: AddCollectionForm = {
    name: "",
    prefix: "",
    isNonCirculating: false,
    mainCollectionId: 0,
  };
  const {
    form,
    errors,
    setErrors,
    handleFormInput,
    validate,
    resetForm,
    removeErrors,
    setForm,
  } = useForm<AddCollectionForm>({
    initialFormData: FORM_DEFAULT_VALUES,
    schema: SectionSchema,
  });
  const [prefixSuggestions, setPrefixSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/sections/", form, {}),
    onSuccess: () => {
      toast.success("New section added");
      queryClient.invalidateQueries(["collectionsData"]);
      resetForm();
      closeModal();
    },
    onError: (error: AxiosError<any, any>) => {
      const status = error.response?.status;
      const { data } = error.response?.data;
      if (status === StatusCodes.BAD_REQUEST) {
        if (data?.errors) {
          setErrors(data?.errors);

          return;
        }
      }
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
    if (!isOpen) {
      resetForm();
      removeErrors();
    }
  });
  const handleCollectionSelection = (newValue: SingleValue<Section>) => {
    setForm((collection) => ({
      ...collection,
      mainCollectionId: newValue?.id ?? 0,
    }));
  };

  const handleCollectionNameBlur = () => {
    const suggestions = generatePrefixBasedOnText(form.name);
    setPrefixSuggestions(suggestions);
  };
  const handleClick = (s: string) => {
    setForm((prev) => ({ ...prev, prefix: s }));
    setPrefixSuggestions([]);
  };
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>New Collection</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={submit}>
          <div className="w-full">
            <CustomInput
              label="Collection name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
              onBlur={handleCollectionNameBlur}
            />
          </div>
          <div className="w-full pt-1">
            <CustomInput
              label="Collection Prefix"
              error={errors?.prefix}
              type="text"
              name="prefix"
              value={form.prefix}
              onChange={handleFormInput}
            />

            {prefixSuggestions.length > 0 && (
              <div>
                <div>
                  <small className="dark:text-white pb-2">
                    Prefix Suggestions:
                  </small>
                </div>
                <div className="flex gap-2">
                  {prefixSuggestions.map((s) => {
                    return (
                      <Button
                        key={s}
                        color="light"
                        pill
                        onClick={() => {
                          handleClick(s);
                        }}
                      >
                        {s}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="w-full pt-1">
            <CustomSelect
              label="Sub-collection of"
              onChange={handleCollectionSelection}
              options={collections}
              isOptionSelected={(option) => option.id === form.mainCollectionId}
              getOptionLabel={(collection) => collection.name}
              getOptionValue={(collection) => collection.id?.toString() ?? ""}
            />
          </div>
          <div className="pt-5">
            <div className="flex gap-1 py-2">
              <Checkbox
                checked={form.isNonCirculating}
                color="primary"
                name="isNonCirculating"
                onChange={handleFormInput}
              />
              <Label>Is collection non-circulating?</Label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              color="primary"
              type="submit"
              isProcessing={mutation.isLoading}
            >
              Save
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
