import { CustomInput } from "@components/ui/form/Input";
import { Section } from "@definitions/types";
import { generatePrefixBasedOnText } from "@helpers/prefix";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button, Checkbox, Label } from "flowbite-react";
import { StatusCodes } from "http-status-codes";
import { BaseSyntheticEvent, FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EditSectionSchema } from "../schema";
type TreeDataPanelProps = {
  collection: Section;
  initDelete: (e: Section) => void;
};

const TreeDataPanel: FC<TreeDataPanelProps> = ({ collection, initDelete }) => {
  const FORM_DEFAULT_VALUES: Omit<Section, "isDeleteable" | "accessionTable"> =
    {
      name: "",
      prefix: "",
      isSubCollection: false,
      mainCollectionId: 0,
      lastValue: 0,
      isNonCirculating: false,
    };
  const { form, errors, handleFormInput, validate, setForm, setErrors } =
    useForm<Omit<Section, "isDeleteable" | "accessionTable">>({
      initialFormData: FORM_DEFAULT_VALUES,
      schema: EditSectionSchema,
    });
  useEffect(() => {
    setForm({ ...collection });
  }, [collection]);
  const queryClient = useQueryClient();
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: (
      formValues: Omit<Section, "isDeleteable" | "accessionTable">
    ) => Put(`/sections/${formValues.id}`, formValues, {}),
    onSuccess: () => {
      toast.success("Section updated.");
      queryClient.invalidateQueries(["collectionsData"]);
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
      const parsedForm = await validate();
      if (!parsedForm) return;
      mutation.mutate(parsedForm);
    } catch (error) {
      console.error(error);
    }
  };

  const [prefixSuggestions, setPrefixSuggestions] = useState<string[]>([]);
  const handleCollectionNameBlur = () => {
    const suggestions = generatePrefixBasedOnText(form.name);
    setPrefixSuggestions(suggestions);
  };
  const handleClick = (s: string) => {
    setForm((prev) => ({ ...prev, prefix: s }));
    setPrefixSuggestions([]);
  };

  if (!collection || collection?.id === 0) {
    return <NoCollectionSelected />;
  }
  return (
    <div className="p-4">
      <form onSubmit={submit}>
        <div className="w-full py-1">
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
        <div className="w-full py-1">
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
                <small className="dark:text-white mb-2">
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

        <div className="flex gap-1 items-center">
          <Checkbox
            checked={form.isNonCirculating}
            color="primary"
            name="isNonCirculating"
            onChange={handleFormInput}
          />
          <Label>Is collection non-circulating?</Label>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            color="primary"
            type="submit"
            isProcessing={mutation.isLoading}
          >
            Save
          </Button>
          <Button
            color="failure"
            type="button"
            onClick={() => {
              initDelete(collection);
            }}
            disabled={!collection.isDeleteable}
            isProcessing={mutation.isLoading}
          >
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
};
const NoCollectionSelected = () => {
  return (
    <div className="w-full flex items-center justify-center h-full">
      <h1 className="text-2xl dark:text-gray-400">No collection selected</h1>
    </div>
  );
};

export default TreeDataPanel;
