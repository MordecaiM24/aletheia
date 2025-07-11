"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/chat/message";

type Status = "submitted" | "streaming" | "error" | "ready";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, stop, status } =
    useChat({
      api: "/api/ai/chat",
    });

  if (messages.length === 0) {
    return (
      <EmptyChat
        handleSubmit={handleSubmit}
        input={input}
        stop={stop}
        handleInputChange={handleInputChange}
        status={status}
      />
    );
  }

  return (
    // 1rem + header height is the height of the header. had to set it here because sticky bullshit and whatnot.
    <div className="stretch mx-auto flex h-[calc(100vh-var(--header-height)-1rem)] w-full max-w-3xl flex-col pb-6">
      <ScrollArea className="h-0 flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => {
            return <ChatMessage key={message.id} message={message} />;
          })}
        </div>
      </ScrollArea>
      <div className="px-4">
        <ChatInput
          onSubmit={handleSubmit}
          value={input}
          onStop={stop}
          onChange={handleInputChange}
          status={status}
        />
      </div>
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit: () => void;
  onStop?: () => void;
  status?: Status;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  status = "ready",
  className,
}: ChatInputProps) {
  const textareaRef = useTextareaResize(value, 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (value.trim().length === 0) return;
      e.preventDefault();
      onSubmit();
    }
  };

  const isLoading = status === "streaming" || status === "submitted";
  const isDisabled = value.trim().length === 0;

  return (
    <div
      className={cn(
        "border-input focus-within:ring-ring flex w-full flex-col items-end rounded-2xl border bg-transparent p-2 focus-within:ring-1 focus-within:outline-none",
        className,
      )}
    >
      <Textarea
        autoFocus
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="max-h-[400px] min-h-0 resize-none overflow-x-hidden border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
      />

      {isLoading && onStop ? (
        <Button
          onClick={onStop}
          className="h-fit shrink-0 rounded-full border p-1.5 dark:border-zinc-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Stop"
          >
            <title>Stop</title>
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </Button>
      ) : (
        <Button
          className="h-fit shrink-0 rounded-full border p-1.5 dark:border-zinc-600"
          disabled={isDisabled}
          onClick={(e) => {
            e.preventDefault();
            if (!isDisabled) onSubmit();
          }}
        >
          <ArrowUpIcon />
        </Button>
      )}
    </div>
  );
}

function EmptyChat({
  handleSubmit,
  input,
  stop,
  handleInputChange,
  status,
}: {
  handleSubmit: () => void;
  input: string;
  stop: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  status: Status;
}) {
  return (
    <div className="mx-auto flex h-[calc(100vh-var(--header-height)-1rem)] w-full max-w-3xl flex-col items-center justify-center pb-6">
      <div className="mb-8 space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Ask anything</h2>
        <p className="text-muted-foreground">
          Ask me anything - I'm here to help with your questions and tasks
        </p>
      </div>
      <div className="w-full max-w-2xl px-4">
        <ChatInput
          onSubmit={handleSubmit}
          value={input}
          onStop={stop}
          onChange={handleInputChange}
          status={status}
        />
      </div>
    </div>
  );
}
