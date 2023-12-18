import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubcriptionValidator } from "@/lib/validators/subreddits";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("UnAuthorized", { status: 401 });
    }
    const body = await req.json();

    const { subredditId } = SubredditSubcriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new Response("You are already subscribe to this subreddit", {
        status: 400,
      });
    }

    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId,
      },
    });
    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not subscribe, Please try again later!", {
      status: 500,
    });
  }
}
