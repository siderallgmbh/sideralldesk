import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { marked } from "marked";

// Configure marked with tables enabled
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown (includes tables)
  breaks: true,
});

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "What information is available in the knowledge base?",
  "Summarize the key information available.",
  "What actions would you recommend based on this knowledge?",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send a chat request (reusable for both initial load and user messages)
  const sendChatRequest = async (
    userInput: string,
    history: { role: string; content: string }[],
    addUserMessage: boolean = true
  ) => {
    if (isLoading) return;

    if (addUserMessage && userInput) {
      const userMessage: Message = {
        id: Date.now(),
        role: "user",
        content: userInput,
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    // Create abort controller for stopping the stream
    abortControllerRef.current = new AbortController();

    try {
      // Streaming chat endpoint on the current host (see spec/7-chatui.md)
      const response = await fetch("/stream/web/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: userInput,
          messages: history
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse streaming JSON - each chunk is a JSON string like "Hello"
        // Split by newlines and parse each line
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            // The parsed result is just the string content
            if (typeof parsed === 'string') {
              accumulated += parsed;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              );
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // If no streaming content received, try to parse as regular JSON response
      if (!accumulated) {
        const text = decoder.decode();
        try {
          const data = JSON.parse(text);
          accumulated = data.output || data.message || "No response received";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          );
        } catch {
          // Keep empty if nothing parsed
        }
      }
    } catch (error) {
      // Don't show error toast if user aborted the request
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted by user, keep the partial response
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to send message"
        );
        // Remove empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.content !== ""));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Send initial request with empty input on component mount
  useEffect(() => {
    sendChatRequest("", [], false);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();

    // Build conversation history from existing messages (before adding current user message)
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setInputValue("");
    await sendChatRequest(userInput, history, true);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleReset = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setIsLoading(false);
    // Send initial request with empty input
    setTimeout(() => sendChatRequest("", [], false), 0);
  };

  const handleRAG = async () => {
    if (isLoading) return;
    // Build conversation history from existing messages
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // Send "@" message without showing it in the UI (addUserMessage = false)
    await sendChatRequest("@", history, false);
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return;

    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    await sendChatRequest(question, history, true);
  };

  const showWelcome = !messages.some((message) => message.role === "user");

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleRAG} disabled={isLoading}>
              Knowledge Base
            </Button>
          </div>

          <div className="order-first w-full text-center sm:order-none sm:w-auto sm:flex-1">
            <h1 className="text-xl font-semibold tracking-tight">Siderall Knowledge Desk</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Private AI Knowledge Assistant
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Private Knowledge Connected</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {showWelcome && (
            <section className="rounded-2xl border bg-background p-5 text-center shadow-sm sm:p-7">
              <p className="text-xl font-semibold">Welcome to Siderall Knowledge Desk</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send a message to start the conversation
              </p>
              <div className="mx-auto mt-5 grid max-w-2xl gap-2 sm:grid-cols-3">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    type="button"
                    variant="outline"
                    className="h-auto min-h-16 whitespace-normal px-3 py-3 text-left text-sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </section>
          )}

          {messages.length > 0 && (
            <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border bg-background text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked.parse(message.content) as string }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                  <div className="flex space-x-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2"
          >
            <Input
              id="chat-message"
              name="chat-message"
              type="text"
              aria-label="Message"
              placeholder="Ask Siderall Knowledge Desk..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleStopGeneration}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </Button>
            ) : (
              <Button type="submit" disabled={!inputValue.trim()}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
