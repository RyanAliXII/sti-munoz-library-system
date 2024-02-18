import Container from "@components/ui/container/Container";
import { useAccessionsByCollection } from "@hooks/data-fetching/accession";
import { useCollections } from "@hooks/data-fetching/collection";
import { useForm } from "@hooks/useForm";
import { Select } from "flowbite-react";
import { Virtuoso } from "react-virtuoso";
const BulkAccessionEditorPage = () => {
  const { form, handleFormInput } = useForm<{ collectionId: 0 }>({
    initialFormData: {
      collectionId: 0,
    },
  });
  const { data } = useAccessionsByCollection({
    queryKey: ["accessionsByCollection", form.collectionId],
    refetchOnWindowFocus: false,
  });
  const { data: collections } = useCollections();
  return (
    <Container>
      <Select onChange={handleFormInput} name="collectionId">
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
      <div>
        <div className="grid grid-cols-3 gap-2 p-5 mt-5 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md">
          <div>Accession number</div>
          <div>Book</div>
          <div>Copy number</div>
        </div>
        <div>
          <Virtuoso
            style={{ height: 700 }}
            className="small-scroll"
            data={data?.accessions ?? []}
            itemContent={(index, accession) => (
              <div
                key={accession.id}
                className="w-full grid-cols-3 gap-2 grid p-3 bg-white border-b dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
              </div>
            )}
          />
        </div>
      </div>
    </Container>
  );
};

export default BulkAccessionEditorPage;
