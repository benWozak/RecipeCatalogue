import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecipeFilters } from "@/types/recipe";

interface RecipeSearchProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: RecipeFilters) => void;
  filters: RecipeFilters;
  searchQuery: string;
  availableTags?: string[];
}

export function RecipeSearch({
  onSearch,
  onFiltersChange,
  filters,
  searchQuery,
  availableTags = [],
}: RecipeSearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };


  const handleTagFilter = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setLocalSearchQuery("");
    onSearch("");
  };

  const hasActiveFilters =
    (filters.tags && filters.tags.length > 0) ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search recipes..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </form>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  !
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {availableTags.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Tags
                </div>
                {availableTags.slice(0, 10).map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={filters.tags?.includes(tag) ? "bg-accent" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{tag}</span>
                      {filters.tags?.includes(tag) && <X className="h-3 w-3" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters */}

        {filters.tags?.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => handleTagFilter(tag)}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
