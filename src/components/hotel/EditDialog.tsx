import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type EditField = {
  label: string;
  value: string;
  hint?: string;
  type?: "text" | "select";
  options?: string[];
};

export type GalleryImage = { id: string; src: string; label: string };

export type EditGallery = {
  images: GalleryImage[];
  coverId: string;
  onDelete: (id: string) => void;
  onCover: (id: string) => void;
  onAdd?: () => void;
};

export type EditTarget = {
  title: string;
  fields: EditField[];
  gallery?: EditGallery;
  onSave?: (values: Record<string, string>) => void;
} | null;

export function EditDialog({
  target,
  onOpenChange,
}: {
  target: EditTarget;
  onOpenChange: (open: boolean) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!target) return;
    setValues(Object.fromEntries(target.fields.map((f) => [f.label, f.value])));
  }, [target]);

  const dirty =
    !!target && target.fields.some((f) => (values[f.label] ?? f.value) !== f.value);

  const save = () => {
    if (!target) return;
    target.onSave?.(values);
    toast.success("Changes saved", { description: `${target.title} updated` });
    onOpenChange(false);
  };

  const gallery = target?.gallery;

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0",
          gallery ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-[17px] capitalize">Edit {target?.title}</DialogTitle>
          <DialogDescription>
            Changes apply to this hotel record as soon as you save.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className={cn("grid gap-4", gallery ? "sm:grid-cols-2" : "grid-cols-1")}>
              {target?.fields.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <Label htmlFor={f.label} className="text-[11.5px] text-muted-foreground">
                    {f.label}
                  </Label>
                  {f.type === "select" ? (
                    <Select
                      value={values[f.label] ?? ""}
                      onValueChange={(v) => setValues((s) => ({ ...s, [f.label]: v }))}
                    >
                      <SelectTrigger id={f.label} className="w-full">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={f.label}
                      value={values[f.label] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [f.label]: e.target.value }))
                      }
                    />
                  )}
                  {f.hint ? (
                    <p className="text-[11.5px] text-muted-foreground">{f.hint}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {gallery ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      Property photos
                    </div>
                    <p className="text-[11.5px] text-muted-foreground">
                      {gallery.images.length} photo{gallery.images.length === 1 ? "" : "s"} · pick a
                      cover or remove what you no longer need
                    </p>
                  </div>
                  {gallery.onAdd ? (
                    <Button type="button" variant="outline" size="sm" onClick={gallery.onAdd}>
                      <ImagePlus className="size-4" /> Add photo
                    </Button>
                  ) : null}
                </div>
                {gallery.images.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
                    No photos left. Add one to show the property.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {gallery.images.map((img) => {
                      const isCover = img.id === gallery.coverId;
                      return (
                        <div
                          key={img.id}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border bg-surface",
                            isCover ? "border-primary ring-2 ring-primary/25" : "border-border",
                          )}
                        >
                          <img
                            src={img.src}
                            alt={img.label}
                            loading="lazy"
                            width={1024}
                            height={768}
                            className="aspect-[4/3] w-full object-cover"
                          />
                          <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <button
                              type="button"
                              onClick={() => gallery.onCover(img.id)}
                              aria-label={`Make ${img.label} the cover photo`}
                              className="grid size-7 place-items-center rounded-md bg-surface/90 text-foreground shadow-sm backdrop-blur hover:text-primary"
                            >
                              <Star className={cn("size-3.5", isCover && "fill-primary text-primary")} />
                            </button>
                            <button
                              type="button"
                              onClick={() => gallery.onDelete(img.id)}
                              aria-label={`Delete ${img.label}`}
                              className="grid size-7 place-items-center rounded-md bg-surface/90 text-foreground shadow-sm backdrop-blur hover:text-danger"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                            <span className="truncate text-[11px] text-muted-foreground">
                              {img.label}
                            </span>
                            {isCover ? (
                              <span className="shrink-0 text-[10px] font-semibold tracking-wide text-primary uppercase">
                                Cover
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-muted/60 px-6 py-4">
            <span className="mr-auto text-[11.5px] text-muted-foreground">
              {dirty ? "Unsaved changes" : "No changes yet"}
            </span>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
