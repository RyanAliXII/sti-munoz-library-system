import Container from "@components/ui/container/Container";
import { useForm } from "@hooks/useForm";
import { Editor } from "@tinymce/tinymce-react";
import { Tabs } from "flowbite-react";
import DOMpurify from "dompurify";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { useRequest } from "@hooks/useRequest";
const FAQsPage = () => {
  const { form, setForm } = useForm({
    initialFormData: {
      content: "",
    },
  });
  const handleEditorChange = (content: string) => {
    setForm({ content });
  };
  const UploadUrl = `${BASE_URL_V1}/contents`;
  const sanitizedHtmlContent = DOMpurify.sanitize(form.content);
  const { Post } = useRequest();
  const handleFileUpload = async (blobInfo: any) => {
    const formData = new FormData();
    formData.append("file", blobInfo.blob());
    const { data: response } = await Post("/contents", formData);
    const { data } = response;
    return data?.location ?? "";
  };
  return (
    <Container>
      <Tabs.Group>
        <Tabs.Item active title="Editor">
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
        </Tabs.Item>

        <Tabs.Item title="Preview">
          <div
            className="no-tailwindcss-base"
            dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}
          ></div>
        </Tabs.Item>
      </Tabs.Group>
    </Container>
  );
};

export default FAQsPage;
