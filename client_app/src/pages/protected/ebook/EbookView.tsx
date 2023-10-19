import { useParams } from "react-router-dom";
import DocumentView from "./DocumentView";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import b64toBlob from "b64-to-blob";
import { useLayoutEffect, useState } from "react";
const EbookView = () => {
  const { id } = useParams();
  const { Get } = useRequest();
  const [windowData, setWindowData] = useState({
    width: window.innerWidth,
    height: window.innerWidth,
  });
  const fetchEbook = async () => {
    try {
      const response = await Get(`borrowing/ebooks/${id}`);
      const { data } = response.data;
      const blob = b64toBlob(data?.ebook ?? "", "application/pdf");
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      return "";
    }
  };
  const { data: ebookUrl } = useQuery<string>({
    queryFn: fetchEbook,
    queryKey: ["ebook"],
    refetchOnWindowFocus: false,
    enabled: id != undefined,
  });
  useLayoutEffect(() => {
    window.addEventListener("resize", (event) => {
      const target = event.target as Window;
      setWindowData({ width: target.innerWidth, height: target.innerHeight });
    });
  }, []);
  return (
    <div>
      <div className="w-full  flex flex-col items-center mt-5 gap-3">
        <div className=" flex flex-col w-11/12  gap-2">
          <DocumentView eBookUrl={ebookUrl} windowData={windowData} />
        </div>
      </div>
    </div>
  );
};

export default EbookView;
