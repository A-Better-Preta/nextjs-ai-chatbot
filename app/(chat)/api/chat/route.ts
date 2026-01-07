import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { auth } from "@clerk/nextjs/server";
type UserType = "regular"; // Default for now

import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { syncBankingData } from "@/lib/ai/tools/sync-banking-data";
import { getFinancialOverview } from "@/lib/ai/tools/get-financial-overview";
import { isProductionEnvironment } from "@/lib/constants";

import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

<<<<<<< HEAD
// Import your pre-defined tools
import { getAccountBalances, getRecentTransactions } from "@/lib/ai/tools/bank-accounts";
=======
import { getUserDb } from "@/lib/db/local-db";
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)

export const maxDuration = 60;


let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(" > Resumable streams are disabled due to missing REDIS_URL");
      } else {
        console.error(error);
      }
    }
  }
  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
<<<<<<< HEAD
    const { id, message, messages, selectedChatModel, selectedVisibilityType } = requestBody;
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;
=======
    const { id, message, messages, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const { userId } = await auth();
 
    if (!userId) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }
 
    const userType: UserType = "regular"; // Clerk users are regular by default
 
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)
    const messageCount = await getMessageCountByUserId({
      id: userId,
      differenceInHours: 24,
    });
 
    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const isToolApprovalFlow = Boolean(messages);
    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== userId) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      if (!isToolApprovalFlow) {
        messagesFromDb = await getMessagesByChatId({ id });
      }
    } else if (message?.role === "user") {
      await saveChat({
        id,
        userId: userId,
        title: "New chat",
        visibility: selectedVisibilityType,
      });
      titlePromise = generateTitleFromUserMessage({ message });
    }

    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : [...convertToUIMessages(messagesFromDb), message as ChatMessage];

    const { longitude, latitude, city, country } = geolocation(request);
    const requestHints: RequestHints = { longitude, latitude, city, country };

    if (message?.role === "user") {
      await saveMessages({
        messages: [{
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        }],
      });
    }

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      originalMessages: isToolApprovalFlow ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        if (titlePromise) {
          titlePromise.then((title) => {
            updateChatTitleById({ chatId: id, title });
            dataStream.write({ type: "data-chat-title", data: title });
          });
        }

        const isReasoningModel = selectedChatModel.includes("reasoning") || selectedChatModel.includes("thinking");

        const result = streamText({
<<<<<<< HEAD
          model: getLanguageModel('google/gemini-1.5-flash'), // Using your helper
          system: systemPrompt({ selectedChatModel: 'google/gemini-1.5-flash', requestHints }),
=======
          model: getLanguageModel('gemini-2.5-flash'),
          system: systemPrompt({ selectedChatModel: 'gemini-2.5-flash', requestHints }),
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)
          messages: await convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools: isReasoningModel
            ? []
            : [
                "getWeather",
                "createDocument",
                "updateDocument",
                "requestSuggestions",
<<<<<<< HEAD
                "getBalances",
                "getTransactions",
=======
                "syncBankingData",
                "getFinancialOverview",
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)
              ],
          experimental_transform: isReasoningModel ? undefined : smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
<<<<<<< HEAD
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({ session, dataStream }),
            // Map the imported tools here
            getBalances: getAccountBalances,
            getTransactions: getRecentTransactions,
=======
            createDocument: createDocument({ userId, dataStream }),
            updateDocument: updateDocument({ userId, dataStream }),
            requestSuggestions: requestSuggestions({
              userId,
              dataStream,
            }),
            syncBankingData: tool(syncBankingData),
            getFinancialOverview: tool(getFinancialOverview),
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();
        dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        // ... existing save logic ...
        if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              parts: msg.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
        }
      },
    });

    const streamContext = getStreamContext();
    if (streamContext) {
      const resumableStream = await streamContext.resumableStream(streamId, () => stream.pipeThrough(new JsonToSseTransformStream()));
      if (resumableStream) return new Response(resumableStream);
    }
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) return error.toResponse();
    return new ChatSDKError("offline:chat").toResponse();
  }
<<<<<<< HEAD
}
=======
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const { userId } = await auth();
 
  if (!userId) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }
 
  const chat = await getChatById({ id });
 
  if (chat?.userId !== userId) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
>>>>>>> 70691e0 (feat: Add PWA support with financial dashboard and push notifications)
