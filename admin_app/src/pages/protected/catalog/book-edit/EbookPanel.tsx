import { useRequest } from "@hooks/useRequest";
import { useBookEditFormContext } from "./BookEditFormContext";
import { useQuery } from "@tanstack/react-query";

const EbookPanel = () => {
  const { form: book } = useBookEditFormContext();
  const { Get } = useRequest();
  const fetchEbook = async () => {
    try {
      const response = await Get(`/books/${book.id}/ebooks`);
      const blob = new Blob([response.data], { type: "application/pdf" });

      return "";
    } catch (error) {
      console.log(error);
      return "";
    }
  };
  useQuery({
    queryFn: fetchEbook,
    queryKey: ["eBook"],
    enabled: book.ebook.length > 1,
  });
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">eBook</h1>
      </div>
    </div>
  );
};
export default EbookPanel;
