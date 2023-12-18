import dynamic from "next/dynamic";
import { FC } from "react";
import CustomImageRenderer from "./renderers/CustomImageRenderer";
import CustomCodeRenderer from "./renderers/CustomCodeRenderer";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  {
    ssr: false,
  }
);
const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};
interface EditorOutputProps {
  content: any;
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      data={content}
      style={style}
      className="text-sm"
      renderers={renderers}
    />
  );
};

export default EditorOutput;
