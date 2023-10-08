import { initial } from "lodash";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const useSearch = ({
  initialKeyword = "",
  useURLParamsAsState = true,
}: {
  initialKeyword: string | (() => string);
  useURLParamsAsState?: boolean;
}) => {
  const [keyword, setKeyword] = useState<string>("");
  const [params, setUrlSearchParams] = useSearchParams();

  useEffect(() => {
    const query = params.get("keyword");
    if (useURLParamsAsState && query) {
      setKeyword(query);
    }
  }, []);

  if (useURLParamsAsState) {
    useEffect(() => {
      setUrlSearchParams((prev) => {
        prev.set("keyword", keyword);
        return prev;
      });
    }, [keyword]);
  }

  return {
    keyword,
    setKeyword,
  };
};

export default useSearch;
