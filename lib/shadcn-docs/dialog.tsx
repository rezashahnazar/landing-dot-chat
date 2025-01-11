export const name = "Dialog";

export const importDocs = `
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "/components/ui/dialog";
`;

export const usageDocs = `
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent aria-describedby={undefined}>
    <DialogTitle>Dialog Title</DialogTitle>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a dialog description.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
`;
