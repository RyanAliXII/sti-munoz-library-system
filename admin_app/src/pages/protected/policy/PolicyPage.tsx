import Container from "@components/ui/container/Container";
import { useEditFAQs, useFAQs } from "@hooks/data-fetching/faqs";
import { useEditPolicy, usePolicy } from "@hooks/data-fetching/policy";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import DOMpurify from "dompurify";
import { Button, Tabs } from "flowbite-react";
import { FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
const PolicyPage = () => {
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
  usePolicy({
    onSuccess: (data) => {
      setForm({ content: data.value });
    },
  });

  const editPolicy = useEditPolicy({
    onSuccess: () => {
      toast.success("FAQs updated.");
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    editPolicy.mutate(form.content);
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

export default PolicyPage;
