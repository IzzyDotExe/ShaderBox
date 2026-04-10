import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shadcn/ui/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { useChangelogs } from "../hooks/useChangelogs";
import { useState } from "react";

const ChangelogDialog = ({}) => {
  const {
    actions: { setHasSeenLatestChangelog, hasLatestChangelogBeenSeen },
    states: { latestChangelog },
  } = useChangelogs();

  const [isOpen, setIsOpen] = useState(!hasLatestChangelogBeenSeen());

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setHasSeenLatestChangelog() 
        setIsOpen(val => !val)
        return !open;
    }}
    >
      <DialogContent className="dark sm:max-w-5xl w-[50vw] max-h-[85w] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ShaderBox v{latestChangelog.version}</DialogTitle>
          <DialogDescription className="sr-only">
            Latest features and improvements
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-slate dark:prose-invert max-w-none mt-4">
          <ReactMarkdown>{latestChangelog.body}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogDialog;
