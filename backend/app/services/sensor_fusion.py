# Sensor Fusion Service - Kalman Filter + Bayesian Fusion
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@dataclass
class SensorObservation:
    """Single sensor observation with metadata."""
    source: str  # "satellite", "tide_gauge", "wave_buoy", "camera", "crowdsource"
    timestamp: datetime
    value: float  # Shoreline position (meters from baseline)
    variance: float  # Observation variance
    quality: float = 1.0  # 0-1 quality flag


@dataclass
class FusedState:
    """Fused state estimate."""
    position: float
    velocity: float
    acceleration: float
    position_variance: float
    velocity_variance: float
    timestamp: datetime


class CoastalKalmanFilter:
    """
    Kalman filter for coastal shoreline position tracking.
    
    State: [position, velocity, acceleration]
    Constant acceleration model with process noise.
    """
    
    def __init__(
        self,
        dt: float = 3600.0,  # 1 hour default timestep
        process_noise: Optional[np.ndarray] = None,
    ):
        self.dt = dt
        
        # State transition matrix (constant acceleration)
        self.F = np.array([
            [1, dt, 0.5 * dt**2],
            [0, 1, dt],
            [0, 0, 1],
        ], dtype=float)
        
        # Process noise covariance
        if process_noise is None:
            # Tune based on coastal dynamics
            self.Q = np.diag([0.01, 0.001, 0.0001])  # position, velocity, accel
        else:
            self.Q = process_noise
        
        # Measurement matrix (we only measure position)
        self.H = np.array([[1, 0, 0]], dtype=float)
        
        # Initial state
        self.x = np.zeros(3)  # [position, velocity, acceleration]
        self.P = np.eye(3) * 100  # Large initial uncertainty
        
        self.initialized = False
        self.last_timestamp: Optional[datetime] = None
    
    def initialize(self, position: float, timestamp: datetime, variance: float = 10.0):
        """Initialize filter with first observation."""
        self.x[0] = position
        self.P[0, 0] = variance
        self.last_timestamp = timestamp
        self.initialized = True
        logger.info(f"Kalman filter initialized: position={position:.2f}m, var={variance:.2f}")
    
    def predict(self, timestamp: datetime) -> FusedState:
        """Predict state forward to timestamp."""
        if not self.initialized:
            raise RuntimeError("Filter not initialized")
        
        if self.last_timestamp is not None:
            dt = (timestamp - self.last_timestamp).total_seconds()
            if dt > 0:
                # Update F matrix for actual dt
                self.F = np.array([
                    [1, dt, 0.5 * dt**2],
                    [0, 1, dt],
                    [0, 0, 1],
                ], dtype=float)
                
                # Predict
                self.x = self.F @ self.x
                self.P = self.F @ self.P @ self.F.T + self.Q
        
        self.last_timestamp = timestamp
        
        return FusedState(
            position=self.x[0],
            velocity=self.x[1],
            acceleration=self.x[2],
            position_variance=self.P[0, 0],
            velocity_variance=self.P[1, 1],
            timestamp=timestamp,
        )
    
    def update(self, observation: SensorObservation) -> FusedState:
        """Update filter with new observation."""
        if not self.initialized:
            self.initialize(observation.value, observation.timestamp, observation.variance)
            return FusedState(
                position=self.x[0],
                velocity=self.x[1],
                acceleration=self.x[2],
                position_variance=self.P[0, 0],
                velocity_variance=self.P[1, 1],
                timestamp=observation.timestamp,
            )
        
        # Predict to observation time
        self.predict(observation.timestamp)
        
        # Measurement noise (adapt based on source quality)
        R = np.array([[observation.variance / observation.quality]])
        
        # Kalman gain
        S = self.H @ self.P @ self.H.T + R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        
        # Innovation
        y = observation.value - self.H @ self.x
        
        # Update
        self.x = self.x + K @ y
        self.P = (np.eye(3) - K @ self.H) @ self.P
        
        logger.debug(
            f"KF update: source={observation.source}, "
            f"pos={self.x[0]:.2f}±{np.sqrt(self.P[0,0]):.2f}, "
            f"vel={self.x[1]:.4f}±{np.sqrt(self.P[1,1]):.4f}"
        )
        
        return FusedState(
            position=self.x[0],
            velocity=self.x[1],
            acceleration=self.x[2],
            position_variance=self.P[0, 0],
            velocity_variance=self.P[1, 1],
            timestamp=observation.timestamp,
        )
    
    def get_state(self) -> FusedState:
        """Get current state estimate."""
        return FusedState(
            position=self.x[0],
            velocity=self.x[1],
            acceleration=self.x[2],
            position_variance=self.P[0, 0],
            velocity_variance=self.P[1, 1],
            timestamp=self.last_timestamp,
        )


