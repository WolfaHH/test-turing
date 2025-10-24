"use client";

import type { ComponentProps } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CmdOrOption } from "@/components/nowts/keyboard-shortcut";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import type { AuthRole } from "@/lib/auth/auth-permissions";
import { CornerDownLeft, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ORGANIZATION_LINKS } from "./org-navigation.links";
import { useHotkeys } from "react-hotkeys-hook";

function OrgCommandItem({
  children,
  className,
  ...props
}: ComponentProps<typeof CommandItem>) {
  return (
    <CommandItem
      className={cn(
        "data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent !px-3 font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

export function OrgCommand(props: {
  roles: AuthRole[] | undefined;
  orgSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : "";

  const down = () => {
    setOpen((open) => !open);
  };

  useHotkeys("mod+k", down);

  return (
    <>
      <div className="relative w-full">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
        <Input
          type="search"
          placeholder="Search..."
          className="bg-background w-full appearance-none pl-8 shadow-none"
          onClick={() => {
            setOpen(true);
          }}
        />

        <div className="pointer-events-none absolute top-2.5 right-2.5 inline-flex h-5 items-center gap-1 select-none">
          <KbdGroup>
            <Kbd>
              <CmdOrOption />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search documentation...</DialogTitle>
            <DialogDescription>
              Search for a command to run...
            </DialogDescription>
          </DialogHeader>
          <Command className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
              <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
                No results found.
              </CommandEmpty>
              {ORGANIZATION_LINKS.map((link, index) => (
                <CommandGroup
                  heading={link.title}
                  key={index}
                  className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
                >
                  {link.links.map((link) => (
                    <OrgCommandItem
                      key={link.href}
                      onSelect={() => {
                        router.push(
                          link.href.replace(":organizationSlug", orgSlug),
                        );
                        setOpen(false);
                      }}
                    >
                      <link.Icon className="size-4" />
                      <span>{link.label}</span>
                    </OrgCommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
          <div className="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-2">
              <Kbd>
                <CornerDownLeft className="size-3" />
              </Kbd>
              Go to Page
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
