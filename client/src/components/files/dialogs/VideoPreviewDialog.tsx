import { useMemo } from "react";
import ReactPlayer from "react-player";
import { fileApi } from "@/src/services/file-api";
import { CustomDialog } from "../../custom-ui";

interface VideoPreviewDialogProps {
  filePath: string;
  onClose: () => void;
}

export default function VideoPreviewDialog({
  filePath,
  onClose,
}: VideoPreviewDialogProps) {
  const fileUrl = useMemo(() => fileApi.getDownloadUrl(filePath), [filePath]);
  const fileName = useMemo(() => {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return normalizedPath.split("/").pop() ?? filePath;
  }, [filePath]);

  return (
    <CustomDialog
      isOpen
      title={fileName}
      onClose={onClose}
      className="max-w-[92vw] sm:max-w-[80vw]!"
    >
      <div className="relative h-[79vh] w-screen sm:w-[79vw] p-4">
        <div className="h-full w-full overflow-hidden rounded bg-black bg-opacity-5 [&_video]:h-full [&_video]:w-full [&_video]:object-contain">
          <ReactPlayer
            src={fileUrl}
            controls
            playing
            playsInline
            width="100%"
            height="100%"
            className="h-full w-full"
          />
        </div>
      </div>
    </CustomDialog>
  );
}
