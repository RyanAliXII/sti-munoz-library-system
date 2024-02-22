import Container from "@components/ui/container/Container";
import { CustomInput } from "@components/ui/form/Input";
import { useAccessionsByCollection } from "@hooks/data-fetching/accession";
import { useCollections } from "@hooks/data-fetching/collection";
import { useForm } from "@hooks/useForm";
import { Button, Select } from "flowbite-react";
import { useSwitch } from "@hooks/useToggle";
import SearchApi from "js-worker-search";
import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import ErrorModal from "./ErrorModal";
import useBulkEditorForm from "./bulkEditorForm";
import { useQueryClient } from "@tanstack/react-query";

const BulkAccessionEditorPage = () => {
  const { form, handleFormInput } = useForm<{ collectionId: 0; query: string }>(
    {
      initialFormData: {
        collectionId: 0,
        query: "",
      },
    }
  );
  const { data } = useAccessionsByCollection({
    queryKey: ["accessionsByCollection", form.collectionId],
    refetchOnWindowFocus: false,
    retry: false,
  });
  const searchApi = useRef(new SearchApi());
  const virtualTable = useRef<VirtuosoHandle>(null);

  const [searchResultCursor, setSearchResultCursor] = useState(-1);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [activeRowIndex, setActiveRowIndex] = useState(-1);

  const gotoRow = (activeRowIdx: number, resultCursor: number) => {
    virtualTable.current?.scrollToIndex({
      index: activeRowIdx,
      align: "start",
    });
    setActiveRowIndex(activeRowIdx);
    setSearchResultCursor(resultCursor);
  };
  const clearSearchResult = () => {
    setSearchResults([]);
    setActiveRowIndex(-1);
    setSearchResultCursor(-1);
  };
  const find = async () => {
    const results = await searchApi.current.search(form.query);
    setSearchResults(results);
    if (results.length === 0) {
      clearSearchResult();
    }
    const cursor = 0;
    const activeRow = parseInt(results[cursor]);
    gotoRow(activeRow, cursor);
  };
  const nextResult = () => {
    if (searchResultCursor + 1 === searchResults.length) return;
    const cursor = searchResultCursor + 1;
    const activeRow = parseInt(searchResults[cursor]);
    gotoRow(activeRow, cursor);
  };
  const prevResult = () => {
    if (searchResultCursor <= 0) return;
    const cursor = searchResultCursor - 1;
    const activeRow = parseInt(searchResults[cursor]);
    gotoRow(activeRow, cursor);
  };

  const { data: collections } = useCollections();
  useEffect(() => {
    clearForm();
    searchApi.current = new SearchApi();
    data?.accessions.forEach((a, idx) => {
      searchApi.current.indexDocument(idx.toString(), a.book.title);
      searchApi.current.indexDocument(idx.toString(), a.book.section.name);
      searchApi.current.indexDocument(idx.toString(), a.number.toString());
    });
    clearSearchResult();
  }, [data?.accessions]);
  const queryClient = useQueryClient();
  const {
    form: editorForm,
    handleChange,
    isSubmitting,
    onSubmit,
    errors,
    clearForm,
  } = useBulkEditorForm({
    accessions: [...(data?.accessions ?? [])],
    collectionId: form.collectionId,
    onError: () => {
      toast.error(
        "An error has occured, please view the error logs for more details."
      );
    },
    onSuccess() {
      queryClient.invalidateQueries([
        "accessionsByCollection",
        form.collectionId,
      ]);
      toast.success("Accession has been updated.");
    },
  });
  const errorModal = useSwitch();

  return (
    <Container>
      <Select
        onChange={handleFormInput}
        value={form.collectionId}
        name="collectionId"
      >
        <option value="0" disabled>
          No collection selected
        </option>
        {collections?.map((c) => {
          return (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          );
        })}
      </Select>
      <div className="pt-4 flex items-center gap-2">
        <div>
          <CustomInput
            name="query"
            onChange={handleFormInput}
            label={
              searchResults.length > 0
                ? `${searchResultCursor + 1} - ${
                    searchResults.length
                  } results found `
                : "Search"
            }
          />
        </div>
        <div className="flex items-center  mt-1 gap-1">
          <Button
            color="primary"
            outline
            disabled={form.query.length === 0}
            onClick={find}
          >
            Find
          </Button>
          <Button
            color="primary"
            outline
            onClick={prevResult}
            disabled={searchResults.length === 1 || searchResultCursor === -1}
          >
            Find Previous
          </Button>

          <Button
            color="primary"
            outline
            onClick={nextResult}
            disabled={
              searchResults.length - 1 === searchResultCursor ||
              searchResults.length === 0
            }
          >
            Find Next
          </Button>

          <Button
            color="primary"
            outline={true}
            onClick={clearSearchResult}
            disabled={searchResults.length === 0}
          >
            Clear Results
          </Button>
          <form onSubmit={onSubmit}>
            <Button
              isProcessing={isSubmitting}
              type="submit"
              color="primary"
              disabled={editorForm.size === 0}
            >
              <div className="flex gap-2 items-center">
                <FaSave />
                Save
              </div>
            </Button>
          </form>
          <Button
            color="failure"
            type="button"
            disabled={errors.length === 0}
            onClick={errorModal.open}
          >
            Error Logs
          </Button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-4 gap-2 p-5 text-xs text-gray-700 uppercase  bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md rounded-b-none font-semibold">
          <div>Accession number</div>
          <div>Book</div>
          <div>Copy number</div>
          <div>Edit Accession number</div>
        </div>
        <div>
          <Virtuoso
            style={{ height: 700 }}
            className="small-scroll"
            ref={virtualTable}
            data={data?.accessions ?? []}
            itemContent={(index, accession) => (
              <div
                key={accession.id}
                className={`w-full grid-cols-4 gap-2 grid p-3 bg-white border-b  dark:text-white rounded-md  rounded-t-none ${
                  activeRowIndex === index
                    ? "bg-gray-300 dark:bg-gray-600  dark:border-gray-500"
                    : "dark:bg-gray-800 dark:border-gray-700"
                }`}
              >
                <div className="p-2 text-sm">{accession.number}</div>
                <div className="p-2 text-sm">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {accession.book.title}
                  </div>
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {accession.book.section.name}
                  </div>
                </div>
                <div className="p-2 text-sm">{accession.copyNumber}</div>
                <div className="p-2 text-sm">
                  <CustomInput
                    value={editorForm.get(index) ?? 0}
                    onChange={(event) => {
                      handleChange(event, index);
                    }}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>
      <ErrorModal
        errors={errors}
        closeModal={errorModal.close}
        isOpen={errorModal.isOpen}
      />
    </Container>
  );
};

export default BulkAccessionEditorPage;
