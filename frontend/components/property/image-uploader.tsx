"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, X, AlertCircle } from "lucide-react";
import type { PropertyMediaInput } from "@/lib/shared/validation";
import { MAX_PROPERTY_IMAGES } from "@/lib/shared/validation";
import { getUploadSignature, uploadImageToCloudinary } from "@/services/media.service";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface PendingUpload {
  id: string;
  previewUrl: string;
  progress: number;
  error?: string;
}

/** Keeps `order` in sync with array position — index 0 is the cover image shown on cards. */
function withOrder(media: PropertyMediaInput[]): PropertyMediaInput[] {
  return media.map((m, i) => ({ ...m, order: i }));
}

export function ImageUploader({
  value,
  onChange,
  onUploadingChange,
}: {
  value: PropertyMediaInput[];
  onChange: (media: PropertyMediaInput[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Uploads resolve out of order and after re-renders, so read the latest value through a ref.
  const valueRef = useRef(value);
  valueRef.current = value;

  const uploading = pending.some((p) => !p.error);
  useEffect(() => onUploadingChange?.(uploading), [uploading, onUploadingChange]);

  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setNotice(null);

    const slotsLeft = MAX_PROPERTY_IMAGES - value.length - pending.filter((p) => !p.error).length;
    const files = Array.from(fileList);
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_BYTES).slice(0, Math.max(0, slotsLeft));

    const skipped = files.length - valid.length;
    if (skipped > 0) {
      setNotice(
        `${skipped} file${skipped > 1 ? "s were" : " was"} skipped — use JPG, PNG, WebP or AVIF under 10 MB, up to ${MAX_PROPERTY_IMAGES} images.`
      );
    }
    if (valid.length === 0) return;

    let signature;
    try {
      signature = await getUploadSignature();
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : "Couldn't start the upload. Please try again.");
      return;
    }

    const batch = valid.map((file) => ({
      file,
      entry: { id: crypto.randomUUID(), previewUrl: URL.createObjectURL(file), progress: 0 } as PendingUpload,
    }));
    setPending((prev) => [...prev, ...batch.map((b) => b.entry)]);

    await Promise.all(
      batch.map(async ({ file, entry }) => {
        try {
          const uploaded = await uploadImageToCloudinary(file, signature, (progress) =>
            setPending((prev) => prev.map((p) => (p.id === entry.id ? { ...p, progress } : p)))
          );
          const next = withOrder([...valueRef.current, { ...uploaded, type: "image", alt: "", order: 0 }]);
          valueRef.current = next;
          onChange(next);
          setPending((prev) => prev.filter((p) => p.id !== entry.id));
          URL.revokeObjectURL(entry.previewUrl);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          setPending((prev) => prev.map((p) => (p.id === entry.id ? { ...p, error: message } : p)));
        }
      })
    );
  };

  const remove = (index: number) => onChange(withOrder(value.filter((_, i) => i !== index)));
  const makeCover = (index: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    onChange(withOrder([item!, ...next]));
  };
  const dismissFailed = (id: string) => {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  const full = value.length >= MAX_PROPERTY_IMAGES;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={full}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-line bg-paper px-6 py-8 text-center transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-60",
          dragging && "border-gold bg-gold-100/40"
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-100 text-gold-600">
          <ImagePlus className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-ink">
          {full ? "Image limit reached" : "Click to add photos, or drag them here"}
        </span>
        <span className="text-xs text-ink-300">
          JPG, PNG, WebP or AVIF · up to 10 MB each · {value.length}/{MAX_PROPERTY_IMAGES} added
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {notice && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </p>
      )}

      {(value.length > 0 || pending.length > 0) && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((item, i) => (
            <li key={item.publicId} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink/5">
              <Image src={item.url} alt={`Property photo ${i + 1}`} fill sizes="200px" className="object-cover" />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-paper">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink opacity-100 shadow-card sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <Star className="h-3 w-3" /> Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-card hover:bg-white"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}

          {pending.map((p) => (
            <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable */}
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
                {p.error ? (
                  <>
                    <p className="text-xs font-medium text-red-700">{p.error}</p>
                    <button type="button" onClick={() => dismissFailed(p.id)} className="text-xs font-medium text-ink underline">
                      Dismiss
                    </button>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-ink" />
                    <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-white/80">
                      <div className="h-full bg-gold transition-[width]" style={{ width: `${p.progress}%` }} />
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
