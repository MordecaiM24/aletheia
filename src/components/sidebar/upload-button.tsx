"use client";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function UploadButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <DialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Upload</DialogTitle>
            <UploadTabs setOpen={setOpen} />
          </DialogContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Dialog>
  );
}

export function UploadTabs({ setOpen }: { setOpen: (open: boolean) => void }) {
  return (
    <Tabs defaultValue="file" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="file">File</TabsTrigger>
        <TabsTrigger value="folder">Folder</TabsTrigger>
        <TabsTrigger value="url">URL</TabsTrigger>
      </TabsList>

      <TabsContent value="file">
        <FileUploadForm setOpen={setOpen} />
      </TabsContent>
      <TabsContent value="folder">
        <FolderUploadForm setOpen={setOpen} />
      </TabsContent>
      <TabsContent value="url">
        <URLUploadForm setOpen={setOpen} />
      </TabsContent>
    </Tabs>
  );
}

function FileUploadForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const formSchema = z.object({
    file: z
      .instanceof(File)
      .refine(
        (file) =>
          ["application/pdf", "text/plain", "application/json"].includes(
            file.type
          ),
        {
          message: "Invalid document file type",
        }
      ),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormSchema) {
    try {
      const formData = new FormData();
      formData.append("file", values.file);

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setOpen(false);
      toast.success("Upload successful");
    } catch (error) {
      toast.error("Upload failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.txt,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>Upload a PDF, TXT, or JSON file</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Uploading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

function FolderUploadForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const formSchema = z.object({
    files: z
      .array(z.instanceof(File))
      .min(1, "select at least one file")
      .refine(
        (files) =>
          files.every((file) =>
            ["application/pdf", "text/plain", "application/json"].includes(
              file.type
            )
          ),
        {
          message: "Only PDF, TXT, and JSON files allowed",
        }
      ),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormSchema) {
    try {
      const formData = new FormData();
      values.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload/folder", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("folder upload failed");
      }

      setOpen(false);
      toast.success("Upload successful");
    } catch (error) {
      toast.error("Upload failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="files"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Folder</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.json"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      onChange(files);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Upload a folder of documents (PDF, TXT, JSON)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Uploading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

function URLUploadForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const formSchema = z.object({
    url: z.string().url("Enter a valid URL").min(1, "URL required"),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormSchema) {
    try {
      const response = await fetch("/api/upload/drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: values.url }),
      });

      if (!response.ok) {
        throw new Error("link upload failed");
      }

      setOpen(false);
      toast.success("Upload successful");
    } catch (error) {
      toast.error("Upload failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (Google Drive)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/file/"
                  {...field}
                />
              </FormControl>
              <FormDescription>Upload a Google Drive link</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Uploading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