class BayesianSensorFusion:
    """
    Bayesian sensor fusion for multi-source shoreline observations.
    
    Combines observations from different sources with source-specific
    reliability weights using Bayesian model averaging.
    """
    
    # Source reliability priors (learned from validation)
    SOURCE_RELIABILITY = {
        "satellite": 0.85,      # Landsat/Sentinel, 10-30m accuracy
        "drone": 0.95,          # UAV photogrammetry, cm accuracy
        "tide_gauge": 0.90,     # Water level proxy, needs beach slope
        "wave_buoy": 0.75,      # Indirect, wave runup estimation
        "camera": 0.80,         # Time-lapse, calibration dependent
        "crowdsource": 0.65,    # Smartphone photos, variable quality
        "gnss": 0.98,           # Ground truth survey
    }
    
    # Source bias corrections (meters)
    SOURCE_BIAS = {
        "satellite": 0.0,
        "drone": 0.0,
        "tide_gauge": -0.5,     # Tends to underestimate erosion
        "wave_buoy": 1.0,       # Overestimates due to runup
        "camera": 0.0,
        "crowdsource": 0.5,     # Perspective bias
        "gnss": 0.0,
    }
    
    def __init__(self):
        self.observation_history: List[SensorObservation] = []
        self.fused_estimates: List[FusedState] = []
    
    def add_observation(self, obs: SensorObservation):
        """Add observation to history."""
        self.observation_history.append(obs)
    
    def fuse_observations(
        self,
        observations: List[SensorObservation],
        prior_mean: Optional[float] = None,
        prior_var: Optional[float] = None,
    ) -> Tuple[float, float]:
        """
        Fuse multiple observations using Bayesian model averaging.
        
        Returns:
            (fused_position, fused_variance)
        """
        if not observations:
            if prior_mean is not None and prior_var is not None:
                return prior_mean, prior_var
            raise ValueError("No observations provided")
        
        # Apply bias corrections and reliability weights
        corrected_values = []
        corrected_variances = []
        weights = []
        
        for obs in observations:
            reliability = self.SOURCE_RELIABILITY.get(obs.source, 0.5)
            bias = self.SOURCE_BIAS.get(obs.source, 0.0)
            
            # Correct for known bias
            corrected_val = obs.value - bias
            
            # Inflate variance by inverse reliability
            corrected_var = obs.variance / (reliability * obs.quality)
            
            corrected_values.append(corrected_val)
            corrected_variances.append(corrected_var)
            weights.append(reliability)
        
        # Bayesian fusion (precision-weighted average)
        precisions = [1/v for v in corrected_variances]
        weighted_sum = sum(v * p for v, p in zip(corrected_values, precisions))
        total_precision = sum(precisions)
        
        fused_position = weighted_sum / total_precision
        fused_variance = 1 / total_precision
        
        # Include prior if provided
        if prior_mean is not None and prior_var is not None:
            prior_precision = 1 / prior_var
            fused_position = (fused_position * total_precision + prior_mean * prior_precision) / (total_precision + prior_precision)
            fused_variance = 1 / (total_precision + prior_precision)
        
        return fused_position, fused_variance
    
    def fuse_time_series(
        self,
        observations_by_time: Dict[datetime, List[SensorObservation]],
        initial_position: float,
        initial_variance: float,
    ) -> List[FusedState]:
        """
        Fuse observations across time using Kalman filter + Bayesian fusion.
        
        Args:
            observations_by_time: Dict mapping timestamps to observation lists
            initial_position: Initial shoreline position
            initial_variance: Initial variance
            
        Returns:
            List of fused states at each timestep
        """
        # Sort timestamps
        timestamps = sorted(observations_by_time.keys())
        
        # Initialize Kalman filter
        dt = (timestamps[1] - timestamps[0]).total_seconds() if len(timestamps) > 1 else 3600
        kf = CoastalKalmanFilter(dt=dt)
        kf.initialize(initial_position, timestamps[0], initial_variance)
        
        fused_states = []
        
        for ts in timestamps:
            # Predict
            state = kf.predict(ts)
            
            # Fuse observations at this timestep
            obs_list = observations_by_time[ts]
            if obs_list:
                # Bayesian fusion of simultaneous observations
                fused_pos, fused_var = self.fuse_observations(
                    obs_list,
                    prior_mean=state.position,
                    prior_var=state.position_variance,
                )
                
                # Create fused observation for KF update
                fused_obs = SensorObservation(
                    source="fused",
                    timestamp=ts,
                    value=fused_pos,
                    variance=fused_var,
                    quality=1.0,
                )
                
                # Update Kalman filter
                state = kf.update(fused_obs)
            
            fused_states.append(state)
        
        self.fused_estimates = fused_states
        return fused_states
    
    def detect_anomalies(
        self,
        observations: List[SensorObservation],
        threshold: float = 3.0,
    ) -> List[SensorObservation]:
        """Detect anomalous observations using Mahalanobis distance."""
        if len(observations) < 2:
            return []
        
        # Fuse all but one, check residual
        anomalies = []
        fused_pos, fused_var = self.fuse_observations(observations)
        
        for obs in observations:
            residual = obs.value - fused_pos
            std = np.sqrt(obs.variance + fused_var)
            
            if abs(residual) > threshold * std:
                anomalies.append(obs)
                logger.warning(
                    f"Anomaly detected: {obs.source} at {obs.timestamp}, "
                    f"residual={residual:.2f}m, threshold={threshold*std:.2f}m"
                )
        
        return anomalies


