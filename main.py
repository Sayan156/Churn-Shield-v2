import io
import json
import os

import cloudpickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
with open(os.path.join(MODEL_DIR, "model_meta.json"), "r") as f:
    metadata = json.load(f)
THRESHOLD = metadata["threshold"]
FEATURES = metadata["input_features"]
#MODEL_FILES = {"stacking-lr": "stacking_lr_meta.pkl", "stacking-xgb": "stacking_xgb_meta.pkl", "xgboost": "xgboost.pkl"}
MODEL_FILES = {
    "stacking_lr_meta": "stacking_lr_meta.pkl",
    "stacking_xgb_meta": "stacking_xgb_meta.pkl",
    "xgboost": "xgboost.pkl"
}
DISPLAY_NAMES = metadata["display_names"]

def load_model(filename):
    with open(os.path.join(MODEL_DIR, filename), "rb") as f:
        return cloudpickle.load(f)

MODELS = {key: load_model(filename) for key, filename in MODEL_FILES.items()}
app = FastAPI(title="ChurnShield API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

class CustomerData(BaseModel):
    Customer_Age: int
    Months_on_book: int
    Total_Relationship_Count: int
    Months_Inactive_12_mon: int
    Contacts_Count_12_mon: int
    Total_Revolving_Bal: float
    Total_Amt_Chng_Q4_Q1: float
    Total_Trans_Amt: float
    Total_Trans_Ct: int
    Total_Ct_Chng_Q4_Q1: float
    Avg_Utilization_Ratio: float
    Gender: str
    Education_Level: str
    Marital_Status: str
    Income_Category: str
    Card_Category: str

def prepare_data(data: CustomerData) -> pd.DataFrame:
    return pd.DataFrame([data.model_dump()])[FEATURES]

def json_value(value):
    return value.item() if isinstance(value, np.generic) else value

def result_for(model_key: str, data: CustomerData):

    if model_key not in MODELS:
        raise HTTPException(
            status_code=404,
            detail="Unknown model"
        )

    probability = float(
        MODELS[model_key]
        .predict_proba(prepare_data(data))[0][1]
    )

    return {
        "model": DISPLAY_NAMES[model_key],
        "model_key": model_key,
        "probability": probability,
        "prediction": int(probability >= THRESHOLD),
        "threshold": THRESHOLD
    }
@app.get("/health")
def health():
    return {"status": "ok", "models": list(MODELS.keys()), "threshold": THRESHOLD}

@app.get("/meta")
def meta():
    return {**metadata, "threshold": THRESHOLD}

@app.post("/predict/compare")
def compare(data: CustomerData):
    return {"results": [result_for(key, data) for key in MODEL_FILES]}

@app.post("/predict/{model_key}")
def predict(model_key: str, data: CustomerData):
    return result_for(model_key, data)

@app.post("/batch")

async def batch(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")
    try:
        frame = pd.read_csv(io.BytesIO(await file.read()))
        missing = [feature for feature in FEATURES if feature not in frame.columns]
        if missing:
            raise HTTPException(status_code=422, detail=f"Missing columns: {', '.join(missing)}")
        clean = frame[FEATURES].copy()
        response = frame.copy()
        for key, model in MODELS.items():
            probabilities = model.predict_proba(clean)[:, 1]
            label = key.replace("-", "_")
            response[f"{label}_probability"] = probabilities
            response[f"{label}_prediction"] = (probabilities >= THRESHOLD).astype(int)
        return {"filename": "churnshield_predictions.csv", "rows": len(response), "columns": list(response.columns), "csv": response.to_csv(index=False)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not process file: {exc}") from exc

@app.post("/explain")
def explain(data: CustomerData, model_key: str = "stacking_xgb_meta"):
    if model_key not in MODELS:
        raise HTTPException(status_code=404, detail="Unknown model")
    try:
        import shap
        row = prepare_data(data)
        dataset_path = os.path.join(os.path.dirname(__file__), "BankChurners.csv")
        background_source = pd.read_csv(dataset_path)
        background = background_source[FEATURES].sample(n=min(25, len(background_source)), random_state=42)
        explanation_model = lambda values: MODELS[model_key].predict_proba(pd.DataFrame(values, columns=FEATURES))[:, 1]
        explainer = shap.KernelExplainer(explanation_model, background)
        values = explainer.shap_values(row, nsamples=80)
        if isinstance(values, list):
            values = values[0]
        base_value = explainer.expected_value
        if isinstance(base_value, (list, tuple)):
            base_value = base_value[0]
        return {"model": DISPLAY_NAMES[model_key], "base_value": float(base_value), "features": [{"name": name, "value": json_value(row.iloc[0][name]), "impact": float(impact)} for name, impact in zip(FEATURES, values[0])]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {exc}") from exc
