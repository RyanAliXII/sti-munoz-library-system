import { useFAQs } from "@hooks/data-fetching/faqs";
import { usePolicy } from "@hooks/data-fetching/policy";
import DOMPurify from "dompurify";
const PolicyPage = () => {
  const { data } = usePolicy({});

  const sanitizedContent = DOMPurify.sanitize(data?.value ?? "");
  return (
    <div className="mt-10 container mx-auto px-2 no-tailwindcss-base ">
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }}></div>
    </div>
  );
};

export default PolicyPage;
