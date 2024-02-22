import { Accession, Section } from "@definitions/types";
import React, { ChangeEvent, FormEvent, useState } from "react";

const useBulkEditorForm = ({ accessions }: { accessions: Accession[] }) => {
  const [formMap, setFormMap] = useState(new Map<number, number>());
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
    setFormMap((prev) => {
      prev.set(idx, value);
      return new Map<number, number>(prev);
    });
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const t = transform();
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
  return {
    form: formMap,
    handleChange,
    onSubmit,
  };
};

export default useBulkEditorForm;