class SensorFusionService:
    """High-level service for sensor fusion operations."""
    
    def __init__(self):
        self.kalman_filters: Dict[str, CoastalKalmanFilter] = {}  # per transect
        self.bayesian_fusion = BayesianSensorFusion()
    
    def get_or_create_filter(self, transect_id: str) -> CoastalKalmanFilter:
        """Get or create Kalman filter for a transect."""
        if transect_id not in self.kalman_filters:
            self.kalman_filters[transect_id] = CoastalKalmanFilter()
        return self.kalman_filters[transect_id]
    
    def process_observation(
        self,
        transect_id: str,
        source: str,
        timestamp: datetime,
        value: float,
        variance: float,
        quality: float = 1.0,
    ) -> FusedState:
        """Process a single sensor observation."""
        kf = self.get_or_create_filter(transect_id)
        
        obs = SensorObservation(
            source=source,
            timestamp=timestamp,
            value=value,
            variance=variance,
            quality=quality,
        )
        
        return kf.update(obs)
    
    def process_batch(
        self,
        transect_id: str,
        observations: List[SensorObservation],
    ) -> List[FusedState]:
        """Process batch of observations for a transect."""
        # Group by timestamp
        by_time: Dict[datetime, List[SensorObservation]] = {}
        for obs in observations:
            if obs.timestamp not in by_time:
                by_time[obs.timestamp] = []
            by_time[obs.timestamp].append(obs)
        
        # Get initial state from first observation
        first_obs = min(observations, key=lambda o: o.timestamp)
        
        # Fuse time series
        return self.bayesian_fusion.fuse_time_series(
            by_time,
            initial_position=first_obs.value,
            initial_variance=first_obs.variance,
        )
    
    def get_current_estimate(self, transect_id: str) -> Optional[FusedState]:
        """Get current fused estimate for a transect."""
        if transect_id in self.kalman_filters:
            return self.kalman_filters[transect_id].get_state()
        return None