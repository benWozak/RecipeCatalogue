import { useUser, useUserStats } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, BookOpen, UtensilsCrossed, Camera, Key } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { openUserProfile } = useClerk();

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <Button 
          variant="outline" 
          onClick={() => openUserProfile()}
          className="flex items-center gap-2"
        >
          <Key size={16} />
          Manage Account
        </Button>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your basic account information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.imageUrl} alt={user.fullName || "Profile"} />
                <AvatarFallback className="text-lg font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => openUserProfile()}
              >
                <Camera size={12} />
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-sm text-muted-foreground">Full Name</Label>
                <p className="text-lg font-medium">{user.fullName || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Username</Label>
                <p className="text-sm">{user.username || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} />
                Email Address
              </Label>
              <p className="text-sm font-medium">
                {user.primaryEmailAddress?.emailAddress || "No email"}
              </p>
              {user.primaryEmailAddress?.verification?.status === "verified" && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                Member Since
              </Label>
              <p className="text-sm font-medium">
                {user.createdAt?.toLocaleDateString() || "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            Account Statistics
          </CardTitle>
          <CardDescription>
            Your activity and content summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {userStats?.recipeCount || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Recipes Created</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <UtensilsCrossed size={16} className="text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {userStats?.mealPlanCount || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Meal Plans</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {Math.floor((Date.now() - (user.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Days as Member</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => openUserProfile()}
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Update Profile</div>
                <div className="text-sm text-muted-foreground">
                  Change your name, email, or profile picture
                </div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openUserProfile()}
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-muted-foreground">
                  Update your account password or security settings
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}