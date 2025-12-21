"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

import { BankAccountCard } from "./bank-account-card";
import { TransactionList } from "./transaction-list";

// --- Sub-components moved outside for better scoping ---

const BankAccounts = ({ accounts }: { accounts: any[] }) => (
  <div className="grid gap-2 w-full">
    {accounts.map((acc) => (
      <div key={acc.id} className="flex flex-col p-3 rounded-xl border bg-card shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">{acc.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{acc.id.slice(0, 8)}...</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold">{acc.balance.toLocaleString()}</span>
          <span className="text-xs font-medium uppercase">{acc.currency_code}</span>
        </div>
      </div>
    ))}
  </div>
);

const PurePreviewMessage = ({
  addToolApprovalResponse,
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding: _requiresScrollPadding,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <div
      className="group/message fade-in w-full animate-in duration-200"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "w-full":
              (message.role === "assistant" &&
                (message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                ) ||
                  message.parts?.some((p) => p.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              const isTable = part.text.includes('|') && part.text.includes('---');
              if (mode === "view") {
                if (isTable) {
      return (
        <div key={key} className="mt-2 mb-4">
          <details className="group border rounded-xl bg-muted/20 hover:bg-muted/40 transition-all overflow-hidden w-full max-w-sm">
            <summary className="list-none cursor-pointer p-3 flex items-center justify-between text-xs font-medium select-none">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-background rounded-md border shadow-sm">📊</span>
                View Detailed Data Table
              </div>
              <span className="transition-transform group-open:rotate-180 opacity-50 text-[10px]">▼</span>
            </summary>
            <div className="p-4 pt-0 border-t bg-background/50 overflow-x-auto">
               <MessageContent data-testid="message-content">
                 <Response>{sanitizeText(part.text)}</Response>
               </MessageContent>
            </div>
          </details>
        </div>
      );
                }
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }
const toolPart = part as any;
         if (toolPart.type === "tool-getBalances") {
  const { toolCallId, state, output } = toolPart;

  if (state === "output-available" && output) {
    return (
      <div className="w-full" key={toolCallId}>
        <BankAccountCard accounts={output} />
      </div>
    );
  }
  return <ToolHeader key={toolCallId} state={state} type="tool-getBalances" />;
}
           

         if (toolPart.type === "tool-getTransactions") {
  const { toolCallId, state, output } = toolPart;

  if (state === "output-available" && output) {
    return (
      <div className="w-full max-w-lg" key={toolCallId}>
        <TransactionList transactions={output} />
      </div>
    );
  }
  return <ToolHeader key={toolCallId} state={state} type="tool-getTransactions" />;
}
            // --- WEATHER TOOL ---
            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;
              const approvalId = (part as { approval?: { id: string } }).approval?.id;
              const isDenied = state === "output-denied" || (state === "approval-responded" && (part as any).approval?.approved === false);

              if (state === "output-available") {
                return (
                  <div className="w-[min(100%,450px)]" key={toolCallId}>
                    <Weather weatherAtLocation={part.output} />
                  </div>
                );
              }

              return (
                <div className="w-[min(100%,450px)]" key={toolCallId}>
                  <Tool className="w-full" defaultOpen={true}>
                    <ToolHeader state={state} type="tool-getWeather" />
                    <ToolContent>
                      {(state === "input-available" || state === "approval-requested" || state === "approval-responded") && (
                        <ToolInput input={part.input} />
                      )}
                      {state === "approval-requested" && approvalId && (
                        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                          <button
                            className="rounded-md px-3 py-1.5 text-muted-foreground text-sm hover:bg-muted"
                            onClick={() => addToolApprovalResponse({ id: approvalId, approved: false })}
                          >
                            Deny
                          </button>
                          <button
                            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm"
                            onClick={() => addToolApprovalResponse({ id: approvalId, approved: true })}
                          >
                            Allow
                          </button>
                        </div>
                      )}
                    </ToolContent>
                  </Tool>
                </div>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;
              if (part.output && "error" in part.output) {
                return (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50" key={toolCallId}>
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }
              return <DocumentPreview isReadonly={isReadonly} key={toolCallId} result={part.output} />;
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;
              if (part.output && "error" in part.output) {
                return (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50" key={toolCallId}>
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }
              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview args={{ ...part.output, isUpdate: true }} isReadonly={isReadonly} result={part.output} />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;
              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && <ToolInput input={part.input} />}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">Error: {String(part.output.error)}</div>
                          ) : (
                            <DocumentToolResult isReadonly={isReadonly} result={part.output} type="request-suggestions" />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.message.id === nextProps.message.id &&
      prevProps.requiresScrollPadding === nextProps.requiresScrollPadding &&
      equal(prevProps.message.parts, nextProps.message.parts) &&
      equal(prevProps.vote, nextProps.vote)
    ) {
      return true;
    }
    return false;
  }
);

export const ThinkingMessage = () => {
  return (
    <div className="group/message fade-in w-full animate-in duration-300" data-role="assistant">
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};