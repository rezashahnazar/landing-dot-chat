export const name = "Menubar";

export const importDocs = `
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "/components/ui/menubar";
`;

export const usageDocs = `
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarItem>Save</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
`;
