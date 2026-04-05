import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { fileApi } from "@/src/services/file-api";
import type { PreviewType } from "@/src/types/file.type";
import { CustomDialog } from "../../custom-ui";
import { Button } from "../../ui/button";
import { Minus, Plus, RefreshCcw } from "lucide-react";

interface MediaPreviewDialogProps {
  filePath: string;
  fileType: PreviewType;
  onClose: () => void;
}

interface PanOffset {
  x: number;
  y: number;
}

export default function MediaPreviewDialog({
  filePath,
  fileType,
  onClose,
}: MediaPreviewDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<PanOffset>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // wheel debounce / accumulation
  const wheelAccum = useRef<number>(0);
  const wheelDebounceRef = useRef<number | undefined>(undefined);
  // slider local value (updates immediately), applied to `zoom` after debounce
  const [sliderZoom, setSliderZoom] = useState(zoom);

  const fileUrl = useMemo(() => fileApi.getDownloadUrl(filePath), [filePath]);
  const thumbnailUrl = useMemo(
    () => fileApi.getThumbnailUrl(filePath, 1200),
    [filePath],
  );
  const fileName = useMemo(() => {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return normalizedPath.split("/").pop() ?? filePath;
  }, [filePath]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (fileType === "video") return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;

      // accumulate deltas and apply after debounce interval
      wheelAccum.current += delta;
      if (wheelDebounceRef.current) {
        window.clearTimeout(wheelDebounceRef.current);
      }
      wheelDebounceRef.current = window.setTimeout(() => {
        setZoom((prevZoom) => {
          const next = Math.max(1, Math.min(5, prevZoom + wheelAccum.current));
          wheelAccum.current = 0;
          // keep slider in sync
          setSliderZoom(next);
          return next;
        });
        wheelDebounceRef.current = undefined;
      }, 60);
    },
    [fileType],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (fileType === "video" || zoom === 1) return;

      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [fileType, zoom, pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || fileType === "video") return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPan({ x: newX, y: newY });
    },
    [isDragging, fileType, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderZoom(1);
  }, []);

  // keep slider in sync when zoom is changed programmatically
  useEffect(() => {
    setSliderZoom(zoom);
  }, [zoom]);

  // apply slider value to zoom with debounce
  useEffect(() => {
    const id = window.setTimeout(() => {
      setZoom((prev) => {
        const next = Math.max(1, Math.min(5, sliderZoom));
        return next;
      });
    }, 100);
    return () => window.clearTimeout(id);
  }, [sliderZoom]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (wheelDebounceRef.current) {
        window.clearTimeout(wheelDebounceRef.current);
        wheelDebounceRef.current = undefined;
      }
    };
  }, []);

  return (
    <CustomDialog
      isOpen
      title={fileName}
      onClose={onClose}
      className="max-w-[92vw] sm:max-w-[80vw]!"
    >
      <div className="relative h-[79vh] w-screen sm:w-[79vw] p-4">
        {/* Media Container */}
        <div
          ref={containerRef}
          className={`h-full flex items-center justify-center overflow-hidden rounded bg-black bg-opacity-5 ${
            fileType !== "video" && zoom > 1
              ? "cursor-grab active:cursor-grabbing"
              : ""
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {fileType === "video" ? (
            <video controls autoPlay className="h-full w-full object-contain">
              <source src={fileUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              {fileType === "raw" ? (
                <img
                  src={thumbnailUrl}
                  alt={filePath}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <img
                  src={fileUrl}
                  alt={filePath}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              )}
            </div>
          )}
        </div>

        {/* Dynamic Island Controls */}
        {fileType !== "video" && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 group">
            <div
              className={`flex items-center justify-center gap-3 px-3 py-2 rounded-full transition-all duration-300 border border-border-glass-bright bg-surface-elevated`}
            >
              {/* Zoom Out Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-primary hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white transition-colors"
                onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                title="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </Button>

              {/* Slider */}
              <div className="flex items-center gap-2 w-32">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-primary/30 dark:bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-white hover:bg-primary/40 hover:dark:bg-white/40 transition-colors"
                  title="Zoom slider"
                />
              </div>

              {/* Zoom In Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-primary hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white transition-colors"
                onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                title="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* Divider */}
              <div className="w-px h-6 bg-white/20"></div>

              {/* Reset Button */}
              <Button
                size="icon"
                variant="ghost"
                className="text-primary hover:bg-primary/20 hover:text-primary dark:text-white hover:dark:bg-white/20 hover:dark:text-white transition-colors"
                onClick={handleReset}
                title="Reset zoom and pan"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Helper Text */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm">
                Drag to pan • Scroll to zoom
              </span>
            </div>
          </div>
        )}
      </div>
    </CustomDialog>
  );
}
