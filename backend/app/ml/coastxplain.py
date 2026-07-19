# XAI Service - Explainable AI for Coastal Change
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


class ShorelineBehaviorClassifier:
    """
    Unsupervised classification of shoreline behavior patterns.
    
    Based on CoastXplain methodology: DTW k-means clustering of
    shoreline time series into interpretable behavior classes.
    """
    
    # Behavior class definitions
    CLASS_LABELS = {
        0: "Stable",
        1: "Seasonal", 
        2: "Erosive",
        3: "Accretive",
    }
    
    CLASS_DESCRIPTIONS = {
        0: "Minimal net shoreline change. Beach in dynamic equilibrium.",
        1: "Regular seasonal oscillation. Erosion in monsoon, recovery in dry season.",
        2: "Persistent net erosion. Shoreline retreating year-over-year.",
        3: "Persistent net accretion. Shoreline advancing seaward.",
    }
    
    def __init__(
        self,
        n_clusters: int = 4,
        metric: str = "dtw",
        random_state: int = 42,
    ):
        self.n_clusters = n_clusters
        self.metric = metric
        self.random_state = random_state
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.cluster_profiles = {}
    
    def _extract_features(self, series: np.ndarray) -> Dict[str, float]:
        """Extract interpretable features from shoreline time series."""
        if len(series) < 3:
            return {}
        
        # Basic statistics
        mean_pos = np.mean(series)
        std_pos = np.std(series)
        
        # Linear trend
        x = np.arange(len(series))
        coeffs = np.polyfit(x, series, 1)
        trend = coeffs[0]  # m per timestep
        trend_r2 = np.corrcoef(series, np.polyval(coeffs, x))[0, 1] ** 2
        
        # Seasonal decomposition (simple)
        # Assume monthly data, 12-month cycle
        if len(series) >= 24:
            # Average seasonal pattern
            seasonal = np.zeros(12)
            counts = np.zeros(12)
            for i, val in enumerate(series):
                seasonal[i % 12] += val
                counts[i % 12] += 1
            seasonal_avg = seasonal / np.maximum(counts, 1)
            seasonal_amplitude = np.max(seasonal_avg) - np.min(seasonal_avg)
            monsoon_erosion = seasonal_avg[5] - seasonal_avg[11]  # Jun - Dec
        else:
            seasonal_amplitude = 0
            monsoon_erosion = 0
        
        # Volatility (month-to-month changes)
        changes = np.diff(series)
        volatility = np.std(changes)
        
        # Extreme events
        extreme_loss = np.min(changes)  # Most negative change
        extreme_gain = np.max(changes)  # Most positive change
        
        return {
            "mean_position": float(mean_pos),
            "std_position": float(std_pos),
            "trend_per_month": float(trend),
            "trend_r2": float(trend_r2),
            "seasonal_amplitude": float(seasonal_amplitude),
            "monsoon_erosion": float(monsoon_erosion),
            "volatility": float(volatility),
            "extreme_loss": float(extreme_loss),
            "extreme_gain": float(extreme_gain),
        }
    
    def train(self, series_list: List[np.ndarray]):
        """Train the classifier on multiple shoreline time series."""
        from tslearn.clustering import TimeSeriesKMeans
        from tslearn.preprocessing import TimeSeriesScalerMeanVariance
        
        # Normalize series
        self.scaler = TimeSeriesScalerMeanVariance(mu=0., std=1.)
        series_scaled = self.scaler.fit_transform(
            [s.reshape(-1, 1) for s in series_list]
        )
        
        # DTW k-means
        self.model = TimeSeriesKMeans(
            n_clusters=self.n_clusters,
            metric=self.metric,
            random_state=self.random_state,
            max_iter=50,
        )
        
        self.model.fit(series_scaled)
        self.is_trained = True
        
        # Compute cluster profiles
        labels = self.model.labels_
        for cluster_id in range(self.n_clusters):
            cluster_series = [series_list[i] for i, l in enumerate(labels) if l == cluster_id]
            if cluster_series:
                features = [self._extract_features(s) for s in cluster_series]
                # Average features
                avg_features = {}
                for key in features[0].keys():
                    avg_features[key] = float(np.mean([f[key] for f in features]))
                self.cluster_profiles[cluster_id] = avg_features
        
        logger.info(f"Trained classifier on {len(series_list)} series")
    
    def predict(self, series: np.ndarray) -> Tuple[int, float]:
        """Predict behavior class for a new series."""
        if not self.is_trained:
            raise RuntimeError("Classifier not trained")
        
        series_scaled = self.scaler.transform(series.reshape(1, -1, 1))
        label = self.model.predict(series_scaled)[0]
        
        # Distance to centroid as confidence
        distances = self.model.transform(series_scaled)[0]
        confidence = 1.0 - distances[label] / (np.max(distances) + 1e-6)
        
        return int(label), float(confidence)
    
    def get_class_info(self, class_id: int) -> Dict:
        """Get human-readable info for a class."""
        return {
            "class_id": class_id,
            "class_name": self.CLASS_LABELS.get(class_id, f"Class_{class_id}"),
            "description": self.CLASS_DESCRIPTIONS.get(class_id, ""),
            "profile": self.cluster_profiles.get(class_id, {}),
        }


