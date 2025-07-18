"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Collection } from "@/types/recipe";

interface CollectionComboboxProps {
  collections: Collection[];
  value?: string;
  onValueChange: (value: string | undefined) => void;
  onCreateCollection: (name: string) => Promise<Collection>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CollectionCombobox({
  collections,
  value,
  onValueChange,
  onCreateCollection,
  placeholder = "Select collection...",
  disabled = false,
  className,
}: CollectionComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedCollection = collections.find(
    (collection) => collection.id === value
  );

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const exactMatch = collections.find(
    (collection) => collection.name.toLowerCase() === searchValue.toLowerCase()
  );

  const showCreateOption =
    searchValue.trim() && !exactMatch && searchValue.length >= 2;

  const handleCreateCollection = async () => {
    if (!searchValue.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newCollection = await onCreateCollection(searchValue.trim());
      onValueChange(newCollection.id);
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange(undefined);
    } else {
      onValueChange(selectedValue);
    }
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedCollection ? (
            <span className="truncate">{selectedCollection.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search collections..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue ? "No collections found." : "No collections yet."}
            </CommandEmpty>

            {/* Clear selection option */}
            {value && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleClear}
                  className="text-muted-foreground"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  No collection
                </CommandItem>
              </CommandGroup>
            )}

            {/* Existing collections */}
            {filteredCollections.length > 0 && (
              <CommandGroup heading="Collections">
                {filteredCollections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    value={collection.id}
                    onSelect={() => handleSelect(collection.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === collection.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{collection.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Create new collection option */}
            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateCollection}
                  disabled={isCreating}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? (
                    "Creating..."
                  ) : (
                    <>Create &quot;{searchValue.trim()}&quot;</>
                  )}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
