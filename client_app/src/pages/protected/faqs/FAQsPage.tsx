import { useFAQs } from "@hooks/data-fetching/faqs";
import DOMPurify from "dompurify";
const FAQsPage = () => {
  const { data } = useFAQs({});

  const sanitizedContent = DOMPurify.sanitize(data?.value ?? "");
  return (
    <div className="mt-10 container mx-auto px-2 no-tailwindcss-base ">
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }}></div>
    </div>
  );
};

export default FAQsPage;
