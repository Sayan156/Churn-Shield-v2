# ChurnShield — Customer Retention Intelligence

ChurnShield is a machine-learning customer churn prediction system that identifies customers who are likely to leave. It combines multiple trained models, threshold optimization, class-imbalance handling, and SHAP explainability in a React-based web application.

## Features

- Compare predictions from the stacking logistic regression, stacking XGBoost, and XGBoost models
- View churn probabilities and threshold-based predictions
- Generate SHAP explanations for individual customer predictions
- Upload a CSV file for batch scoring and download the results
- Use a responsive React dashboard with light and dark themes
- Serve predictions through a FastAPI backend

## Project workflow

1. Data cleaning and preprocessing
2. Exploratory data analysis
3. Feature engineering
4. Class-imbalance handling
5. Model training
6. Stacking and threshold optimization
7. Model evaluation
8. SHAP explainability
9. FastAPI and React deployment

## Project structure

```text
ChurnShield/
├── client/                        # React + Vite frontend
│   ├── src/                       # React components and styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.mjs
├── models/                        # Trained models and metadata
├── main.py                        # FastAPI prediction API
├── requirements.txt               # Python dependencies
├── BankChurners.csv               # Dataset
├── churnshield.ipynb              # Exploratory data analysis
├── churn_shield_model_final.ipynb # Model training and evaluation
├── churnshield_ann.ipynb          # Additional model experiments
├── datasetlink.txt                # Dataset source
└── README.md
```

## Machine-learning notebooks

`churnshield.ipynb` covers exploratory data analysis and dataset exploration.

`churn_shield_model_final.ipynb` contains the main preprocessing, model training, threshold optimization, evaluation, SHAP analysis, and model-saving workflow.

`churnshield_ann.ipynb` contains additional artificial neural network experiments.

## Technologies

- Python, Pandas, NumPy, scikit-learn, XGBoost, CatBoost
- SHAP for explainability
- FastAPI and Uvicorn for the backend API
- React and Vite for the frontend
- Cloudpickle for model serialization

## Running the application

Clone the repository and install the backend dependencies:

```bash
git clone https://github.com/Sayan156/Churn-Shield-Project.git
cd Churn-Shield-Project
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

In a second terminal, install and start the React client:

```bash
cd client
npm install
npm run dev
```

The Vite development server proxies `/api` requests to the backend. The client uses `http://127.0.0.1:8000` when an API URL is not otherwise configured. Set `VITE_API_URL` if the backend is hosted elsewhere.

## API capabilities

- `GET /health` — API and model health check
- `GET /meta` — model metadata and input feature definitions
- `POST /predict/compare` — compare all available models for one customer
- `POST /predict/{model_key}` — run one selected model
- `POST /batch` — score a CSV file
- `POST /explain` — generate a SHAP explanation

## Model highlights

- Ensemble-based churn prediction using stacking models
- Recall-focused threshold optimization
- Reported churn recall of 94.47% in the training workflow
- SHAP-based feature impact explanations

## Dataset

The project uses the `BankChurners` dataset. Its source is listed in `datasetlink.txt`.

## Future improvements

- Hyperparameter optimization
- Deep-learning model integration
- Docker containerization
- Cloud deployment with CI/CD

## Author

**Sayan Bhattacharyya**

B.Tech in Computer Science & Engineering
