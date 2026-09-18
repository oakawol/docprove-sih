FROM python:3.11-slim

# Install system dependencies (Tesseract OCR, OpenCV dependencies)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port and run uvicorn
EXPOSE 8000
CMD ["uvicorn", "document_screening.api:app", "--host", "0.0.0.0", "--port", "8000"]
