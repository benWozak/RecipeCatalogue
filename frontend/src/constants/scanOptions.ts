import { Globe, Camera, PlusCircle, Instagram } from "lucide-react";

export const scanOptions = [
  {
    title: "Web URL",
    description: "Paste a link to a recipe website",
    icon: Globe,
    href: "/recipes/scan/url",
    featured: true,
  },
  {
    title: "Instagram URL",
    description: "Parse a recipe from an Instagram post",
    icon: Instagram,
    href: "/recipes/scan/instagram",
    featured: false,
  },
  {
    title: "Image Upload",
    description: "Extract from a photo or screenshot",
    icon: Camera,
    href: "/recipes/scan/image",
    featured: false,
  },
  {
    title: "Manual Entry",
    description: "Create a new recipe from scratch",
    icon: PlusCircle,
    href: "/recipes/scan/manual",
    featured: false,
  },
];