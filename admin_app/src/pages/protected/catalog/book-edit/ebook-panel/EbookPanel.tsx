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
      const response = await Get(`/books/${book.id}/ebooks`);
      const { data } = await response.data;
      return data?.url ?? "";
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
  const refetchEbook = () => {
    refetch();
  };
  useEffect(() => {
    refetch();
  }, [book.id]);
  return (
    <Container>
      <UploadEbook refetch={refetchEbook} eBookUrl={eBookUrl} />
      <div className="flex gap-2"></div>
      <hr className="mb-3 mt-3"></hr>
      <DocumentView eBookUrl={eBookUrl} />
    </Container>
  );
};

export default EbookPanel;
