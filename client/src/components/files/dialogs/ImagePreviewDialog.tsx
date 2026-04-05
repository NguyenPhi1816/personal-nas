"use client";

import { useEffect, useMemo, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Minus, Plus, RefreshCcw, RotateCcw, RotateCw } from "lucide-react";
import { fileApi } from "@/src/services/file-api";
import type { PreviewType } from "@/src/types/file.type";
import { CustomDialog } from "../../custom-ui";
import { Button } from "../../ui/button";

type ImagePreviewType = Extract<PreviewType, "image" | "raw">;

interface ImagePreviewDialogProps {
  filePath: string;
  fileType: ImagePreviewType;
  onClose: () => void;
}

interface TransformState {
  scale: number;
  positionX: number;
  positionY: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

const INITIAL_TRANSFORM: TransformState = {
  scale: 1,
  positionX: 0,
  positionY: 0,
};

const clampScale = (value: number) =>
  Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));

export default function ImagePreviewDialog({
  filePath,
  fileType,
  onClose,
}: ImagePreviewDialogProps) {
  const [transformState, setTransformState] =
    useState<TransformState>(INITIAL_TRANSFORM);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [rotation, setRotation] = useState(0);

  const fileUrl = useMemo(() => fileApi.getDownloadUrl(filePath), [filePath]);
  const thumbnailUrl = useMemo(
    () => fileApi.getThumbnailUrl(filePath, 1200),
    [filePath],
  );
  const fileName = useMemo(() => {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return normalizedPath.split("/").pop() ?? filePath;
  }, [filePath]);

  const imageSrc = fileType === "raw" ? thumbnailUrl : fileUrl;

  useEffect(() => {
    setHasLoadError(false);
    setTransformState(INITIAL_TRANSFORM);
    setRotation(0);
  }, [imageSrc]);

  const handleSourceError = () => {
    setHasLoadError(true);
  };

  // Tích lũy tự do, không % 360 để tránh transition xoay ngược
  const rotate = (direction: "left" | "right") => {
    setRotation((prev) => prev + (direction === "right" ? 90 : -90));
  };

  // Chỉ dùng modulo ở đây để tính trạng thái xoay ngang/dọc
  const isOdd90 = Math.abs(rotation % 180) === 90;

  return (
    <CustomDialog
      isOpen
      title={fileName}
      onClose={onClose}
      className="max-w-[92vw] sm:max-w-[80vw]!"
    >
      <div className="relative h-[79vh] w-screen sm:w-[79vw] p-4">
        <TransformWrapper
          key={imageSrc}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          centerOnInit
          centerZoomedOut
          wheel={{ step: 0.12 }}
          doubleClick={{ disabled: true }}
          panning={{
            disabled: transformState.scale <= MIN_SCALE,
            excluded: ["input"],
          }}
          onTransformed={(_, state) => {
            setTransformState(state);
          }}
        >
          {({ zoomIn, zoomOut, setTransform, resetTransform }) => {
            const applyScale = (nextScale: number) => {
              setTransform(
                transformState.positionX,
                transformState.positionY,
                clampScale(nextScale),
                80,
              );
            };

            return (
              <>
                <div
                  className={`h-full overflow-hidden rounded bg-black bg-opacity-5 ${
                    transformState.scale > MIN_SCALE
                      ? "cursor-grab active:cursor-grabbing"
                      : ""
                  }`}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {hasLoadError ? (
                      <div className="text-sm text-text-muted">
                        Failed to load preview
                      </div>
                    ) : (
                      <img
                        src={imageSrc}
                        alt={filePath}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transition: "transform 0.25s ease",
                          maxWidth: isOdd90 ? "calc(79vh - 2rem)" : "100%",
                          maxHeight: isOdd90 ? "calc(79vw - 2rem)" : "100%",
                          width: isOdd90 ? "auto" : "100%",
                          height: isOdd90 ? "auto" : "100%",
                          objectFit: "contain",
                        }}
                        className="block select-none"
                        draggable={false}
                        onError={handleSourceError}
                      />
                    )}
                  </TransformComponent>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 group">
                  <div className="flex items-center justify-center gap-3 rounded-full border border-border-glass-bright bg-surface-elevated px-3 py-2 transition-all duration-300">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary transition-colors hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white"
                      onClick={() => rotate("left")}
                      title="Rotate left"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary transition-colors hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white"
                      onClick={() => rotate("right")}
                      title="Rotate right"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>

                    <div className="h-6 w-px bg-white/20" />

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary transition-colors hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white"
                      onClick={() => zoomOut(0.2)}
                      title="Zoom out"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="flex w-32 items-center gap-2">
                      <input
                        type="range"
                        min={MIN_SCALE}
                        max={MAX_SCALE}
                        step="0.1"
                        value={Number(transformState.scale.toFixed(2))}
                        onChange={(event) => {
                          applyScale(parseFloat(event.target.value));
                        }}
                        className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-primary/30 accent-primary transition-colors hover:bg-primary/40 dark:bg-white/30 dark:accent-white hover:dark:bg-white/40"
                        title="Zoom slider"
                      />
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary transition-colors hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white"
                      onClick={() => zoomIn(0.2)}
                      title="Zoom in"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <div className="h-6 w-px bg-white/20" />

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary transition-colors hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white"
                      onClick={() => {
                        resetTransform(80);
                        setTransformState(INITIAL_TRANSFORM);
                        // Làm tròn về bội số 360 gần nhất để transition không giật
                        setRotation((prev) => Math.round(prev / 360) * 360);
                      }}
                      title="Reset zoom, pan and rotation"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="whitespace-nowrap rounded bg-white/80 px-2 py-1 text-xs text-gray-600 backdrop-blur-sm">
                      Drag to pan • Scroll to zoom • Rotate with buttons
                    </span>
                  </div>
                </div>
              </>
            );
          }}
        </TransformWrapper>
      </div>
    </CustomDialog>
  );
}