class FeatureImportanceExplainer:
    """SHAP-based feature importance for risk models."""
    
    def __init__(self, model, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self._init_explainer()
    
    def _init_explainer(self):
        """Initialize SHAP explainer based on model type."""
        import shap
        
        # Try tree explainer first (for XGBoost, RF, etc.)
        try:
            self.explainer = shap.TreeExplainer(self.model)
        except:
            # Fallback to permutation explainer
            self.explainer = shap.PermutationExplainer(
                self.model.predict, 
                feature_names=self.feature_names
            )
    
    def explain(self, X: np.ndarray, max_display: int = 10) -> Dict:
        """Get SHAP values and natural language explanation."""
        shap_values = self.explainer.shap_values(X)
        
        if isinstance(shap_values, list):
            # Multi-class: use mean absolute
            shap_values = np.mean([np.abs(sv) for sv in shap_values], axis=0)
        elif len(shap_values.shape) == 3:
            shap_values = np.mean(np.abs(shap_values), axis=2)
        
        # Mean absolute SHAP per feature
        mean_shap = np.mean(np.abs(shap_values), axis=0)
        
        # Top features
        top_indices = np.argsort(mean_shap)[::-1][:max_display]
        
        explanations = []
        for idx in top_indices:
            feature = self.feature_names[idx]
            importance = mean_shap[idx]
            direction = "increases" if np.mean(shap_values[:, idx]) > 0 else "decreases"
            
            explanations.append({
                "feature": feature,
                "importance": float(importance),
                "direction": direction,
                "description": self._feature_description(feature),
            })
        
        return {
            "shap_values": shap_values.tolist(),
            "feature_importance": mean_shap.tolist(),
            "top_features": explanations,
            "base_value": float(self.explainer.expected_value),
        }
    
    def _feature_description(self, feature: str) -> str:
        """Human-readable feature descriptions."""
        descriptions = {
            "erosion_rate": "Long-term shoreline retreat rate",
            "population_density": "Coastal population density",
            "infrastructure_value": "Value of buildings and assets at risk",
            "social_vulnerability": "Community vulnerability index",
            "wave_energy": "Mean wave energy flux",
            "storm_surge": "Maximum storm surge exposure",
            "economic_activity": "Tourism and fisheries revenue",
        }
        return descriptions.get(feature, feature)


class NaturalLanguageGenerator:
    """Generate natural language explanations from model outputs."""
    
    # Templates for different explanation types
    TEMPLATES = {
        "behavior_class": {
            0: "{transect} has a stable shoreline with minimal change over the observation period.",
            1: "{transect} shows regular seasonal patterns - erosion during monsoon (June-September) and recovery in dry season. This is a healthy natural cycle.",
            2: "{transect} is experiencing persistent erosion. The shoreline is retreating at {rate:.2f} m/year, which exceeds natural recovery. This area may need intervention.",
            3: "{transect} is accreting (growing seaward) at {rate:.2f} m/year. This could be due to sediment supply or coastal structures.",
        },
        "risk_factors": {
            "high_erosion": "High erosion rate ({rate:.1f} m/yr) is the primary driver of risk.",
            "high_population": "Dense population ({pop:.0f}/km²) increases exposure.",
            "high_infrastructure": "Significant infrastructure value (${val:,.0f}) at risk.",
            "high_vulnerability": "Socially vulnerable community (index {idx:.2f}) increases impact severity.",
        },
        "forecast": {
            "stable": "Shoreline position expected to remain relatively stable over the next {horizon} days.",
            "eroding": "Continued erosion expected. Shoreline may retreat {dist:.1f}m over {horizon} days.",
            "monsoon_alert": "Monsoon season approaching - expect accelerated erosion June-September.",
        },
    }
    
    @classmethod
    def generate_behavior_explanation(
        cls,
        transect_name: str,
        class_id: int,
        features: Dict[str, float],
    ) -> str:
        """Generate natural language explanation for behavior class."""
        template = cls.TEMPLATES["behavior_class"].get(class_id, 
            "{transect} has unclassified shoreline behavior.")
        
        rate = features.get("trend_per_month", 0) * 12  # Convert to yearly
        
        return template.format(
            transect=transect_name,
            rate=abs(rate),
        )
    
    @classmethod
    def generate_risk_explanation(
        cls,
        transect_name: str,
        top_factors: List[Dict],
        composite_score: float,
    ) -> str:
        """Generate natural language risk explanation."""
        risk_level = (
            "critical" if composite_score > 0.8 else
            "very high" if composite_score > 0.7 else
            "high" if composite_score > 0.55 else
            "moderate" if composite_score > 0.4 else
            "low"
        )
        
        explanation = f"{transect_name} has {risk_level} coastal erosion risk (score: {composite_score:.2f}). "
        
        if top_factors:
            primary = top_factors[0]
            factor_templates = cls.TEMPLATES["risk_factors"]
            
            if primary["feature"] == "erosion_rate":
                explanation += _templates["high_erosion"].format(rate=primary.get("value", 0))
            elif primary["feature"] == "population_density":
                explanation += _templates["high_population"].format(pop=primary.get("value", 0))
            elif primary["feature"] == "infrastructure_value":
                explanation += _templates["high_infrastructure"].format(val=primary.get("value", 0))
            elif primary["feature"] == "social_vulnerability":
                explanation += _templates["high_vulnerability"].format(idx=primary.get("value", 0))
            else:
                explanation += f"Primary factor: {primary['feature']}."
            
            if len(top_factors) > 1:
                secondary = top_factors[1]["feature"]
                explanation += f" Secondary factor: {secondary}."
        
        return explanation
    
    @classmethod
    def generate_forecast_explanation(
        cls,
        transect_name: str,
        forecast: Dict[int, Dict],
        current_month: int,
    ) -> str:
        """Generate natural language forecast explanation."""
        is_monsoon = current_month in [6, 7, 8, 9]
        
        # Get 30-day forecast
        h30 = forecast.get(30, {})
        position_change = h30.get("position", 0) - h30.get("current", 0)
        
        if is_monsoon:
            template = cls.TEMPLATES["forecast"]["monsoon_alert"]
            explanation = template.format(transect=transect_name)
        elif position_change < -1:
            template = cls.TEMPLATES["forecast"]["eroding"]
            explanation = template.format(
                transect=transect_name,
                dist=abs(position_change),
                horizon=30,
            )
        else:
            template = cls.TEMPLATES["forecast"]["stable"]
            explanation = template.format(
                transect=transect_name,
                horizon=30,
            )
        
        # Add uncertainty
        lower = h30.get("lower", 0)
        upper = h30.get("upper", 0)
        uncertainty = upper - lower
        if uncertainty > 2:
            explanation += f" Prediction uncertainty is high (±{uncertainty/2:.1f}m)."
        
        return explanation


class XAIService:
    """High-level XAI service combining all explainability components."""
    
    def __init__(self):
        self.behavior_classifier = ShorelineBehaviorClassifier()
        self.nl_generator = NaturalLanguageGenerator()
        self._initialized = False
    
    def initialize(self, training_series: Optional[List[np.ndarray]] = None):
        """Initialize with optional training data."""
        if training_series and len(training_series) >= 4:
            self.behavior_classifier.train(training_series)
        self._initialized = True
        logger.info("XAI Service initialized")
    
    def explain_transect(
        self,
        transect_id: str,
        shoreline_series: np.ndarray,
        risk_features: Optional[Dict] = None,
    ) -> Dict:
        """Comprehensive XAI explanation for a transect."""
        
        # Behavior classification
        class_id, confidence = self.behavior_classifier.predict(shoreline_series)
        class_info = self.behavior_classifier.get_class_info(class_id)
        features = self.behavior_classifier._extract_features(shoreline_series)
        
        behavior_explanation = self.nl_generator.generate_behavior_explanation(
            transect_id, class_id, features
        )
        
        result = {
            "transect_id": transect_id,
            "timestamp": datetime.utcnow().isoformat(),
            "behavior_class": {
                "class_id": class_id,
                "class_name": class_info["class_name"],
                "confidence": confidence,
                "description": class_info["description"],
                "features": features,
            },
            "behavior_explanation": behavior_explanation,
        }
        
        # Risk explanation if features provided
        if risk_features:
            risk_explanation = self.explain_risk(transect_id, risk_features)
            result["risk_explanation"] = risk_explanation
        
        return result
    
    def explain_risk(
        self,
        transect_id: str,
        risk_features: Dict[str, float],
        composite_score: float = None,
    ) -> Dict:
        """Explain risk factors."""
        # Sort by contribution
        sorted_factors = sorted(
            [{"feature": k, "value": v} for k, v in risk_features.items()],
            key=lambda x: x["value"],
            reverse=True
        )
        
        explanation = self.nl_generator.generate_risk_explanation(
            transect_id, sorted_factors[:5], composite_score or 0
        )
        
        return {
            "transect_id": transect_id,
            "composite_score": composite_score,
            "top_factors": sorted_factors[:5],
            "natural_language": explanation,
        }
    
    def explain_forecast(
        self,
        transect_id: str,
        forecast: Dict[int, Dict],
        current_month: int,
    ) -> Dict:
        """Explain erosion forecast."""
        explanation = self.nl_generator.generate_forecast_explanation(
            transect_id, forecast, current_month
        )
        
        return {
            "transect_id": transect_id,
            "forecast": forecast,
            "explanation": explanation,
            "monsoon_context": "Monsoon season active" if current_month in [6,7,8,9] else "Dry season",
        }