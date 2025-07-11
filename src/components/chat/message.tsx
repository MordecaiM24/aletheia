import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cva } from "class-variance-authority";
import React from "react";
import { UIMessage } from "ai";

interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: UIMessage;
}

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, message, ...props }, ref) => {
    const isUser = message.role === "user";

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-4",
          isUser ? "ml-auto justify-end" : "mr-auto justify-start",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex flex-col gap-2 rounded-xl px-3 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {message.content.length > 0 && (
            <MarkdownContent id={message.id} content={message.content} />
          )}
        </div>
      </div>
    );
  },
);
