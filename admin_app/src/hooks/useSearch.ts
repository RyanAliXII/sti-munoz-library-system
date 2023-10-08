import { initial } from "lodash";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const useSearch = ({
  initialKeyword = "",
}: {
  initialKeyword: string | (() => string);
  useURLParamsAsState?: boolean;
}) => {
  const [keyword, setKeyword] = useState<string>("");
  return {
    keyword,
    setKeyword,
  };
};

export default useSearch;
