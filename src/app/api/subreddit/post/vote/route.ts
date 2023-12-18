import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";
const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("UnAuthorized", { status: 401 });
    }
    const body = await req.json();
    console.log(body);

    const { postId, voteType } = PostVoteValidator.parse(body);

    const voteExists = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post Not found", { status: 404 });
    }
    if (voteExists) {
      if (voteExists.type === voteType) {
        console.log("same");
        await db.vote.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
        });
        return new Response("ok");
      }
      await db.vote.update({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
        data: {
          type: voteType,
        },
      });

      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachedPayload: CachedPost = {
          id: post.id,
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          createdAt: post.createdAt,
          currentVote: voteType,
          title: post.title,
        };

        await redis.hset(`post:${postId}`, cachedPayload);
      }
      return new Response("OK");
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    });

    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);
    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachedPayload: CachedPost = {
        id: post.id,
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        createdAt: post.createdAt,
        currentVote: voteType,
        title: post.title,
      };
      await redis.hset(`post:${postId}`, cachedPayload);
    }
    return new Response("OK");
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    return new Response(
      "Could not vote to this post at this time. Please try later",
      { status: 500 }
    );
  }
}
