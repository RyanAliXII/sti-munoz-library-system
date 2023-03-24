import { BookInitialValue } from "@definitions/defaults";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const CatalogBookView = () => {
  const { id } = useParams();
  const { Get } = useRequest();
  const fetchBookById = async () => {
    const { data: response } = await Get(`/books/${id}`);
    return response?.data?.book ?? BookInitialValue;
  };
  const navigate = useNavigate();
  const { data: Book } = useQuery<Book>({
    queryFn: fetchBookById,
    queryKey: ["book"],
    retry: false,
    onError: () => {
      navigate("/404");
    },
  });
  return <div></div>;
};

export default CatalogBookView;
