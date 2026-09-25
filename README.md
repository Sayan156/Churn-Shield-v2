# ChurnShield - Customer Retention (Churn) Analysis System

ChurnShield is a Machine Learning-based customer churn prediction system developed to identify customers who are likely to leave a business. The project combines multiple machine learning algorithms using a **Stacking Classifier** to improve prediction performance and provides an interactive **Streamlit** web application for real-time churn prediction.

The project also focuses on **threshold optimization**, **class imbalance handling**, and **Explainable AI (XAI)** using **SHAP** to make the model more reliable and interpretable.

---

## 🚀 Features

- Predict customer churn using an ensemble **Stacking Classifier**
- Achieved **94.47% Recall** on the churn class
- Optimized classification thresholds using Precision-Recall analysis
- Addressed class imbalance to improve minority class prediction
- Explainable AI using **SHAP (SHapley Additive Explanations)**
- Interactive web interface built with **Streamlit**
- Model serialization using **Cloudpickle**

---

## 📊 Project Workflow

1. Data Cleaning & Preprocessing
2. Exploratory Data Analysis (EDA)
3. Feature Engineering
4. Handling Class Imbalance
5. Training Multiple Machine Learning Models
6. Building a Stacking Classifier
7. Threshold Optimization
8. Model Evaluation
9. SHAP Explainability
10. Streamlit Deployment

---

## 📁 Project Structure

```
ChurnShield/
│
├── app.py                          # Streamlit web application
├── requirements.txt                # Required Python packages
├── BankChurners.csv                # Dataset
├── churnshield.ipynb               # Exploratory Data Analysis (EDA)
├── churn_shield_model_final.ipynb  # Model training, evaluation and saving
├── datasetlink.txt                 # Dataset source
└── README.md
```

---

## 📒 Notebook Description

### churnshield.ipynb

This notebook is dedicated to:

- Exploratory Data Analysis (EDA)
- Understanding feature distributions
- Data visualization
- Dataset exploration

### churn_shield_model_final.ipynb

This notebook contains the complete Machine Learning pipeline:

- Data preprocessing
- Class imbalance handling
- Training multiple machine learning models
- Building the Stacking Classifier
- Threshold optimization
- Model evaluation
- SHAP explainability
- Saving the trained model using Cloudpickle

---

## 🛠️ Technologies Used

- Python
- Scikit-learn
- Pandas
- NumPy
- Streamlit
- SHAP
- Matplotlib
- Cloudpickle

---

## 📈 Model Highlights

- **Ensemble Method:** Stacking Classifier
- **Primary Evaluation Metric:** Recall
- **Recall Achieved:** **94.47%**
- Threshold optimized using Precision-Recall analysis
- Class imbalance handled during training
- SHAP used for feature importance and model interpretation

---

## 📂 Dataset

The project uses the **BankChurners** dataset.

The dataset source is provided in **datasetlink.txt**.

---

## ▶️ Running the Project

Clone the repository:

```bash
git clone https://github.com/Sayan156/Churn-Shield-Project.git
```

Move into the project directory:

```bash
cd Churn-Shield-Project
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Run the Streamlit application:

```bash
streamlit run app.py
```

---
---

## 🖥️ Application Features

The Streamlit application provides multiple ways to analyze customer churn:

### 🔹 Multiple Model Prediction

Users can select from different trained machine learning models to compare predictions and evaluate their performance.

### 🔹 Individual Customer Prediction with SHAP Explanation

Predict the churn probability for a single customer by entering customer details through the web interface. The application also generates **SHAP explanations** to show how each feature influenced the prediction, making the model's decisions transparent and interpretable.

### 🔹 Batch Prediction

Upload a CSV file containing multiple customer records in the required format to perform bulk churn prediction.

The application automatically:
- Predicts churn for every customer
- Displays the prediction results
- Allows users to download the predictions as a CSV file
- Preserves the original customer data along with the predicted churn labels

---

## ⚡ React + FastAPI website

The new website uses the trained models through `main.py` and supports single-customer comparison, SHAP explanations, CSV batch scoring, and the model benchmark page.

Start the API:

```bash
uvicorn main:app --reload
```

In a second terminal, start the React client:

```bash
cd client
npm install
npm run dev
```

The client defaults to `http://127.0.0.1:8000`. Set `VITE_API_URL` when the API is hosted elsewhere.

## 🎯 Future Improvements

- Hyperparameter optimization
- Deep Learning-based churn prediction
- Interactive SHAP visualizations within the Streamlit application
- Docker containerization
- Cloud deployment with CI/CD

---

## 👨‍💻 Author

**Sayan Bhattacharyya**

B.Tech in Computer Science & Engineering

Machine Learning | Data Science | Software Development
