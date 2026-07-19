# Sensor Data Simulator - Generates realistic synthetic coastal sensor data
"""
Generates physically realistic synthetic sensor data for development
and testing when no hardware is available.

Simulates:
- Tide gauges (astronomical tide + surge + noise)
- Wave buoys (JONSWAP spectrum + directionality)
- Cameras (shoreline position from erosion model + tidal offset)
- Weather stations (wind, pressure, rainfall)
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class TidalConstituents:
    """Major tidal constituents for Indian west coast (Mangalore)."""
    # Amplitude (m), Phase (degrees), Frequency (cycles/hour)
    constituents = {
        'M2':  (0.52,  45,  28.9841),   # Principal lunar semidiurnal
        'S2':  (0.18, 120,  30.0000),   # Principal solar semidiurnal
        'K1':  (0.12,  10,  15.0411),   # Lunisolar diurnal
        'O1':  (0.09, 350,  13.9430),   # Lunar diurnal
        'N2':  (0.09,  30,  28.4397),   # Larger lunar elliptic
        'K2':  (0.05, 130,  30.0821),   # Lunisolar semidiurnal
        'P1':  (0.04, 340,  14.9589),   # Solar diurnal
        'Q1':  (0.03, 330,  13.3987),   # Larger lunar elliptic diurnal
    }


class TideModel:
    """Astronomical tide model using harmonic constituents."""
    
    def __init__(self, latitude: float = 12.9, longitude: float = 74.8):
        self.latitude = latitude
        self.longitude = longitude
        self.constituents = TidalConstituents.constituents
    
    def predict(self, timestamp: datetime) -> float:
        """
        Predict astronomical tide level at given timestamp.
        
        Returns:
            Tide height in meters relative to MSL
        """
        # Convert to hours since epoch
        epoch = datetime(2000, 1, 1)
        hours = (timestamp - epoch).total_seconds() / 3600
        
        height = 0.0
        for name, (amp, phase, freq) in self.constituents.items():
            # Simplified: phase in degrees, freq in cycles/hour
            angle = 2 * np.pi * (freq * hours + phase / 360)
            height += amp * np.cos(angle)
        
        return height
    
    def predict_range(self, start: datetime, end: datetime, freq_minutes: int = 60) -> List[Tuple[datetime, float]]:
        """Predict tide over a time range."""
        results = []
        current = start
        while current <= end:
            results.append((current, self.predict(current)))
            current += timedelta(minutes=freq_minutes)
        return results


class WaveModel:
    """Wave model for Arabian Sea / Indian west coast."""
    
    def __init__(self):
        # Seasonal wave climate for Mangalore
        self.seasonal_params = {
            # Monsoon (Jun-Sep): High waves from SW
            'monsoon': {
                'hs_mean': 2.5,    # Significant wave height (m)
                'hs_std': 0.8,
                'tp_mean': 10.0,   # Peak period (s)
                'tp_std': 1.5,
                'dir_mean': 225,   # SW (degrees)
                'dir_spread': 30,
                'storm_prob': 0.15,  # Probability of storm event per day
                'storm_hs_mult': 2.5,
            },
            # Post-monsoon (Oct-Nov): Moderate
            'post_monsoon': {
                'hs_mean': 1.2,
                'hs_std': 0.4,
                'tp_mean': 8.0,
                'tp_std': 1.0,
                'dir_mean': 200,
                'dir_spread': 40,
                'storm_prob': 0.05,
                'storm_hs_mult': 2.0,
            },
            # Fair weather (Dec-May): Low waves
            'fair': {
                'hs_mean': 0.6,
                'hs_std': 0.2,
                'tp_mean': 6.0,
                'tp_std': 1.0,
                'dir_mean': 270,   # W
                'dir_spread': 50,
                'storm_prob': 0.01,
                'storm_hs_mult': 1.5,
            },
        }
    
    def _get_season(self, month: int) -> str:
        if month in [6, 7, 8, 9]:
            return 'monsoon'
        elif month in [10, 11]:
            return 'post_monsoon'
        else:
            return 'fair'
    
    def significant_wave_height(
        self,
        timestamp: datetime,
        include_storms: bool = True,
    ) -> Tuple[float, float, float]:
        """
        Generate significant wave height, peak period, and direction.
        
        Returns:
            (Hs, Tp, direction)
        """
        season = self._get_season(timestamp.month)
        params = self.seasonal_params[season]
        
        # Base wave height
        hs = max(0.1, np.random.normal(params['hs_mean'], params['hs_std']))
        tp = max(3.0, np.random.normal(params['tp_mean'], params['tp_std']))
        direction = np.random.normal(params['dir_mean'], params['dir_spread']) % 360
        
        # Storm events
        if include_storms and np.random.random() < params['storm_prob']:
            hs *= params['storm_hs_mult']
            tp *= 1.2
        
        return hs, tp, direction
    
    def storm_surge(self, timestamp: datetime) -> float:
        """Estimate storm surge component (m)."""
        season = self._get_season(timestamp.month)
        
        if season == 'monsoon':
            # Monsoon: higher surge probability
            if np.random.random() < 0.05:  # 5% chance per timestep
                return np.random.exponential(0.3)  # Mean 0.3m surge
        elif season == 'post_monsoon':
            if np.random.random() < 0.02:
                return np.random.exponential(0.2)
        
        return 0.0


class ErosionProcess:
    """Stochastic shoreline evolution model."""
    
    def __init__(
        self,
        baseline_position: float = 100.0,
        long_term_rate: float = -0.3,  # m/yr (negative = erosion)
        seasonal_amplitude: float = 2.0,  # m
        monsoon_months: List[int] = None,
        noise_std: float = 0.1,  # m per timestep
    ):
        self.baseline = baseline_position
        self.long_term_rate = long_term_rate / 365.25  # m/day
        self.seasonal_amp = seasonal_amplitude
        self.monsoon_months = monsoon_months or [6, 7, 8, 9]
        self.noise_std = noise_std
        
        # State
        self.current_position = baseline_position
        self.last_update = datetime.now()
    
    def position_at(self, timestamp: datetime) -> float:
        """Get shoreline position at specific time."""
        # Days since baseline
        epoch = datetime(2000, 1, 1)
        days = (timestamp - epoch).days
        
        # Long-term trend
        trend = self.long_term_rate * days
        
        # Seasonal cycle (cosine, peak erosion in monsoon)
        # Phase: max erosion at month 7 (July), recovery by month 12
        doy = timestamp.timetuple().tm_yday
        phase = 2 * np.pi * (doy - 200) / 365.25  # Peak ~July 19
        seasonal = self.seasonal_amp * np.cos(phase)
        
        # Stochastic component (random walk)
        np.random.seed(int(timestamp.timestamp()) % 2**32)
        stochastic = np.random.normal(0, self.noise_std * np.sqrt(days))
        
        return self.baseline + trend + seasonal + stochastic
    
    def erosion_rate_at(self, timestamp: datetime) -> float:
        """Instantaneous erosion rate (m/year)."""
        # Derivative of position
        doy = timestamp.timetuple().tm_yday
        phase = 2 * np.pi * (doy - 200) / 365.25
        seasonal_rate = -self.seasonal_amp * (2 * np.pi / 365.25) * np.sin(phase) * 365.25
        
        return self.long_term_rate * 365.25 + seasonal_rate


class BeachSlope:
    """Beach slope for converting water level to shoreline position."""
    
    def __init__(self, slope: float = 0.05):  # 1:20 slope
        self.slope = slope  # vertical/horizontal
    
    def water_level_to_shoreline(self, water_level: float, datum: float = 0.0) -> float:
        """
        Convert water level to horizontal shoreline shift.
        
        Args:
            water_level: Water level relative to datum (m)
            datum: Reference datum (m)
            
        Returns:
            Horizontal shoreline shift (m, positive = seaward)
        """
        # Positive water level -> shoreline moves landward (negative)
        return -(water_level - datum) / self.slope


class CoastalSensorSimulator:
    """
    Main simulator generating all sensor data for a coastal transect.
    """
    
    def __init__(
        self,
        transect_id: str,
        latitude: float,
        longitude: float,
        baseline_position: float = 100.0,
        beach_slope: float = 0.05,
        long_term_erosion_rate: float = -0.3,
        seasonal_amplitude: float = 2.0,
    ):
        self.transect_id = transect_id
        self.latitude = latitude
        self.longitude = longitude
        
        # Models
        self.tide_model = TideModel(latitude, longitude)
        self.wave_model = WaveModel()
        self.erosion_model = ErosionProcess(
            baseline_position=baseline_position,
            long_term_rate=long_term_erosion_rate,
            seasonal_amplitude=seasonal_amplitude,
        )
        self.beach_slope = BeachSlope(beach_slope)
        
        # Sensor noise parameters
        self.noise = {
            'tide_gauge': 0.01,    # m (1 cm)
            'wave_buoy': 0.05,     # m (5 cm)
            'camera': 0.5,         # m
            'weather': 0.1,        # m/s for wind, hPa for pressure
        }
    
    def generate_tide_reading(self, timestamp: datetime) -> Dict:
        """Generate tide gauge reading."""
        # Astronomical tide
        astro_tide = self.tide_model.predict(timestamp)
        
        # Storm surge
        surge = self.wave_model.storm_surge(timestamp)
        
        # Total water level
        water_level = astro_tide + surge
        
        # Add noise
        noisy_level = water_level + np.random.normal(0, self.noise['tide_gauge'])
        
        return {
            'sensor_type': 'tide_gauge',
            'timestamp': timestamp.isoformat(),
            'water_level_m': float(noisy_level),
            'astronomical_tide_m': float(astro_tide),
            'surge_m': float(surge),
            'quality': 1.0,
        }
    
    def generate_wave_reading(self, timestamp: datetime) -> Dict:
        """Generate wave buoy reading."""
        hs, tp, direction = self.wave_model.significant_wave_height(timestamp)
        
        # Add noise
        hs_noisy = max(0.1, hs + np.random.normal(0, self.noise['wave_buoy']))
        tp_noisy = max(2.0, tp + np.random.normal(0, 0.5))
        dir_noisy = (direction + np.random.normal(0, 5)) % 360
        
        return {
            'sensor_type': 'wave_buoy',
            'timestamp': timestamp.isoformat(),
            'hs_m': float(hs_noisy),
            'tp_s': float(tp_noisy),
            'direction_deg': float(dir_noisy),
            'quality': 1.0,
        }
    
    def generate_camera_reading(self, timestamp: datetime) -> Dict:
        """Generate camera-derived shoreline position."""
        # True shoreline position from erosion model
        true_position = self.erosion_model.position_at(timestamp)
        
        # Tidal modulation (water level affects apparent shoreline)
        water_level = self.tide_model.predict(timestamp) + self.wave_model.storm_surge(timestamp)
        tidal_shift = self.beach_slope.water_level_to_shoreline(water_level)
        
        # Apparent shoreline = true + tidal shift + noise
        apparent = true_position + tidal_shift + np.random.normal(0, self.noise['camera'])
        
        return {
            'sensor_type': 'camera',
            'timestamp': timestamp.isoformat(),
            'shoreline_position_m': float(apparent),
            'true_position_m': float(true_position),
            'tidal_shift_m': float(tidal_shift),
            'water_level_m': float(water_level),
            'quality': 0.9,
        }
    
    def generate_weather_reading(self, timestamp: datetime) -> Dict:
        """Generate weather station reading."""
        season = self.wave_model._get_season(timestamp.month)
        
        if season == 'monsoon':
            wind_speed = max(0, np.random.normal(12, 4))  # m/s
            wind_dir = np.random.normal(225, 30) % 360  # SW
            rainfall = max(0, np.random.exponential(15))  # mm/day
            pressure = np.random.normal(1008, 3)  # hPa
        elif season == 'post_monsoon':
            wind_speed = max(0, np.random.normal(6, 3))
            wind_dir = np.random.normal(200, 40) % 360
            rainfall = max(0, np.random.exponential(5))
            pressure = np.random.normal(1012, 2)
        else:  # fair
            wind_speed = max(0, np.random.normal(4, 2))
            wind_dir = np.random.normal(270, 50) % 360
            rainfall = max(0, np.random.exponential(1))
            pressure = np.random.normal(1015, 2)
        
        return {
            'sensor_type': 'weather',
            'timestamp': timestamp.isoformat(),
            'wind_speed_ms': float(wind_speed),
            'wind_dir_deg': float(wind_dir),
            'rainfall_mm': float(rainfall),
            'pressure_hpa': float(pressure),
            'temperature_c': float(np.random.normal(28, 2)),
            'humidity_pct': float(np.clip(np.random.normal(75, 10), 40, 100)),
            'quality': 1.0,
        }
    
    def generate_all(self, timestamp: datetime) -> Dict:
        """Generate all sensor readings for a timestamp."""
        return {
            'transect_id': self.transect_id,
            'timestamp': timestamp.isoformat(),
            'tide_gauge': self.generate_tide_reading(timestamp),
            'wave_buoy': self.generate_wave_reading(timestamp),
            'camera': self.generate_camera_reading(timestamp),
            'weather': self.generate_weather_reading(timestamp),
        }
    
    def generate_time_series(
        self,
        start: datetime,
        end: datetime,
        freq_minutes: int = 60,
    ) -> List[Dict]:
        """Generate time series of all sensor readings."""
        results = []
        current = start
        while current <= end:
            results.append(self.generate_all(current))
            current += timedelta(minutes=freq_minutes)
        return results


class MultiTransectSimulator:
    """Simulator for multiple transects along Mangalore coast."""
    
    # Mangalore transect configurations
    TRANSECTS = [
        {
            'id': 'mangala_north',
            'name': 'Mangala Beach North',
            'lat': 12.876,
            'lon': 74.834,
            'baseline': 100.0,
            'slope': 0.05,
            'erosion_rate': -0.35,
            'seasonal_amp': 2.5,
        },
        {
            'id': 'mangala_central',
            'name': 'Mangala Beach Central',
            'lat': 12.873,
            'lon': 74.837,
            'baseline': 100.0,
            'slope': 0.05,
            'erosion_rate': -0.28,
            'seasonal_amp': 2.2,
        },
        {
            'id': 'mangala_south',
            'name': 'Mangala Beach South',
            'lat': 12.870,
            'lon': 74.840,
            'baseline': 100.0,
            'slope': 0.04,
            'erosion_rate': -0.22,
            'seasonal_amp': 1.8,
        },
        {
            'id': 'someshwar_north',
            'name': 'Someshwar Beach North',
            'lat': 12.894,
            'lon': 74.802,
            'baseline': 120.0,
            'slope': 0.06,
            'erosion_rate': -0.42,
            'seasonal_amp': 3.0,
        },
        {
            'id': 'someshwar_central',
            'name': 'Someshwar Beach Central',
            'lat': 12.891,
            'lon': 74.805,
            'baseline': 120.0,
            'slope': 0.06,
            'erosion_rate': -0.38,
            'seasonal_amp': 2.8,
        },
        {
            'id': 'tannirbhavi_north',
            'name': 'Tannirbhavi Beach North',
            'lat': 12.914,
            'lon': 74.799,
            'baseline': 150.0,
            'slope': 0.04,
            'erosion_rate': -0.18,
            'seasonal_amp': 1.5,
        },
        {
            'id': 'tannirbhavi_central',
            'name': 'Tannirbhavi Beach Central',
            'lat': 12.911,
            'lon': 74.802,
            'baseline': 150.0,
            'slope': 0.04,
            'erosion_rate': -0.15,
            'seasonal_amp': 1.2,
        },
        {
            'id': 'panambur_north',
            'name': 'Panambur Beach North',
            'lat': 12.929,
            'lon': 74.809,
            'baseline': 100.0,
            'slope': 0.05,
            'erosion_rate': -0.25,
            'seasonal_amp': 2.0,
        },
        {
            'id': 'panambur_central',
            'name': 'Panambur Beach Central',
            'lat': 12.926,
            'lon': 74.812,
            'baseline': 100.0,
            'slope': 0.05,
            'erosion_rate': -0.20,
            'seasonal_amp': 1.8,
        },
        {
            'id': 'ullal_north',
            'name': 'Ullal Beach North',
            'lat': 12.819,
            'lon': 74.856,
            'baseline': 80.0,
            'slope': 0.07,
            'erosion_rate': -0.50,
            'seasonal_amp': 3.5,
        },
    ]
    
    def __init__(self):
        self.simulators = {}
        for t in self.TRANSECTS:
            self.simulators[t['id']] = CoastalSensorSimulator(
                transect_id=t['id'],
                latitude=t['lat'],
                longitude=t['lon'],
                baseline_position=t['baseline'],
                beach_slope=t['slope'],
                long_term_erosion_rate=t['erosion_rate'],
                seasonal_amplitude=t['seasonal_amp'],
            )
    
    def get_simulator(self, transect_id: str) -> CoastalSensorSimulator:
        return self.simulators.get(transect_id)
    
    def generate_all_transects(
        self,
        start: datetime,
        end: datetime,
        freq_minutes: int = 60,
    ) -> Dict[str, List[Dict]]:
        """Generate data for all transects."""
        results = {}
        for tid, sim in self.simulators.items():
            results[tid] = sim.generate_time_series(start, end, freq_minutes)
        return results


# Convenience function for quick data generation
def generate_sample_data(
    days: int = 365,
    freq_minutes: int = 60,
    end_date: datetime = None,
) -> Dict[str, List[Dict]]:
    """Generate sample data for all Mangalore transects."""
    if end_date is None:
        end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    simulator = MultiTransectSimulator()
    return simulator.generate_all_transects(start_date, end_date, freq_minutes)