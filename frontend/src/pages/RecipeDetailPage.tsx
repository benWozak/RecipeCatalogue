import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HtmlRenderer } from "@/components/ui/html-renderer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useRecipe, useDeleteRecipe } from "@/hooks/useRecipes";
import { useRecipeStore } from "@/stores/recipeStore";
import { Recipe, Tag } from "@/types/recipe";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedRecipe, error } = useRecipeStore();
  const { data: recipe, isLoading, error: queryError } = useRecipe(id!);
  const deleteRecipe = useDeleteRecipe();
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions">(
    "ingredients"
  );
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      const selectedIndex = carouselApi.selectedScrollSnap();
      setActiveTab(selectedIndex === 0 ? "ingredients" : "instructions");
    };

    carouselApi.on("select", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  const handleTabChange = (tab: "ingredients" | "instructions") => {
    setActiveTab(tab);
    if (carouselApi) {
      carouselApi.scrollTo(tab === "ingredients" ? 0 : 1);
    }
  };

  const currentRecipe: Recipe | null =
    (recipe && typeof recipe === "object" && recipe !== null && "id" in recipe
      ? (recipe as Recipe)
      : selectedRecipe) || null;
  const displayError = error || queryError?.message;

  const handleDelete = async () => {
    if (!currentRecipe) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentRecipe.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteRecipe.mutate(currentRecipe.id, {
        onSuccess: () => {
          navigate("/recipes");
        },
      });
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(-1)}
              // className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Button>
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              Recipe Details
            </h1>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Error Loading Recipe
            </h2>
            <p className="text-destructive/80 mb-4">{displayError}</p>
            <Button variant="outline" onClick={() => navigate("/recipes")}>
              Back to Recipes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              Recipe Details
            </h1>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Recipe not found</h2>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/recipes")}>
              Back to Recipes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Recipe Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {/* Media Section */}
            {currentRecipe.media && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Media</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentRecipe.media.images &&
                    currentRecipe.media.images.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          Images ({currentRecipe.media.images.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {currentRecipe.media.images.map(
                            (image: any, index: number) => {
                              const imageUrl =
                                typeof image === "string" ? image : image?.url;
                              const imageAlt =
                                typeof image === "object" && image?.alt
                                  ? image.alt
                                  : `Recipe image ${index + 1}`;
                              const imageSource =
                                typeof image === "object" && image?.source
                                  ? image.source
                                  : null;

                              return (
                                <div key={index} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    className="w-full h-auto rounded-lg object-cover max-h-96"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      if (target.parentElement) {
                                        target.parentElement.classList.add(
                                          "bg-muted",
                                          "border",
                                          "border-dashed"
                                        );
                                        target.parentElement.innerHTML =
                                          '<div class="flex items-center justify-center h-32 text-muted-foreground text-sm">Image failed to load</div>';
                                      }
                                    }}
                                  />
                                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                    {imageSource && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {imageSource === "recipe-scrapers"
                                          ? "Auto-detected"
                                          : imageSource === "page-fallback"
                                          ? "Page scan"
                                          : imageSource === "recipe-section"
                                          ? "Recipe section"
                                          : imageSource}
                                      </Badge>
                                    )}
                                    {typeof image === "object" &&
                                      image?.width &&
                                      image?.height && (
                                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                                          {image.width}×{image.height}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  {currentRecipe.media.video_url && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Video</h4>
                      <div className="relative aspect-auto">
                        <video
                          src={currentRecipe.media.video_url}
                          controls
                          className="w-full h-full rounded-lg object-cover"
                          poster={currentRecipe.media.video_thumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {currentRecipe.media.video_thumbnail &&
                    !currentRecipe.media.video_url && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Video Thumbnail</h4>
                        <div className="relative">
                          <img
                            src={currentRecipe.media.video_thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-auto rounded-lg object-cover max-h-96"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <div className="bg-white/90 rounded-full p-3">
                              <svg
                                className="w-8 h-8 text-gray-700"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {currentRecipe.source_url && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" asChild className="w-full">
                        <a
                          href={currentRecipe.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Original Source
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recipe Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipe Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentRecipe.prep_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prep Time</span>
                    <span>{formatTime(currentRecipe.prep_time)}</span>
                  </div>
                )}
                <hr />
                {currentRecipe.cook_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cook Time</span>
                    <span>{formatTime(currentRecipe.cook_time)}</span>
                  </div>
                )}
                <hr />
                <span className="text-muted-foreground">Tags</span>
                {currentRecipe.tags && currentRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentRecipe.tags.map((tag: Tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <hr />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">
                      {currentRecipe.source_type}
                    </span>
                    {currentRecipe.source_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={currentRecipe.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex md:flex-row flex-col md:justify-between">
                  <CardTitle className="text-2xl mb-2">
                    {currentRecipe.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="default" asChild>
                      <Link to={`/recipes/${currentRecipe.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteRecipe.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteRecipe.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
                {currentRecipe.description && (
                  <p className="text-muted-foreground my-4">
                    {currentRecipe.description}
                  </p>
                )}

                {/* Recipe Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {currentRecipe.total_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(currentRecipe.total_time)}</span>
                    </div>
                  )}
                  {currentRecipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{currentRecipe.servings} servings</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(currentRecipe.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Mobile/Tablet Toggle Tabs */}
                <div className="lg:hidden mb-6">
                  <div className="flex items-center bg-muted rounded-lg w-fit">
                    <Button
                      variant={
                        activeTab === "ingredients" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => handleTabChange("ingredients")}
                      className="flex items-center gap-2 rounded-md"
                    >
                      Ingredients
                    </Button>
                    <Button
                      variant={
                        activeTab === "instructions" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => handleTabChange("instructions")}
                      className="flex items-center gap-2 rounded-md"
                    >
                      Instructions
                    </Button>
                  </div>
                </div>

                {/* Mobile/Tablet Carousel View */}
                <div className="lg:hidden">
                  <Carousel
                    setApi={setCarouselApi}
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                  >
                    <CarouselContent>
                      <CarouselItem>
                        <div>
                          <h3 className="text-xl font-semibold mb-4">
                            Ingredients
                          </h3>
                          {(() => {
                            if (!currentRecipe.ingredients) {
                              return (
                                <p className="text-muted-foreground">
                                  No ingredients listed
                                </p>
                              );
                            }

                            if (
                              typeof currentRecipe.ingredients === "object" &&
                              currentRecipe.ingredients.content
                            ) {
                              return (
                                <HtmlRenderer
                                  content={currentRecipe.ingredients.content}
                                />
                              );
                            }

                            if (typeof currentRecipe.ingredients === "string") {
                              return (
                                <HtmlRenderer
                                  content={currentRecipe.ingredients}
                                />
                              );
                            }

                            return (
                              <p className="text-muted-foreground">
                                No ingredients listed
                              </p>
                            );
                          })()}
                        </div>
                      </CarouselItem>
                      <CarouselItem>
                        <div>
                          <h3 className="text-xl font-semibold mb-4">
                            Instructions
                          </h3>
                          {(() => {
                            if (!currentRecipe.instructions) {
                              return (
                                <p className="text-muted-foreground">
                                  No instructions provided
                                </p>
                              );
                            }

                            if (
                              typeof currentRecipe.instructions === "object" &&
                              currentRecipe.instructions.content
                            ) {
                              return (
                                <HtmlRenderer
                                  content={currentRecipe.instructions.content}
                                />
                              );
                            }

                            if (
                              typeof currentRecipe.instructions === "string"
                            ) {
                              return (
                                <HtmlRenderer
                                  content={currentRecipe.instructions}
                                />
                              );
                            }

                            return (
                              <p className="text-muted-foreground">
                                Unable to display instructions
                              </p>
                            );
                          })()}
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                  </Carousel>
                </div>

                {/* Desktop Side-by-Side View */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                    {(() => {
                      if (!currentRecipe.ingredients) {
                        return (
                          <p className="text-muted-foreground">
                            No ingredients listed
                          </p>
                        );
                      }

                      if (
                        typeof currentRecipe.ingredients === "object" &&
                        currentRecipe.ingredients.content
                      ) {
                        return (
                          <HtmlRenderer
                            content={currentRecipe.ingredients.content}
                          />
                        );
                      }

                      if (typeof currentRecipe.ingredients === "string") {
                        return (
                          <HtmlRenderer content={currentRecipe.ingredients} />
                        );
                      }

                      return (
                        <p className="text-muted-foreground">
                          No ingredients listed
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Instructions</h3>
                    {(() => {
                      if (!currentRecipe.instructions) {
                        return (
                          <p className="text-muted-foreground">
                            No instructions provided
                          </p>
                        );
                      }

                      if (
                        typeof currentRecipe.instructions === "object" &&
                        currentRecipe.instructions.content
                      ) {
                        return (
                          <HtmlRenderer
                            content={currentRecipe.instructions.content}
                          />
                        );
                      }

                      if (typeof currentRecipe.instructions === "string") {
                        return (
                          <HtmlRenderer content={currentRecipe.instructions} />
                        );
                      }

                      return (
                        <p className="text-muted-foreground">
                          Unable to display instructions
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
