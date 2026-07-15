import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconCode,
  IconBlockquote,
  IconSeparatorHorizontal,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconPhoto,
} from "@tabler/icons-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("firebaseIdToken");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export function RichTextEditor({ id, value, onChange, className }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-sm text-ink",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            setUploading(true);
            uploadImage(file)
              .then((url) => {
                editor?.chain().focus().setImage({ src: url }).run();
              })
              .catch(() => {
                // silently fail on paste upload
              })
              .finally(() => setUploading(false));

            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files) return false;

        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();

            setUploading(true);
            uploadImage(file)
              .then((url) => {
                const coordinates = editor?.view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (coordinates) {
                  editor?.chain().focus().setTextSelection(coordinates.pos).setImage({ src: url }).run();
                } else {
                  editor?.chain().focus().setImage({ src: url }).run();
                }
              })
              .catch(() => {})
              .finally(() => setUploading(false));

            return true;
          }
        }
        return false;
      },
    },
  });

  const setContentFromProps = useCallback(
    (html: string) => {
      if (!editor) return;
      const current = editor.getHTML();
      if (current !== html) {
        editor.commands.setContent(html);
      }
    },
    [editor]
  );

  if (editor && value !== editor.getHTML()) {
    setContentFromProps(value);
  }

  if (!editor) {
    return null;
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch {
      // silently fail
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const btnClass = (active: boolean) =>
    cn("h-8 w-8 p-0", active && "bg-muted text-ink");

  return (
    <div
      id={id}
      className={cn(
        "rounded-md border border-input overflow-hidden",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-surface px-2 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrito"
        >
          <IconBold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italico"
        >
          <IconItalic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Riscado"
        >
          <IconStrikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("heading", { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Titulo 1"
        >
          <IconH1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titulo 2"
        >
          <IconH2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Titulo 3"
        >
          <IconH3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista"
        >
          <IconList className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <IconListNumbers className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citacao"
        >
          <IconBlockquote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={btnClass(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloco de codigo"
        >
          <IconCode className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Insert image button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => fileInputRef.current?.click()}
          title="Inserir imagem"
          disabled={uploading}
        >
          {uploading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <IconPhoto className="h-4 w-4" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal"
        >
          <IconSeparatorHorizontal className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          title="Desfazer"
        >
          <IconArrowBackUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          title="Refazer"
        >
          <IconArrowForwardUp className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
