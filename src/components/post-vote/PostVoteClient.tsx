"use client";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
interface PostVoteClientProps {
  postId: string;
  initialVoteAmount: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVoteAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToasts();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote, data } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };
      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVoteAmt((pre) => pre - 1);
      else setVoteAmt((pre) => pre + 1);
      setCurrentVote(prevVote);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Something went wrong.",
        description: "Your vote was not registered. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);
        if (type === "UP") setVoteAmt((prev) => prev - 1);
        else if (type === "DOWN") setVoteAmt((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote(type);
        if (type === "UP") setVoteAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UP")}
        size={"sm"}
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn({
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      {/* score */}
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {voteAmt}
      </p>
      <Button
        size={"sm"}
        onClick={() => vote("DOWN")}
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
