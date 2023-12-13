import Container from "@components/ui/container/Container";
import { useForm } from "@hooks/useForm";
import { Editor } from "@tinymce/tinymce-react";
import { Button, Tabs } from "flowbite-react";
import DOMpurify from "dompurify";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { useRequest } from "@hooks/useRequest";
import { useEditFAQs, useFAQs } from "@hooks/data-fetching/faqs";
import { FaSave } from "react-icons/fa";
import { FormEvent } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
const FAQsPage = () => {
  const { form, setForm } = useForm({
    initialFormData: {
      content: "",
    },
  });
  const handleEditorChange = (content: string) => {
    setForm({ content });
  };

  const { Post } = useRequest();
  const handleFileUpload = async (blobInfo: any) => {
    const formData = new FormData();
    formData.append("file", blobInfo.blob());
    const { data: response } = await Post("/contents", formData);
    const { data } = response;
    return data?.location ?? "";
  };
  useFAQs({
    onSuccess: (data) => {
      setForm({ content: data.value });
    },
  });
  const queryClient = useQueryClient();
  const editFAQs = useEditFAQs({
    onSuccess: () => {
      toast.success("FAQs updated.");
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    editFAQs.mutate(form.content);
  };
  const sanitizedHtmlContent = DOMpurify.sanitize(form.content);
  return (
    <Container>
      <Tabs.Group>
        <Tabs.Item active title="Editor">
          <form onSubmit={onSubmit}>
            <Editor
              init={{
                height: "700",
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "image code",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                ],

                images_upload_handler: handleFileUpload,
                toolbar: "numlist bullist undo redo | image code ",
              }}
              onEditorChange={handleEditorChange}
              value={form.content}
              apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei"
            />
            <Button color="primary" type="submit" className="mt-2">
              <div className="flex items-center gap-2">
                <FaSave />
                Save
              </div>
            </Button>
          </form>
        </Tabs.Item>

        <Tabs.Item title="Preview">
          <div
            className="no-tailwindcss-base"
            dangerouslySetInnerHTML={{
              __html: sanitizedHtmlContent,
            }}
          ></div>
        </Tabs.Item>
      </Tabs.Group>
    </Container>
  );
};

export default FAQsPage;
