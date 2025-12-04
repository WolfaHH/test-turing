import type { ReactNode } from "react";
import { DocSidebar } from "./_components/doc-sidebar";
import { DocsHeader } from "./_components/docs-header";
import { getDocs } from "./doc-manager";

export default async function RouteLayout(props: { children: ReactNode }) {
  const docs = await getDocs();

  return (
    <div className="flex min-h-screen flex-col">
      <DocsHeader />
      <div className="flex flex-1">
        <DocSidebar docs={docs} />
        <main className="flex-1">{props.children}</main>
      </div>
    </div>
  );
}
