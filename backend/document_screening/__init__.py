"""AI-based fake identity & document screening - Phases 2 to 5."""
from .pipeline import screen                     # noqa: F401
from . import ocr, validation, mrz, tampering, risk, face, history, calibration  # noqa: F401

__all__ = ["screen", "ocr", "validation", "mrz", "tampering", "risk",
          "face", "history", "calibration"]
__version__ = "0.1.0"
