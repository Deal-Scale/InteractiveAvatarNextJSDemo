import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SessionConfigHeader() {
  return (
    <div className="px-6 py-5 border-b border-border">
      <DialogHeader>
        <DialogTitle className="text-lg md:text-xl font-semibold">
          Session Configuration
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Adjust your avatar and voice settings before starting the session.
        </DialogDescription>
      </DialogHeader>
    </div>
  );
}
