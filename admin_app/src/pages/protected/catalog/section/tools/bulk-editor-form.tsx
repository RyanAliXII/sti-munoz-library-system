import { Accession } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useState } from "react";

const useBulkEditorForm = ({
  accessions,
  collectionId,
}: {
  accessions: Accession[];
  collectionId: number;
}) => {
  const [formMap, setFormMap] = useState(new Map<number, number>());
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
    updateAccessions.mutate(t);
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
      Put(`/books/accessions/collections/${collectionId}`),
  });

  return {
    form: formMap,
    handleChange,
    onSubmit,
  };
};

export default useBulkEditorForm;
