export const dynamic = 'force-dynamic';

import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@clerk/nextjs/server";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <ChatPage params={props.params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    redirect("/");
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  if (chat.visibility === "private") {
    if (userId !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel="google/gemini-2.0-flash-exp"
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility}
        isReadonly={userId !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}