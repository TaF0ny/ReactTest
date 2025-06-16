# backend/scripts/train_model.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import MinMaxScaler
import joblib
from pathlib import Path

MODEL_DIR = Path("backend/model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def retrain_model(csv_path: Path):
    """
    ✅ 궁극 Robust: 컬럼 normalize + 파생 컬럼 강제 덮어쓰기
    """
    print(f"📌 재학습 시작: {csv_path}")

    df = pd.read_csv(csv_path)

    # ✅ 모든 컬럼 소문자 + 언더스코어로 통일
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # ✅ payment_status → payment
    if "payment_status" in df.columns and "payment" not in df.columns:
        df = df.rename(columns={"payment_status": "payment"})

    # ✅ churned target 생성
    if "payment" in df.columns and "churned" not in df.columns:
        df["churned"] = df["payment"].map({"paid": 0, "unpaid": 1})

    # ✅ 항상 last_login 기준으로 days_since_login 덮어쓰기
    if "last_login" in df.columns:
        df["last_login"] = pd.to_datetime(df["last_login"], errors="coerce")
        df["days_since_login"] = (pd.Timestamp.today() - df["last_login"]).dt.days
    else:
        raise ValueError("❌ 'last_login' 컬럼이 없음! 전처리 불가!")

    print("✅ 파생 컬럼 완성! 현재 컬럼:", df.columns.tolist())

    X = df[["age", "watch_time", "days_since_login"]]
    y = df["churned"]

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_val, y_train, y_val = train_test_split(
        X_scaled, y, test_size=0.2, stratify=y, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_val)
    print("🔍 검증 정확도:", accuracy_score(y_val, y_pred))
    print(classification_report(y_val, y_pred))

    joblib.dump(model, MODEL_DIR / "model.pkl")
    joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
    print("✅ 모델 & 스케일러 저장 완료: backend/model/")
  
"""
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
"""
