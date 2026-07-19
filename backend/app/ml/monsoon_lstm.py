# Monsoon LSTM Forecast Model
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AttentionLayer(nn.Module):
    """Additive attention for sequence modeling."""
    
    def __init__(self, hidden_size: int):
        super().__init__()
        self.W = nn.Linear(hidden_size, hidden_size)
        self.V = nn.Linear(hidden_size, 1, bias=False)
    
    def forward(self, lstm_out: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            lstm_out: (batch, seq_len, hidden_size)
        Returns:
            context: (batch, hidden_size)
            attention_weights: (batch, seq_len)
        """
        # (batch, seq_len, hidden_size)
        score = self.V(torch.tanh(self.W(lstm_out)))
        # (batch, seq_len, 1) -> (batch, seq_len)
        attention_weights = F.softmax(score.squeeze(-1), dim=1)
        # (batch, 1, seq_len) @ (batch, seq_len, hidden_size) -> (batch, 1, hidden_size)
        context = torch.bmm(attention_weights.unsqueeze(1), lstm_out).squeeze(1)
        return context, attention_weights


class MonsoonLSTM(nn.Module):
    """
    LSTM-based model for monsoon-season coastal erosion forecasting.
    
    Inputs:
    - Shoreline history: (batch, seq_len, 1) - monthly shoreline positions
    - Exogenous variables: (batch, seq_len, n_exog) - wave height, rainfall, wind, tide
    
    Outputs:
    - Multi-horizon forecasts: 7, 30, 90, 180, 365 days
    """
    
    def __init__(
        self,
        input_size: int = 1,  # shoreline position
        exog_size: int = 4,   # wave_height, rainfall, wind_speed, tide
        hidden_size: int = 128,
        num_layers: int = 2,
        dropout: float = 0.2,
        horizons: List[int] = None,
        bidirectional: bool = False,
    ):
        super().__init__()
        
        self.input_size = input_size
        self.exog_size = exog_size
        self.hidden_size = hidden_size
        self.horizons = horizons or [7, 30, 90, 180, 365]
        
        # Combined input: shoreline + exogenous
        combined_size = input_size + exog_size
        
        # LSTM encoder
        self.lstm = nn.LSTM(
            input_size=combined_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=bidirectional,
        )
        
        # Attention
        lstm_output_size = hidden_size * (2 if bidirectional else 1)
        self.attention = AttentionLayer(lstm_output_size)
        
        # Horizon-specific heads
        self.horizon_heads = nn.ModuleDict({
            str(h): nn.Sequential(
                nn.Linear(lstm_output_size, 64),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(64, 32),
                nn.ReLU(),
                nn.Linear(32, 3),  # position, lower_bound, upper_bound
            )
            for h in self.horizons
        })
        
        # Monsoon season embedding (learned)
        self.monsoon_embedding = nn.Embedding(12, 8)  # 12 months
        
        # Initialize weights
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            nn.init.xavier_uniform_(module.weight)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.LSTM):
            for name, param in module.named_parameters():
                if 'weight_ih' in name:
                    nn.init.xavier_uniform_(param)
                elif 'weight_hh' in name:
                    nn.init.orthogonal_(param)
                elif 'bias' in name:
                    nn.init.zeros_(param)
    
    def forward(
        self,
        shoreline_history: torch.Tensor,
        exog_variables: torch.Tensor,
        months: torch.Tensor,
    ) -> Dict[int, torch.Tensor]:
        """
        Args:
            shoreline_history: (batch, seq_len, 1)
            exog_variables: (batch, seq_len, exog_size)
            months: (batch, seq_len) - month indices 1-12
            
        Returns:
            Dict mapping horizon_days -> (batch, 3) [position, lower, upper]
        """
        batch_size, seq_len, _ = shoreline_history.shape
        
        # Add monsoon embedding
        month_emb = self.monsoon_embedding(months - 1)  # 0-indexed
        
        # Combine inputs
        combined = torch.cat([shoreline_history, exog_variables, month_emb], dim=-1)
        
        # LSTM
        lstm_out, (h_n, c_n) = self.lstm(combined)
        
        # Attention over sequence
        context, attn_weights = self.attention(lstm_out)
        
        # Predict for each horizon
        outputs = {}
        for h in self.horizons:
            head_out = self.horizon_heads[str(h)](context)
            outputs[h] = head_out
        
        return outputs, attn_weights
    
    def predict(
        self,
        shoreline_history: np.ndarray,
        exog_variables: np.ndarray,
        months: np.ndarray,
        device: str = "cpu",
    ) -> Dict[int, np.ndarray]:
        """Inference wrapper for numpy arrays."""
        self.eval()
        with torch.no_grad():
            sh = torch.FloatTensor(shoreline_history).to(device)
            exog = torch.FloatTensor(exog_variables).to(device)
            mon = torch.LongTensor(months).to(device)
            
            outputs, attn = self.forward(sh, exog, mon)
            
            results = {}
            for h, out in outputs.items():
                results[h] = out.cpu().numpy()
            
            return results, attn.cpu().numpy()


class MonsoonLSTMTrainer:
    """Training pipeline for Monsoon LSTM."""
    
    def __init__(
        self,
        model: MonsoonLSTM,
        device: str = "cpu",
        learning_rate: float = 1e-3,
        weight_decay: float = 1e-4,
    ):
        self.model = model.to(device)
        self.device = device
        self.optimizer = torch.optim.AdamW(
            model.parameters(),
            lr=learning_rate,
            weight_decay=weight_decay,
        )
        self.scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=10
        )
        self.criterion = nn.MSELoss()
    
    def compute_loss(
        self,
        predictions: Dict[int, torch.Tensor],
        targets: Dict[int, torch.Tensor],
    ) -> torch.Tensor:
        """Compute multi-horizon loss with horizon weighting."""
        total_loss = 0
        horizon_weights = {7: 1.0, 30: 1.0, 90: 0.8, 180: 0.6, 365: 0.4}
        
        for h, pred in predictions.items():
            if h in targets:
                weight = horizon_weights.get(h, 1.0)
                # Use only position (first column) for loss
                loss = self.criterion(pred[:, 0], targets[h][:, 0])
                total_loss += weight * loss
        
        return total_loss
    
    def train_step(
        self,
        shoreline: torch.Tensor,
        exog: torch.Tensor,
        months: torch.Tensor,
        targets: Dict[int, torch.Tensor],
    ) -> float:
        self.model.train()
        self.optimizer.zero_grad()
        
        predictions, _ = self.model(shoreline, exog, months)
        loss = self.compute_loss(predictions, targets)
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
        self.optimizer.step()
        
        return loss.item()
    
    def validate(
        self,
        shoreline: torch.Tensor,
        exog: torch.Tensor,
        months: torch.Tensor,
        targets: Dict[int, torch.Tensor],
    ) -> Dict[int, float]:
        self.model.eval()
        with torch.no_grad():
            predictions, _ = self.model(shoreline, exog, months)
            
            metrics = {}
            for h, pred in predictions.items():
                if h in targets:
                    mse = F.mse_loss(pred[:, 0], targets[h][:, 0]).item()
                    mae = F.l1_loss(pred[:, 0], targets[h][:, 0]).item()
                    metrics[f"horizon_{h}_mse"] = mse
                    metrics[f"horizon_{h}_mae"] = mae
            
            return metrics


def create_training_data(
    shoreline_series: np.ndarray,
    exog_data: np.ndarray,
    dates: np.ndarray,
    horizons: List[int] = None,
    seq_len: int = 24,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict[int, np.ndarray]]:
    """
    Create supervised training samples from time series.
    
    Args:
        shoreline_series: (T,) monthly shoreline positions
        exog_data: (T, n_exog) exogenous variables
        dates: (T,) datetime objects
        horizons: Forecast horizons in days
        seq_len: Input sequence length (months)
        
    Returns:
        X_shoreline: (N, seq_len, 1)
        X_exog: (N, seq_len, n_exog)
        X_months: (N, seq_len)
        y: Dict[horizon] -> (N, 1)
    """
    horizons = horizons or [7, 30, 90, 180, 365]
    T = len(shoreline_series)
    
    X_shoreline = []
    X_exog = []
    X_months = []
    y_dict = {h: [] for h in horizons}
    
    for i in range(seq_len, T - max(horizons) // 30):
        # Input sequence
        X_shoreline.append(shoreline_series[i - seq_len:i].reshape(-1, 1))
        X_exog.append(exog_data[i - seq_len:i])
        X_months.append(np.array([d.month for d in dates[i - seq_len:i]]))
        
        # Targets for each horizon
        for h in horizons:
            target_idx = i + h // 30
            if target_idx < T:
                y_dict[h].append(shoreline_series[target_idx])
            else:
                y_dict[h].append(np.nan)
    
    # Convert to arrays, filter NaN
    X_shoreline = np.array(X_shoreline)
    X_exog = np.array(X_exog)
    X_months = np.array(X_months)
    
    for h in horizons:
        y_dict[h] = np.array(y_dict[h]).reshape(-1, 1)
    
    # Remove samples with NaN targets
    valid = np.all([~np.isnan(y_dict[h]) for h in horizons], axis=0)
    
    return (
        X_shoreline[valid],
        X_exog[valid],
        X_months[valid],
        {h: y_dict[h][valid] for h in horizons},
    )


class MonsoonForecastService:
    """High-level service for monsoon erosion forecasting."""
    
    def __init__(
        self,
        model_path: str,
        device: str = "cpu",
        seq_len: int = 24,
    ):
        self.device = device
        self.seq_len = seq_len
        
        # Load model
        checkpoint = torch.load(model_path, map_location=device)
        self.model = MonsoonLSTM(**checkpoint['config'])
        self.model.load_state_dict(checkpoint['state_dict'])
        self.model.to(device)
        self.model.eval()
        
        # Normalization stats (should be saved with model)
        self.shoreline_mean = checkpoint.get('shoreline_mean', 0)
        self.shoreline_std = checkpoint.get('shoreline_std', 1)
        self.exog_mean = checkpoint.get('exog_mean', np.zeros(4))
        self.exog_std = checkpoint.get('exog_std', np.ones(4))
    
    def preprocess(
        self,
        shoreline_history: np.ndarray,
        exog_history: np.ndarray,
        dates: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Normalize and prepare inputs."""
        # Normalize
        shoreline_norm = (shoreline_history - self.shoreline_mean) / self.shoreline_std
        exog_norm = (exog_history - self.exog_mean) / self.exog_std
        
        # Get last seq_len months
        if len(shoreline_norm) > self.seq_len:
            shoreline_norm = shoreline_norm[-self.seq_len:]
            exog_norm = exog_norm[-self.seq_len:]
            dates = dates[-self.seq_len:]
        
        months = np.array([d.month for d in dates])
        
        return shoreline_norm, exog_norm, months
    
    def forecast(
        self,
        shoreline_history: np.ndarray,
        exog_history: np.ndarray,
        dates: np.ndarray,
    ) -> Dict[int, Dict[str, float]]:
        """
        Generate multi-horizon forecast.
        
        Returns:
            Dict[horizon_days] -> {position, lower, upper, confidence}
        """
        sh, exog, months = self.preprocess(shoreline_history, exog_history, dates)
        
        # Add batch dimension
        sh = sh.reshape(1, -1, 1)
        exog = exog.reshape(1, -1, exog.shape[-1])
        months = months.reshape(1, -1)
        
        predictions, attention = self.model.predict(sh, exog, months, self.device)
        
        results = {}
        for h, pred in predictions.items():
            # Denormalize
            position = pred[0, 0] * self.shoreline_std + self.shoreline_mean
            lower = pred[0, 1] * self.shoreline_std + self.shoreline_mean
            upper = pred[0, 2] * self.shoreline_std + self.shoreline_mean
            
            results[h] = {
                "position": float(position),
                "lower": float(lower),
                "upper": float(upper),
                "confidence": 1.0 - (upper - lower) / (2 * self.shoreline_std),
            }
        
        return results