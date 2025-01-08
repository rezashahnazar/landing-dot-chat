export const name = "Toast";

export const importDocs = `
import { useToast } from "/components/ui/use-toast";
import { Button } from "/components/ui/button";
`;

export const usageDocs = `
function ToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled",
          description: "Your message has been scheduled",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
`;
