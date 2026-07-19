# TLShoreNet - Transfer Learning Shoreline Segmentation
"""
Transfer learning based shoreline segmentation using U-Net with EfficientNet-B0 encoder.
Pre-trained on CoastTrain dataset, fine-tuned on Mangalore Sentinel-2 imagery.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import timm
import segmentation_models_pytorch as smp
from typing import Dict, List, Optional, Tuple
import numpy as np
from pathlib import Path
import albumentations as A
from albumentations.pytorch import ToTensorV2
import rasterio
from rasterio.windows import Window
import logging

logger = logging.getLogger(__name__)


class TLShoreNet(nn.Module):
    """
    U-Net with EfficientNet-B0 encoder for shoreline segmentation.
    """
    
    def __init__(
        self,
        encoder_name: str = "efficientnet-b0",
        encoder_weights: str = "imagenet",
        in_channels: int = 6,  # Sentinel-2: B2, B3, B4, B8, B11, B12
        classes: int = 2,  # water, land
        activation: Optional[str] = None,
    ):
        super().__init__()
        
        self.model = smp.Unet(
            encoder_name=encoder_name,
            encoder_weights=encoder_weights,
            in_channels=in_channels,
            classes=classes,
            activation=activation,
        )
        
        # CoastTrain pretrained weights path
        self.coasttrain_weights_path = None
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)
    
    def load_coasttrain_weights(self, weights_path: str):
        """Load CoastTrain pretrained weights."""
        state_dict = torch.load(weights_path, map_location="cpu")
        # Handle key mismatches
        model_state = self.state_dict()
        filtered_state = {k: v for k, v in state_dict.items() if k in model_state}
        model_state.update(filtered_state)
        self.load_state_dict(model_state)
        logger.info(f"Loaded CoastTrain weights from {weights_path}")
    
    def freeze_encoder(self):
        """Freeze encoder for transfer learning phase 1."""
        for param in self.model.encoder.parameters():
            param.requires_grad = False
    
    def unfreeze_encoder(self):
        """Unfreeze encoder for fine-tuning phase 2."""
        for param in self.model.encoder.parameters():
            param.requires_grad = True


class Sentinel2Processor:
    """Process Sentinel-2 imagery for TLShoreNet inference."""
    
    # Sentinel-2 band indices (0-based in stackstac)
    BANDS = ["B02", "B03", "B04", "B08", "B11", "B12"]  # Blue, Green, Red, NIR, SWIR1, SWIR2
    
    # Normalization stats (computed from Mangalore Sentinel-2 data)
    MEAN = [0.123, 0.145, 0.156, 0.234, 0.189, 0.112]
    STD = [0.067, 0.078, 0.089, 0.123, 0.098, 0.065]
    
    def __init__(self, tile_size: int = 512, overlap: int = 64):
        self.tile_size = tile_size
        self.overlap = overlap
        
        self.transform = A.Compose([
            A.Normalize(mean=self.MEAN, std=self.STD, max_pixel_value=1.0),
            ToTensorV2(),
        ])
    
    def preprocess(self, image: np.ndarray) -> torch.Tensor:
        """
        Preprocess Sentinel-2 image for inference.
        
        Args:
            image: (H, W, C) numpy array, values 0-1
            
        Returns:
            Tensor (C, H, W)
        """
        # Ensure 6 channels
        if image.shape[-1] != 6:
            raise ValueError(f"Expected 6 bands, got {image.shape[-1]}")
        
        # Apply normalization
        transformed = self.transform(image=image)
        return transformed["image"]
    
    def tile_image(self, image: np.ndarray) -> List[Tuple[np.ndarray, Tuple[int, int]]]:
        """
        Split large image into overlapping tiles.
        
        Returns:
            List of (tile, (y_offset, x_offset))
        """
        h, w = image.shape[:2]
        tiles = []
        
        stride = self.tile_size - self.overlap
        for y in range(0, h, stride):
            for x in range(0, w, stride):
                y_end = min(y + self.tile_size, h)
                x_end = min(x + self.tile_size, w)
                
                tile = image[y:y_end, x:x_end]
                
                # Pad if needed
                if tile.shape[0] != self.tile_size or tile.shape[1] != self.tile_size:
                    padded = np.zeros((self.tile_size, self.tile_size, 6), dtype=image.dtype)
                    padded[:tile.shape[0], :tile.shape[1]] = tile
                    tile = padded
                
                tiles.append((tile, (y, x)))
        
        return tiles
    
    def merge_tiles(
        self,
        predictions: List[np.ndarray],
        offsets: List[Tuple[int, int]],
        original_shape: Tuple[int, int],
    ) -> np.ndarray:
        """Merge overlapping tile predictions with weighted averaging."""
        h, w = original_shape
        merged = np.zeros((h, w), dtype=np.float32)
        weights = np.zeros((h, w), dtype=np.float32)
        
        # Gaussian weight for blending
        y_weight = self._gaussian_1d(self.tile_size)
        x_weight = self._gaussian_1d(self.tile_size)
        weight_map = np.outer(y_weight, x_weight)
        
        for pred, (y_off, x_off) in zip(predictions, offsets):
            y_end = min(y_off + self.tile_size, h)
            x_end = min(x_off + self.tile_size, w)
            
            tile_h = y_end - y_off
            tile_w = x_end - x_off
            
            w_map = weight_map[:tile_h, :tile_w]
            
            merged[y_off:y_end, x_off:x_end] += pred[:tile_h, :tile_w] * w_map
            weights[y_off:y_end, x_off:x_end] += w_map
        
        # Avoid division by zero
        weights[weights == 0] = 1
        return merged / weights
    
    def _gaussian_1d(self, size: int, sigma: float = None) -> np.ndarray:
        if sigma is None:
            sigma = size / 6
        x = np.arange(size) - size // 2
        return np.exp(-x**2 / (2 * sigma**2))


class TLShoreNetInference:
    """Inference pipeline for TLShoreNet."""
    
    def __init__(
        self,
        model_path: str,
        device: str = "cpu",
        tile_size: int = 512,
    ):
        self.device = torch.device(device)
        self.model = TLShoreNet().to(self.device)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        
        self.processor = Sentinel2Processor(tile_size=tile_size)
        
        logger.info(f"Loaded TLShoreNet from {model_path} on {device}")
    
    @torch.no_grad()
    def predict(self, image: np.ndarray) -> np.ndarray:
        """
        Run shoreline segmentation on Sentinel-2 image.
        
        Args:
            image: (H, W, 6) Sentinel-2 bands, values 0-1
            
        Returns:
            (H, W) probability map for water class
        """
        tiles = self.processor.tile_image(image)
        
        predictions = []
        offsets = []
        
        for tile, offset in tiles:
            # Preprocess
            tensor = self.processor.preprocess(tile).unsqueeze(0).to(self.device)
            
            # Inference
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)
            water_prob = probs[0, 0].cpu().numpy()  # Class 0 = water
            
            predictions.append(water_prob)
            offsets.append(offset)
        
        # Merge tiles
        merged = self.processor.merge_tiles(predictions, offsets, image.shape[:2])
        
        return merged
    
    @torch.no_grad()
    def predict_batch(self, images: List[np.ndarray]) -> List[np.ndarray]:
        """Batch prediction for multiple images."""
        return [self.predict(img) for img in images]


def extract_shoreline(
    water_prob: np.ndarray,
    threshold: float = 0.5,
    min_area: int = 100,
) -> np.ndarray:
    """
    Extract shoreline vector from water probability map.
    
    Args:
        water_prob: (H, W) water probability map
        threshold: Water/land threshold
        min_area: Minimum component area in pixels
        
    Returns:
        Binary shoreline mask
    """
    from skimage import morphology, measure
    
    # Threshold
    water_mask = water_prob > threshold
    
    # Remove small components
    water_mask = morphology.remove_small_objects(water_mask, min_size=min_area)
    land_mask = morphology.remove_small_objects(~water_mask, min_size=min_area)
    
    # Find boundary
    shoreline = morphology.binary_dilation(water_mask) & morphology.binary_dilation(land_mask)
    
    return shoreline.astype(np.uint8)


def shoreline_to_geojson(
    shoreline_mask: np.ndarray,
    transform: rasterio.Affine,
    crs: rasterio.crs.CRS,
) -> dict:
    """Convert shoreline mask to GeoJSON LineString."""
    from skimage import measure
    
    # Find contours
    contours = measure.find_contours(shoreline_mask, 0.5)
    
    if not contours:
        return {"type": "FeatureCollection", "features": []}
    
    # Take longest contour
    longest = max(contours, key=len)
    
    # Convert pixel coordinates to geographic
    coords = []
    for row, col in longest:
        x, y = transform * (col, row)
        coords.append([float(x), float(y)])
    
    # Close the loop
    if coords[0] != coords[-1]:
        coords.append(coords[0])
    
    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords,
            },
            "properties": {
                "length_px": len(longest),
                "extraction_method": "tl_shorenet",
            }
        }]
    }