import { Accession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { ChangeEvent, FormEvent, useState } from "react";

const useBulkEditorForm = ({
  accessions,
  collectionId,
  onError,
  onSuccess,
}: {
  accessions: Accession[];
  collectionId: number;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const [formMap, setFormMap] = useState(new Map<number, number>());
  const [errors, setErrors] = useState<string[]>([]);
  const { Put } = useRequest();
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx: number
  ) => {
    const value = parseInt(event.target.value);
    if (isNaN(value)) {
      setFormMap((prev) => {
        prev.delete(idx);
        return new Map<number, number>(prev);
      });
      return;
    }
    if (value === 0) {
      setFormMap((prev) => {
        prev.delete(idx);
        return new Map<number, number>(prev);
      });
      return;
    }
    setFormMap((prev) => {
      prev.set(idx, value);
      return new Map<number, number>(prev);
    });
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const t = transform();
    setErrors([]);
    updateAccessions.mutate(t);
  };
  const clearForm = () => {
    setFormMap(new Map<number, number>());
    setErrors([]);
  };
  const transform = () => {
    const a = [...accessions];
    formMap.forEach((number, key) => {
      const accession = { ...a[key] };
      accession.number = number;
      a[key] = accession;
    });
    return a;
  };
  const updateAccessions = useMutation({
    mutationFn: (accessions: Accession[]) =>
      Put(`/books/accessions/collections/${collectionId}`, {
        accessions,
      }),
    onError: ({ response }: AxiosError<any, any>) => {
      console.log(response?.status);
      if (response?.status === StatusCodes.BAD_REQUEST) {
        const { data } = response.data;
        setErrors(data.errors ?? []);
      }
      onError?.();
    },
    onSuccess,
  });

  return {
    form: formMap,
    handleChange,
    onSubmit,
    isSubmitting: updateAccessions.isLoading,
    errors,
    clearForm,
  };
};

export default useBulkEditorForm;
