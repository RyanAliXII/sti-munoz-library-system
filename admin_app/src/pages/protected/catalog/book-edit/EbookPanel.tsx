import { useRequest } from "@hooks/useRequest";
import { useBookEditFormContext } from "./BookEditFormContext";

const EbookPanel = () => {
  const { form: book } = useBookEditFormContext();
  const { Get } = useRequest();

  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">eBook</h1>
      </div>
    </div>
  );
};
export default EbookPanel;
