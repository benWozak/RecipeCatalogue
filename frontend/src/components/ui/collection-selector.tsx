import { useState } from "react";
import { Check, ChevronsUpDown, FolderPlus } from "lucide-react";
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
import { useCollections } from "@/hooks/useCollections";
import { Collection } from "@/types/recipe";

interface CollectionSelectorProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CollectionSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select collection...",
  className,
  disabled = false
}: CollectionSelectorProps) {
  const [open, setOpen] = useState(false);
  const { collections, isLoading } = useCollections();

  const selectedCollection = collections?.find(collection => collection.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`}
          disabled={disabled || isLoading}
        >
          {selectedCollection ? (
            <span className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              {selectedCollection.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search collections..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading collections..." : "No collections found."}
            </CommandEmpty>
            <CommandGroup>
              {/* Option to remove from collection */}
              <CommandItem
                value="none"
                onSelect={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    !value ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="text-muted-foreground">No collection</span>
              </CommandItem>
              
              {/* Collection options */}
              {collections?.map((collection) => (
                <CommandItem
                  key={collection.id}
                  value={collection.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? null : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === collection.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{collection.name}</div>
                      {collection.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {collection.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}