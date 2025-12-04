"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

export function OrganizationFilters() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 500 }),
  );

  return (
    <div className="flex items-center gap-4">
      <InputGroup className="flex-1">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search organizations by name, slug, or email..."
          value={search}
          onChange={(e) => void setSearch(e.target.value)}
        />
      </InputGroup>
    </div>
  );
}
