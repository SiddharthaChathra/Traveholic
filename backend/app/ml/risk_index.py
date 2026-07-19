# Risk Index Model - Socio-Economic Risk Integration with MCDA
"""
Multi-Criteria Decision Analysis (MCDA) based coastal risk index.
Combines physical erosion susceptibility with socio-economic exposure.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RiskCategory(Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


@dataclass
class RiskFactor:
    """Individual risk factor with weight and normalization."""
    name: str
    weight: float
    value: float
    normalized: float
    threshold_low: float
    threshold_high: float
    description: str


class MCDARiskIndex:
    """
    Multi-Criteria Decision Analysis for coastal risk assessment.
    
    Composite Risk = Σ(w_i * x_i_normalized)
    
    Where:
    - w_i = weight for criterion i (sum = 1.0)
    - x_i_normalized = normalized value [0, 1] for criterion i
    """
    
    # Default weights (AHP-derived or expert elicitation)
    DEFAULT_WEIGHTS = {
        # Physical factors
        "erosion_rate": 0.25,
        "shoreline_change_trend": 0.15,
        "storm_surge_exposure": 0.10,
        "wave_energy": 0.10,
        
        # Socio-economic factors
        "population_density": 0.12,
        "infrastructure_value": 0.10,
        "economic_activity": 0.08,
        "social_vulnerability": 0.10,
    }
    
    # Normalization thresholds (value -> [0,1] mapping)
    NORMALIZATION_CONFIG = {
        "erosion_rate": {
            "method": "linear",
            "min_val": 0.0,      # m/yr
            "max_val": 5.0,      # m/yr (critical)
            "higher_is_worse": True,
        },
        "shoreline_change_trend": {
            "method": "linear",
            "min_val": -1.0,     # accretion m/yr
            "max_val": 2.0,      # erosion m/yr
            "higher_is_worse": True,
        },
        "storm_surge_exposure": {
            "method": "linear",
            "min_val": 0.0,      # m above MSL
            "max_val": 3.0,      # m
            "higher_is_worse": True,
        },
        "wave_energy": {
            "method": "linear",
            "min_val": 0.0,      # kW/m
            "max_val": 50.0,     # kW/m
            "higher_is_worse": True,
        },
        "population_density": {
            "method": "log",
            "min_val": 1.0,      # people/km2
            "max_val": 10000.0,  # people/km2
            "higher_is_worse": True,
        },
        "infrastructure_value": {
            "method": "log",
            "min_val": 1e3,      # USD
            "max_val": 1e9,      # USD
            "higher_is_worse": True,
        },
        "economic_activity": {
            "method": "linear",
            "min_val": 0.0,      # index 0-1
            "max_val": 1.0,
            "higher_is_worse": True,
        },
        "social_vulnerability": {
            "method": "linear",
            "min_val": 0.0,      # index 0-1
            "max_val": 1.0,
            "higher_is_worse": True,
        },
    }
    
    def __init__(
        self,
        weights: Optional[Dict[str, float]] = None,
        config: Optional[Dict] = None,
    ):
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        self.config = config or self.NORMALIZATION_CONFIG.copy()
        self._validate_weights()
    
    def _validate_weights(self):
        """Ensure weights sum to 1.0."""
        total = sum(self.weights.values())
        if abs(total - 1.0) > 1e-6:
            logger.warning(f"Weights sum to {total:.4f}, normalizing to 1.0")
            self.weights = {k: v/total for k, v in self.weights.items()}
    
    def normalize(self, name: str, value: float) -> float:
        """Normalize a single value to [0, 1] based on configuration."""
        cfg = self.config.get(name, {})
        method = cfg.get("method", "linear")
        min_val = cfg.get("min_val", 0.0)
        max_val = cfg.get("max_val", 1.0)
        higher_is_worse = cfg.get("higher_is_worse", True)
        
        if method == "linear":
            normalized = (value - min_val) / (max_val - min_val)
        elif method == "log":
            if value <= 0:
                normalized = 0.0
            else:
                log_min = np.log(min_val)
                log_max = np.log(max_val)
                normalized = (np.log(value) - log_min) / (log_max - log_min)
        elif method == "sigmoid":
            # Sigmoid centered at midpoint
            midpoint = (min_val + max_val) / 2
            k = 4.0 / (max_val - min_val)  # steepness
            normalized = 1 / (1 + np.exp(-k * (value - midpoint)))
        else:
            normalized = 0.0
        
        # Clip
        normalized = np.clip(normalized, 0.0, 1.0)
        
        # Invert if lower is worse
        if not higher_is_worse:
            normalized = 1.0 - normalized
        
        return float(normalized)
    
    def compute_factor(self, name: str, value: float) -> RiskFactor:
        """Compute a single risk factor with normalization."""
        normalized = self.normalize(name, value)
        cfg = self.config.get(name, {})
        
        return RiskFactor(
            name=name,
            weight=self.weights.get(name, 0.0),
            value=value,
            normalized=normalized,
            threshold_low=cfg.get("min_val", 0.0),
            threshold_high=cfg.get("max_val", 1.0),
            description=self._get_description(name),
        )
    
    def _get_description(self, name: str) -> str:
        descriptions = {
            "erosion_rate": "Long-term shoreline retreat rate (m/year)",
            "shoreline_change_trend": "Recent trend in shoreline position",
            "storm_surge_exposure": "Maximum storm surge level exposure",
            "wave_energy": "Mean annual wave energy flux",
            "population_density": "Population per km² in coastal zone",
            "infrastructure_value": "Total value of built infrastructure at risk",
            "economic_activity": "Economic activity index (tourism, fisheries, ports)",
            "social_vulnerability": "Composite social vulnerability index (0-1)",
        }
        return descriptions.get(name, name)
    
    def compute_risk_index(
        self,
        factors: Dict[str, float],
        return_factors: bool = True,
    ) -> Dict:
        """
        Compute composite risk index.
        
        Args:
            factors: Dictionary of raw factor values
            return_factors: Whether to include individual factor details
            
        Returns:
            Dictionary with composite score, category, and factor breakdown
        """
        factor_objects = {}
        weighted_sum = 0.0
        
        for name, value in factors.items():
            if name not in self.weights:
                logger.warning(f"Unknown factor: {name}, skipping")
                continue
            
            factor = self.compute_factor(name, value)
            factor_objects[name] = factor
            weighted_sum += factor.weight * factor.normalized
        
        # Classify risk
        category = self._classify_risk(weighted_sum)
        
        # Compute rank (1 = highest risk)
        # In practice, rank against all transects
        rank = 0  # placeholder
        
        result = {
            "composite_score": float(weighted_sum),
            "risk_category": category.value,
            "rank": rank,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if return_factors:
            result["factors"] = {
                name: {
                    "value": f.value,
                    "normalized": f.normalized,
                    "weight": f.weight,
                    "contribution": f.weight * f.normalized,
                    "description": f.description,
                }
                for name, f in factor_objects.items()
            }
        
        return result
    
    def _classify_risk(self, score: float) -> RiskCategory:
        """Classify composite score into risk category."""
        if score >= 0.85:
            return RiskCategory.CRITICAL
        elif score >= 0.70:
            return RiskCategory.VERY_HIGH
        elif score >= 0.55:
            return RiskCategory.HIGH
        elif score >= 0.40:
            return RiskCategory.MODERATE
        elif score >= 0.25:
            return RiskCategory.LOW
        elif score >= 0.10:
            return RiskCategory.VERY_LOW
        else:
            return RiskCategory.VERY_LOW
    
    def sensitivity_analysis(
        self,
        base_factors: Dict[str, float],
        perturbation: float = 0.1,
    ) -> Dict[str, float]:
        """Analyze sensitivity of composite score to each factor."""
        base_score = self.compute_risk_index(base_factors, return_factors=False)["composite_score"]
        
        sensitivities = {}
        for name in self.weights:
            if name not in base_factors:
                continue
            
            # Perturb up
            factors_up = base_factors.copy()
            factors_up[name] *= (1 + perturbation)
            score_up = self.compute_risk_index(factors_up, return_factors=False)["composite_score"]
            
            # Perturb down
            factors_down = base_factors.copy()
            factors_down[name] *= (1 - perturbation)
            score_down = self.compute_risk_index(factors_down, return_factors=False)["composite_score"]
            
            # Sensitivity = average absolute change
            sensitivity = (abs(score_up - base_score) + abs(score_down - base_score)) / 2
            sensitivities[name] = sensitivity
        
        # Normalize to percentages
        total = sum(sensitivities.values())
        if total > 0:
            sensitivities = {k: v/total * 100 for k, v in sensitivities.items()}
        
        return sensitivities


class RiskIndexModel:
    """
    High-level risk index model integrating physical and socio-economic data.
    
    Data sources:
    - Physical: Satellite-derived erosion rates, wave models, tide gauges
    - Socio-economic: Census, OSM, land use, property values
    """
    
    def __init__(self, mcd_model: Optional[MCDARiskIndex] = None):
        self.mcd_model = mcd_model or MCDARiskIndex()
        self.transect_data: Dict[str, Dict] = {}
    
    def prepare_factors(
        self,
        transect_id: str,
        physical_data: Dict,
        socio_economic_data: Dict,
    ) -> Dict[str, float]:
        """Prepare all risk factors for a transect."""
        
        factors = {}
        
        # Physical factors
        factors["erosion_rate"] = physical_data.get("erosion_rate_m_yr", 0.0)
        factors["shoreline_change_trend"] = physical_data.get("trend_m_yr", 0.0)
        factors["storm_surge_exposure"] = physical_data.get("max_surge_m", 0.0)
        factors["wave_energy"] = physical_data.get("mean_wave_energy_kw_m", 0.0)
        
        # Socio-economic factors
        factors["population_density"] = socio_economic_data.get("pop_density_km2", 1.0)
        factors["infrastructure_value"] = socio_economic_data.get("infra_value_usd", 1e3)
        factors["economic_activity"] = socio_economic_data.get("economic_index", 0.0)
        factors["social_vulnerability"] = socio_economic_data.get("vulnerability_index", 0.5)
        
        return factors
    
    def compute_transect_risk(
        self,
        transect_id: str,
        physical_data: Dict,
        socio_economic_data: Dict,
    ) -> Dict:
        """Compute risk index for a single transect."""
        factors = self.prepare_factors(transect_id, physical_data, socio_economic_data)
        result = self.mcd_model.compute_risk_index(factors)
        result["transect_id"] = transect_id
        return result
    
    def compute_all_transects(
        self,
        physical_data_dict: Dict[str, Dict],
        socio_economic_dict: Dict[str, Dict],
    ) -> List[Dict]:
        """Compute risk for all transects and rank them."""
        results = []
        
        for transect_id in physical_data_dict:
            phys = physical_data_dict.get(transect_id, {})
            socio = socio_economic_dict.get(transect_id, {})
            
            risk = self.compute_transect_risk(transect_id, phys, socio)
            results.append(risk)
        
        # Sort by composite score (descending)
        results.sort(key=lambda x: x["composite_score"], reverse=True)
        
        # Assign ranks
        for i, r in enumerate(results):
            r["rank"] = i + 1
        
        return results
    
    def get_priority_hotspots(
        self,
        results: List[Dict],
        top_n: int = 10,
    ) -> List[Dict]:
        """Get top N priority hotspots for intervention."""
        return results[:top_n]


def create_risk_index_from_data(
    erosion_rates: Dict[str, float],
    population: Dict[str, float],
    infrastructure: Dict[str, float],
    vulnerability: Dict[str, float],
    wave_energy: Dict[str, float] = None,
    weights: Dict[str, float] = None,
) -> List[Dict]:
    """
    Convenience function to create risk index from basic data dictionaries.
    
    Args:
        erosion_rates: {transect_id: m/yr}
        population: {transect_id: people/km2}
        infrastructure: {transect_id: USD value}
        vulnerability: {transect_id: 0-1 index}
        wave_energy: {transect_id: kW/m} optional
        weights: Custom weights optional
        
    Returns:
        Ranked risk index list
    """
    model = MCDARiskIndex(weights=weights)
    
    physical = {}
    socio = {}
    
    all_transects = set(erosion_rates.keys()) | set(population.keys())
    
    for t_id in all_transects:
        physical[t_id] = {
            "erosion_rate_m_yr": erosion_rates.get(t_id, 0.0),
            "trend_m_yr": erosion_rates.get(t_id, 0.0) * 0.5,  # approximate
            "max_surge_m": 1.5,  # default
            "mean_wave_energy_kw_m": wave_energy.get(t_id, 10.0) if wave_energy else 10.0,
        }
        socio[t_id] = {
            "pop_density_km2": population.get(t_id, 100.0),
            "infra_value_usd": infrastructure.get(t_id, 1e6),
            "economic_index": 0.5,  # default
            "vulnerability_index": vulnerability.get(t_id, 0.5),
        }
    
    risk_model = RiskIndexModel(model)
    return risk_model.compute_all_transects(physical, socio)