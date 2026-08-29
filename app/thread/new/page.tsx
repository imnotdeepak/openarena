import { ThreadView } from "@/app/arena/thread-view";

export default function NewThreadPage() {
  return (
    <ThreadView
      threadId={null}
      threadName="New thread"
      initialTurns={[]}
      isOwner
    />
  );
}
