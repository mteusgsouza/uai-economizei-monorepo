import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onRemove?: () => void;
  isCover?: boolean;
}

export function ImageUpload({ value, onChange, label, onRemove, isCover }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset error state when value changes
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    if (imgError) setImgError(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const token = localStorage.getItem("firebaseIdToken");

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
      toast.success("Imagem enviada com sucesso");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-col gap-3">
        <div className={cn("shrink-0 h-36 w-20 rounded-md border border-hairline bg-surface overflow-hidden flex items-center justify-center", isCover && "h-[360px] w-full")}>
          {value && !imgError ? (
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <IconPhoto className="h-6 w-6 text-stone" />
          )}
        </div>
        <div className="flex gap-2 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... ou faca upload"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <IconUpload className="h-4 w-4 mr-2" />
              )}
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {onRemove && (
              <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
                <IconX className="h-4 w-4 mr-1" />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
