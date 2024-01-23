import { useRequest } from "@hooks/useRequest";
import { useBookEditFormContext } from "../BookEditFormContext";
import { useQuery } from "@tanstack/react-query";
import "react-pdf/dist/esm/Page/TextLayer.css";
import DocumentView from "./DocumentView";
import UploadEbook from "./UploadEbook";
import Container from "@components/ui/container/Container";
import { useEffect } from "react";

const EbookPanel = () => {
  const { form: book } = useBookEditFormContext();
  const { Get } = useRequest();
  const fetchEbook = async () => {
    if (!book.id) return "";
    try {
      const response = await Get(`/books/${book.id}/ebooks`, {
        responseType: "arraybuffer",
      });

      const bufferLength = response.data?.byteLength ?? 0;
      if (bufferLength === 0) return "";
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const { data: eBookUrl, refetch } = useQuery({
    queryFn: fetchEbook,
    refetchOnWindowFocus: false,
    queryKey: ["eBook"],
  });
  useEffect(() => {
    refetch();
  }, [book.id]);

  return (
    <Container>
      <UploadEbook />
      <div className="flex gap-2"></div>
      <hr className="mb-3 mt-3"></hr>
      <DocumentView eBookUrl={eBookUrl} />
    </Container>
  );
};

export default EbookPanel;
