export const name = "Aspect Ratio";

export const importDocs = `
import { AspectRatio } from "/components/ui/aspect-ratio";
`;

export const usageDocs = `
<AspectRatio ratio={16 / 9}>
  <img
    src="..."
    alt="Image"
    className="rounded-md object-cover w-full h-full"
  />
</AspectRatio>
`;
