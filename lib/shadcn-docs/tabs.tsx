export const name = "Tabs";

export const importDocs = `
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "/components/ui/tabs";
`;

export const usageDocs = `
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Tab 1 content</TabsContent>
  <TabsContent value="tab2">Tab 2 content</TabsContent>
</Tabs>
`;
