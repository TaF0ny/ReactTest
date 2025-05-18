# backend/scripts/train_model.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import MinMaxScaler
import joblib
from pathlib import Path

# 모델 저장 폴더 생성
Path("backend/model").mkdir(parents=True, exist_ok=True)

# 1. 데이터 불러오기
df = pd.read_csv("backend/backend/data/processed_customer_data.csv", encoding='utf-8-sig')

# 2. 학습에 사용할 feature만 선택 (✅ 핵심 수정)
X = df[["age", "watch_time", "days_since_login"]]  # 정확히 3개만
y = df["churned"]

# 3. 정규화 (훈련용 기준)
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# 4. 데이터 분할
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# 5. 모델 학습 (✅ RandomForest로 변경)
model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X_train, y_train)

# 6. 평가
y_pred = model.predict(X_val)
print("🔍 검증 정확도:", accuracy_score(y_val, y_pred))
print(classification_report(y_val, y_pred))

# 7. 모델 및 스케일러 저장
joblib.dump(model, "backend/model/model.pkl")
joblib.dump(scaler, "backend/model/scaler.pkl")
print("✅ 모델 저장 완료 → backend/model/model.pkl")
print("✅ 스케일러 저장 완료 → backend/model/scaler.pkl")
