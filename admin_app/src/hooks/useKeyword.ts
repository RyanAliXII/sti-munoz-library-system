import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const useKeyword = ({
  initialKeyword = "",
  useURLParamsAsState = true,
}: {
  initialKeyword: string | (() => string);
  useURLParamsAsState?: boolean;
}) => {
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  const [params, setUrlSearchParams] = useSearchParams();
  if (useURLParamsAsState) {
    useEffect(() => {
      setUrlSearchParams({ keyword: keyword });
    }, [keyword]);
    useEffect(() => {
      const paramKeyword = params.get("keyword");
      if (paramKeyword) setKeyword(paramKeyword);
    }, [params]);
  }

  return {
    keyword,
    setKeyword,
  };
};

export default useKeyword;
