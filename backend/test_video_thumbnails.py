#!/usr/bin/env python3
"""
Test script to demonstrate video thumbnail extraction from Instagram
"""

import asyncio
import json
from app.services.parsers.instagram_parser import InstagramParser
from app.utils.media_utils import media_utils
from app.utils.storage_utils import storage_utils

async def test_instagram_video_parsing():
    """Test Instagram video parsing with thumbnail extraction"""
    
    # Sample Instagram video URL (replace with actual video URL)
    instagram_url = "https://www.instagram.com/p/DJOkCqYOm6A/"
    
    print(f"Testing Instagram video parsing for: {instagram_url}")
    print("-" * 50)
    
    try:
        # Initialize parser
        parser = InstagramParser(db=None)
        
        # Parse the Instagram post
        print("Parsing Instagram post...")
        result = await parser.parse(instagram_url)
        
        print(f"✅ Successfully parsed Instagram post!")
        print(f"Title: {result.title}")
        print(f"Description: {result.description[:100]}...")
        print(f"Source Type: {result.source_type}")
        print(f"Confidence Score: {result.confidence_score}")
        
        # Check media data
        if result.media:
            print("\n📱 Media Information:")
            print(f"Is Video: {result.media.get('is_video', False)}")
            print(f"Post ID: {result.media.get('post_id')}")
            print(f"Username: {result.media.get('username')}")
            print(f"Likes: {result.media.get('likes')}")
            
            # Check for video URL
            if result.media.get('video_url'):
                print(f"Video URL: {result.media.get('video_url')}")
                if result.media.get('video_duration'):
                    print(f"Video Duration: {result.media.get('video_duration')} seconds")
            
            # Check images/thumbnails
            if result.media.get('images'):
                print(f"\n🖼️  Images/Thumbnails ({len(result.media['images'])} found):")
                for i, img in enumerate(result.media['images']):
                    print(f"  {i+1}. Type: {img.get('type', 'unknown')}")
                    print(f"     URL: {img.get('url', 'N/A')}")
                    print(f"     Size: {img.get('width', 'N/A')} x {img.get('height', 'N/A')}")
                    if img.get('video_url'):
                        print(f"     Video URL: {img.get('video_url')}")
            
            # Check stored media (thumbnails)
            if result.media.get('stored_media'):
                print(f"\n💾 Stored Media:")
                stored = result.media['stored_media']
                print(f"Media ID: {stored.get('media_id')}")
                print(f"Original: {stored.get('original')}")
                print(f"Thumbnails:")
                for size, url in stored.get('thumbnails', {}).items():
                    print(f"  {size}: {url}")
        
        # Display recipe content
        print(f"\n🍳 Recipe Content:")
        if result.ingredients:
            print(f"Ingredients: {result.ingredients[:200]}...")
        if result.instructions:
            print(f"Instructions: {result.instructions[:200]}...")
        
        return result
        
    except Exception as e:
        print(f"❌ Error parsing Instagram post: {e}")
        return None

async def test_media_utils():
    """Test media utilities directly"""
    
    print("\n" + "=" * 50)
    print("Testing Media Utilities")
    print("=" * 50)
    
    # Test with a sample image URL
    sample_url = "https://via.placeholder.com/600x400/FF5733/FFFFFF?text=Recipe+Image"
    
    print(f"Testing media processing for: {sample_url}")
    
    try:
        # Process image
        result = await media_utils.process_image_from_url(sample_url)
        
        if result["success"]:
            print("✅ Image processed successfully!")
            print(f"Filename: {result['filename']}")
            print(f"Format: {result['metadata']['format']}")
            print(f"Size: {result['metadata']['width']} x {result['metadata']['height']}")
            print(f"File Size: {result['metadata']['file_size']} bytes")
            
            if "thumbnails" in result:
                print(f"Thumbnails generated: {list(result['thumbnails'].keys())}")
                for size, info in result['thumbnails'].items():
                    print(f"  {size}: {info['size']}")
        else:
            print(f"❌ Failed to process image: {result['error']}")
            
    except Exception as e:
        print(f"❌ Error testing media utils: {e}")

async def test_storage_utils():
    """Test storage utilities"""
    
    print("\n" + "=" * 50)
    print("Testing Storage Utilities")
    print("=" * 50)
    
    # Test with a sample image URL
    sample_url = "https://via.placeholder.com/800x600/33FF57/FFFFFF?text=Storage+Test"
    
    print(f"Testing storage for: {sample_url}")
    
    try:
        # Store media
        result = await storage_utils.store_media_from_url(sample_url, recipe_id="test_recipe")
        
        if result["success"]:
            print("✅ Media stored successfully!")
            media_id = result["media_id"]
            print(f"Media ID: {media_id}")
            
            # Test retrieval
            print(f"Original URL: {storage_utils.get_original_url(media_id)}")
            print(f"Thumbnail URLs:")
            for size in ["small", "medium", "large"]:
                url = storage_utils.get_thumbnail_url(media_id, size)
                print(f"  {size}: {url}")
            
            # Get storage stats
            stats = storage_utils.get_storage_stats()
            print(f"\n📊 Storage Stats:")
            print(f"Total Media: {stats.get('total_media', 0)}")
            print(f"Total Size: {stats.get('total_size', 0)} bytes")
            
        else:
            print(f"❌ Failed to store media: {result['error']}")
            
    except Exception as e:
        print(f"❌ Error testing storage utils: {e}")

if __name__ == "__main__":
    print("🚀 Testing Instagram Video Thumbnail Extraction")
    print("=" * 60)
    
    async def run_tests():
        # Test Instagram parsing
        await test_instagram_video_parsing()
        
        # Test media utilities
        await test_media_utils()
        
        # Test storage utilities
        await test_storage_utils()
        
        print("\n" + "=" * 60)
        print("✅ All tests completed!")
    
    # Run the tests
    asyncio.run(run_tests())