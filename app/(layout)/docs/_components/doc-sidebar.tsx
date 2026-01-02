"use client";

import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocType } from "../doc-manager";

type DocSidebarProps = {
  docs: DocType[];
};

function useGroupedDocs(docs: DocType[]) {
  const groupedDocs = useMemo(() => {
    const grouped: Record<string, typeof docs> = {
      General: [],
    };

    for (const doc of docs) {
      const subcategory = doc.attributes.subcategory ?? "General";
      grouped[subcategory] ??= [];
      grouped[subcategory].push(doc);
    }

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (
          a.attributes.order !== undefined &&
          b.attributes.order !== undefined
        ) {
          return a.attributes.order - b.attributes.order;
        }
        return a.attributes.title.localeCompare(b.attributes.title);
      });
    });

    return grouped;
  }, [docs]);

  const sortedSubcategories = useMemo(() => {
    return Object.keys(groupedDocs).sort((a, b) => {
      if (a === "General") return -1;
      if (b === "General") return 1;
      return a.localeCompare(b);
    });
  }, [groupedDocs]);

  return { groupedDocs, sortedSubcategories };
}

type DocNavContentProps = {
  docs: DocType[];
  onNavigate?: () => void;
};

function DocNavContent({ docs, onNavigate }: DocNavContentProps) {
  const pathname = usePathname();
  const { groupedDocs, sortedSubcategories } = useGroupedDocs(docs);

  return (
    <nav className="flex flex-col gap-6">
      {sortedSubcategories.map((subcategory) => {
        const subcategoryDocs = groupedDocs[subcategory];

        if (subcategoryDocs.length === 0) return null;

        return (
          <div key={subcategory} className="flex flex-col gap-3">
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {subcategory}
            </h4>
            <ul className="flex flex-col gap-1">
              {subcategoryDocs.map((doc) => {
                const href = `/docs/${doc.slug}`;
                const isActive = pathname === href;
                return (
                  <li key={doc.slug}>
                    <DocLink
                      doc={doc}
                      isActive={isActive}
                      onClick={onNavigate}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function DocSidebar({ docs }: DocSidebarProps) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r lg:block">
      <div className="p-6">
        <DocNavContent docs={docs} />
      </div>
    </aside>
  );
}

export function DocsMobileHeader({ docs }: DocSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentDoc = useMemo(() => {
    return docs.find((doc) => `/docs/${doc.slug}` === pathname);
  }, [docs, pathname]);

  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40 flex h-14 items-center gap-4 border-b px-4 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon-sm">
            <Menu className="size-4" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Documentation</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-6">
            <DocNavContent docs={docs} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      {currentDoc && (
        <span className="text-muted-foreground truncate text-sm">
          {currentDoc.attributes.subcategory && (
            <>
              <span className="text-muted-foreground/60">
                {currentDoc.attributes.subcategory}
              </span>
              <span className="text-muted-foreground/40 mx-2">/</span>
            </>
          )}
          <span className="text-foreground font-medium">
            {currentDoc.attributes.title}
          </span>
        </span>
      )}
    </div>
  );
}

type DocLinkProps = {
  doc: DocType;
  isActive: boolean;
  onClick?: () => void;
};

const getBadgeColor = (method: string): BadgeProps["color"] => {
  if (method === "GET") return "blue";
  if (method === "POST") return "green";
  if (method === "PUT") return "yellow";
  if (method === "DELETE") return "red";
  return "zinc";
};

function DocLink({ doc, isActive, onClick }: DocLinkProps) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      onClick={onClick}
      className={cn(
        "hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        isActive ? "bg-accent text-foreground" : "text-muted-foreground",
      )}
    >
      {doc.attributes.method ? (
        <Badge color={getBadgeColor(doc.attributes.method)}>
          {doc.attributes.method}
        </Badge>
      ) : null}
      {doc.attributes.title}
    </Link>
  );
}
