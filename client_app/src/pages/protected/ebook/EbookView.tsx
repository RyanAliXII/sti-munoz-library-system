import { useParams } from "react-router-dom";
import DocumentView from "./DocumentView";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import b64toBlob from "b64-to-blob";
import { useLayoutEffect, useState } from "react";
import LoadingBoundary, {
  LoadingBoundaryV2,
} from "@components/loader/LoadingBoundary";
import Page404 from "@pages/error/Page404";
const EbookView = () => {
  const { id } = useParams();
  const { Get } = useRequest();
  const [windowData, setWindowData] = useState({
    width: window.innerWidth,
    height: window.innerWidth,
  });
  const fetchEbook = async (): Promise<{
    bookTitle: string;
    ebook: string;
  }> => {
    const response = await Get(`borrowing/ebooks/${id}`);
    const { data } = response.data;
    const blob = b64toBlob(data?.ebook ?? "", "application/pdf");
    const url = URL.createObjectURL(blob);
    return {
      bookTitle: data?.book?.title ?? "",
      ebook: url,
    };
  };
  const { data, isFetching, isError } = useQuery<{
    bookTitle: string;
    ebook: string;
  }>({
    queryFn: fetchEbook,
    queryKey: ["ebook"],
    refetchOnWindowFocus: false,
    enabled: id != undefined,
    retry: false,
  });
  useLayoutEffect(() => {
    window.addEventListener("resize", (event) => {
      const target = event.target as Window;
      setWindowData({ width: target.innerWidth, height: target.innerHeight });
    });
  }, []);
  if (isError)
    return (
      <Page404
        redirectTo="/borrowed-books"
        redirectText="Return to borrowed books"
      />
    );
  return (
    <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
      <div>
        <div className="w-full  flex flex-col items-center mt-5 gap-3">
          <div className=" flex flex-col w-11/12  gap-2">
            <h1 className=""></h1>
            <DocumentView
              eBookUrl={data?.ebook ?? ""}
              windowData={windowData}
            />
          </div>
        </div>
      </div>
    </LoadingBoundaryV2>
  );
};

export default EbookView;