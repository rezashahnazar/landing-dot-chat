import { FC } from "react";

export const name = "Collapsible";

export const importDocs = `
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "/components/ui/collapsible";
`;

export const usageDocs = `
<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    Content that can be collapsed and expanded.
  </CollapsibleContent>
</Collapsible>
`;
