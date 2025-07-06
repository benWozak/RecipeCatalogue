from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageOps
import io
import os
import hashlib
import httpx
from pathlib import Path


class MediaUtils:
    """Utility class for media processing and thumbnail generation"""
    
    # Standard thumbnail sizes for recipe cards
    THUMBNAIL_SIZES = {
        "small": (150, 150),
        "medium": (300, 300),
        "large": (600, 600)
    }
    
    # Supported image formats
    SUPPORTED_FORMATS = {'JPEG', 'PNG', 'WebP', 'GIF'}
    
    def __init__(self, media_dir: str = "media"):
        """Initialize MediaUtils with media directory"""
        self.media_dir = Path(media_dir)
        self.media_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.media_dir / "thumbnails").mkdir(exist_ok=True)
        (self.media_dir / "images").mkdir(exist_ok=True)
    
    async def download_image(self, url: str) -> Optional[bytes]:
        """Download image from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                return response.content
        except Exception as e:
            print(f"Failed to download image from {url}: {e}")
            return None
    
    def create_thumbnail(self, image_data: bytes, size: Tuple[int, int] = (300, 300)) -> Optional[bytes]:
        """Create thumbnail from image data"""
        try:
            # Open image from bytes
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert to RGB if necessary (for formats like PNG with transparency)
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Create thumbnail maintaining aspect ratio
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Create a square thumbnail with white background
                thumb = Image.new('RGB', size, (255, 255, 255))
                
                # Calculate position to center the image
                x = (size[0] - img.width) // 2
                y = (size[1] - img.height) // 2
                
                # Paste the resized image onto the square background
                thumb.paste(img, (x, y))
                
                # Convert back to bytes
                output = io.BytesIO()
                thumb.save(output, format='JPEG', quality=90, optimize=True)
                return output.getvalue()
                
        except Exception as e:
            print(f"Failed to create thumbnail: {e}")
            return None
    
    def create_multiple_thumbnails(self, image_data: bytes) -> Dict[str, Optional[bytes]]:
        """Create multiple thumbnail sizes from image data"""
        thumbnails = {}
        
        for size_name, size_tuple in self.THUMBNAIL_SIZES.items():
            thumbnail_data = self.create_thumbnail(image_data, size_tuple)
            thumbnails[size_name] = thumbnail_data
        
        return thumbnails
    
    def validate_image(self, image_data: bytes) -> Dict[str, Any]:
        """Validate image data and return metadata"""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                return {
                    "valid": True,
                    "format": img.format,
                    "mode": img.mode,
                    "size": img.size,
                    "width": img.width,
                    "height": img.height,
                    "file_size": len(image_data)
                }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
    
    def generate_filename(self, url: str, prefix: str = "img") -> str:
        """Generate unique filename from URL"""
        # Create hash of URL for uniqueness
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        return f"{prefix}_{url_hash}.jpg"
    
    async def process_image_from_url(self, url: str, create_thumbnails: bool = True) -> Dict[str, Any]:
        """Download image from URL and process it"""
        # Download image
        image_data = await self.download_image(url)
        if not image_data:
            return {"success": False, "error": "Failed to download image"}
        
        # Validate image
        validation = self.validate_image(image_data)
        if not validation["valid"]:
            return {"success": False, "error": f"Invalid image: {validation['error']}"}
        
        # Generate filename
        filename = self.generate_filename(url)
        
        result = {
            "success": True,
            "filename": filename,
            "metadata": validation,
            "original_url": url
        }
        
        # Create thumbnails if requested
        if create_thumbnails:
            thumbnails = self.create_multiple_thumbnails(image_data)
            result["thumbnails"] = {}
            
            for size_name, thumbnail_data in thumbnails.items():
                if thumbnail_data:
                    thumb_filename = self.generate_filename(url, f"thumb_{size_name}")
                    result["thumbnails"][size_name] = {
                        "filename": thumb_filename,
                        "data": thumbnail_data,
                        "size": self.THUMBNAIL_SIZES[size_name]
                    }
        
        return result
    
    def save_image_data(self, image_data: bytes, filename: str, subdir: str = "images") -> str:
        """Save image data to disk and return file path"""
        try:
            file_path = self.media_dir / subdir / filename
            
            with open(file_path, 'wb') as f:
                f.write(image_data)
            
            return str(file_path)
        except Exception as e:
            print(f"Failed to save image {filename}: {e}")
            return None
    
    def get_image_url(self, filename: str, subdir: str = "images", base_url: str = "/media") -> str:
        """Generate URL for accessing saved image"""
        return f"{base_url}/{subdir}/{filename}"
    
    def cleanup_old_files(self, days_old: int = 30) -> int:
        """Clean up old media files (returns number of files deleted)"""
        import time
        
        deleted_count = 0
        cutoff_time = time.time() - (days_old * 24 * 60 * 60)
        
        for root, dirs, files in os.walk(self.media_dir):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    if os.path.getmtime(file_path) < cutoff_time:
                        os.remove(file_path)
                        deleted_count += 1
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")
        
        return deleted_count
    
    def optimize_image(self, image_data: bytes, max_size: Tuple[int, int] = (1200, 1200), quality: int = 85) -> bytes:
        """Optimize image for web display"""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if img.width > max_size[0] or img.height > max_size[1]:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save optimized version
                output = io.BytesIO()
                img.save(output, format='JPEG', quality=quality, optimize=True)
                return output.getvalue()
                
        except Exception as e:
            print(f"Failed to optimize image: {e}")
            return image_data  # Return original if optimization fails


# Global instance
media_utils = MediaUtils()