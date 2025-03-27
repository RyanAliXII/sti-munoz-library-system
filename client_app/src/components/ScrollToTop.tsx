import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({top:0});
  }, [location]);

  return null;
}