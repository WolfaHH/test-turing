import type { ReactNode } from "react";
import { DocSidebar, DocsMobileHeader } from "./_components/doc-sidebar";
import { getDocs } from "./doc-manager";

export default async function DocsLayout(props: { children: ReactNode }) {
  const docs = await getDocs();

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <DocsMobileHeader docs={docs} />
      <DocSidebar docs={docs} />
      <main className="flex-1">{props.children}</main>
    </div>
  );
}
