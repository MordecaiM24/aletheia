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
} from "../ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
            <UploadForm setOpen={setOpen} />
          </DialogContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Dialog>
  );
}

function UploadForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const formSchema = z.object({
    filename: z.string().min(2).max(50),
    file: z
      .instanceof(File)
      .refine((file) => ["application/pdf", "text/plain"].includes(file.type), {
        message: "Invalid document file type",
      }),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filename: "",
    },
  });

  async function onSubmit(values: FormSchema) {
    try {
      const formData = new FormData();
      formData.append("filename", values.filename);
      formData.append("file", values.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log(data);
      setOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filename</FormLabel>
              <FormControl>
                <Input placeholder="Filename..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>Upload a PDF or TXT file</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
