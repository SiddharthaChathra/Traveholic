# Image Processing Service for Crowdsourced Photos
"""
Processes crowdsourced beach photos for shoreline extraction.
Uses EXIF data, GPS coordinates, and optional camera calibration.
"""

import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


async def process_crowdsource_image(
    image_path: str,
    latitude: float,
    longitude: float,
    heading: Optional[float] = None,
    pitch: Optional[float] = None,
    altitude: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Process a crowdsourced beach photo to extract shoreline information.
    
    Args:
        image_path: Path to the uploaded image
        latitude: GPS latitude
        longitude: GPS longitude
        heading: Camera heading in degrees (0-360)
        pitch: Camera pitch in degrees (-90 to 90)
        altitude: Camera altitude in meters
        
    Returns:
        Dictionary with extracted shoreline GeoJSON and metadata
    """
    try:
        # In production, this would:
        # 1. Extract EXIF data from image
        # 2. Apply camera calibration if available
        # 3. Run shoreline detection (CNN or edge detection)
        # 4. Geo-reference using GPS + heading/pitch
        # 5. Convert to GeoJSON
        
        # For now, return a mock shoreline
        logger.info(f"Processing image: {image_path}")
        
        # Simulate processing time
        import asyncio
        await asyncio.sleep(0.1)
        
        # Generate a simple shoreline line perpendicular to viewing direction
        # This is a placeholder - real implementation would use SfM or CNN
        if heading is not None:
            # Create line perpendicular to camera heading
            import math
            angle_rad = math.radians(heading + 90)  # Perpendicular
            length = 0.001  # ~100m at equator
            dx = length * math.cos(angle_rad)
            dy = length * math.sin(angle_rad)
            
            coordinates = [
                [longitude - dx, latitude - dy],
                [longitude + dx, latitude + dy],
            ]
        else:
            # Default horizontal line
            coordinates = [
                [longitude - 0.0005, latitude],
                [longitude + 0.0005, latitude],
            ]
        
        return {
            "shoreline_geojson": {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordinates,
                },
                "properties": {
                    "extraction_method": "crowdsource_placeholder",
                    "confidence": 0.5,
                    "image_path": image_path,
                    "gps": {"lat": latitude, "lon": longitude},
                    "heading": heading,
                    "pitch": pitch,
                    "altitude": altitude,
                }
            },
            "metadata": {
                "processing_time_ms": 100,
                "extraction_method": "placeholder",
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to process image {image_path}: {e}")
        return {"shoreline_geojson": None, "error": str(e)}


async def extract_shoreline_from_image(
    image_path: str,
    calibration: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """
    Extract shoreline from beach photo using computer vision.
    
    In production, this would use:
    - Pre-trained CNN (U-Net, DeepLab) for water/land segmentation
    - Edge detection + morphological operations
    - Camera calibration for geo-referencing
    - Structure-from-Motion for 3D reconstruction
    """
    # Placeholder for actual CV pipeline
    logger.info(f"Extracting shoreline from {image_path}")
    return None


async def create_thumbnail(
    image_path: str,
    output_path: str,
    max_size: Tuple[int, int] = (400, 400),
) -> bool:
    """Create thumbnail for crowdsourced photo."""
    try:
        from PIL import Image
        with Image.open(image_path) as img:
            img.thumbnail(max_size)
            img.save(output_path)
        return True
    except Exception as e:
        logger.error(f"Failed to create thumbnail: {e}")
        return False


def parse_exif_gps(image_path: str) -> Optional[Dict[str, float]]:
    """Extract GPS coordinates from image EXIF data."""
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS, GPSTAGS
        
        with Image.open(image_path) as img:
            exif = img._getexif()
            if not exif:
                return None
            
            gps_info = {}
            for tag_id, value in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == "GPSInfo":
                    for gps_tag_id, gps_value in value.items():
                        gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_info[gps_tag] = gps_value
            
            if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
                lat = _convert_to_degrees(gps_info["GPSLatitude"])
                if gps_info.get("GPSLatitudeRef") == "S":
                    lat = -lat
                
                lon = _convert_to_degrees(gps_info["GPSLongitude"])
                if gps_info.get("GPSLongitudeRef") == "W":
                    lon = -lon
                
                return {"latitude": lat, "longitude": lon}
    except Exception:
        pass
    return None


def _convert_to_degrees(value):
    """Convert GPS coordinates to degrees."""
    d, m, s = value
    return d + (m / 60.0) + (s / 3600.0)