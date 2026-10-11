import { prisma } from "@/lib/prisma";


export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  let lastChecked = new Date();

  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ roomId, timestamp: lastChecked.toISOString() })}\n\n`));

      const intervalId = setInterval(async () => {
        try {
          const newMessages = await prisma.chatMessage.findMany({
            where: {
              chatRoomId: roomId,
              createdAt: { gt: lastChecked },
            },
            include: {
              sender: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: "asc" },
          });

          if (newMessages.length > 0) {
            lastChecked = newMessages[newMessages.length - 1].createdAt;
            for (const msg of newMessages) {
              controller.enqueue(
                encoder.encode(`event: message\ndata: ${JSON.stringify(msg)}\n\n`)
              );
            }
          } else {
            // Heartbeat
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        } catch {
          // Stream error or client disconnect
          clearInterval(intervalId);
          controller.close();
        }
      }, 1500);

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
