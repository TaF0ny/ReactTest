import pandas as pd
import joblib
from pathlib import Path
from collections import Counter
import json
import matplotlib.pyplot as plt

# 현재 파일 위치를 기준으로 backend 디렉토리 기준 경로 확보
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/


def predict_churn(file_path: str, threshold: float = 0.5):
    # 1. 데이터 로드
    df = pd.read_csv(file_path)
    df['last_login'] = pd.to_datetime(df['last_login'])
    df['days_since_login'] = (pd.Timestamp.today() - df['last_login']).dt.days

    # 신원 정보 백업
    identity_df = df[['name', 'email', 'age', 'preferred_category']].copy()

    # 2. 머신러닝 입력용 컬럼 선택
    X = df[['age', 'watch_time', 'days_since_login']]  # 훈련에 사용한 feature만

    # 3. 정규화 및 예측
    scaler = joblib.load(BASE_DIR/"model/scaler.pkl")
    model = joblib.load(BASE_DIR/"model/model.pkl")
    X_scaled = scaler.transform(X)
    probs = model.predict_proba(X_scaled)[:, 1]


    print("📌 예측 확률 상위 10개:", probs[:10])
    print("📌 예측 확률 최소~최대:", probs.min(), "~", probs.max())


    # 4. 결과 결합
    result_df = identity_df.copy()
    result_df['churn_probability'] = probs
    print("📌 받은 threshold:", threshold)
    result_df['is_high_risk'] = result_df['churn_probability'] > threshold
    # 🔥 반드시 필요! 이후 df.loc[...]에서 올바르게 동작하게 하기 위해
    result_df.reset_index(drop=True, inplace=True)
    df.reset_index(drop=True, inplace=True)
    df["is_high_risk"] = result_df["is_high_risk"]

    # 🔥 디버그 출력
    print("📌 확률 상위 5명:\n", result_df.sort_values(by="churn_probability", ascending=False).head())
    print("📌 is_high_risk True 개수:", result_df['is_high_risk'].sum())

    # 5. 그룹별 분리
    churn_group = result_df[result_df["is_high_risk"] == True]
    non_churn_group = result_df[result_df["is_high_risk"] == False]

    # 6. 엑셀로 저장 (지표 순서대로 정리)
    # 6. 엑셀로 저장 (지표 순서대로 정리)
    high_risk_mask = result_df["is_high_risk"]
    excel_df = df[high_risk_mask].copy()
    excel_df["churn_probability"] = result_df[high_risk_mask]["churn_probability"].values
    excel_df = excel_df[["name", "age", "last_login", "watch_time", "preferred_category", "email", "churn_probability"]]



    # ✅ 포맷 변경
    excel_df["last_login"] = pd.to_datetime(excel_df["last_login"]).dt.strftime("%Y-%m-%d")
    excel_df["watch_time"] = pd.to_numeric(excel_df["watch_time"], errors="coerce").fillna(0).astype(int)
    excel_df["watch_time"] = excel_df["watch_time"].astype(str) + "시간"

    # ✅ 저장
    excel_path = BASE_DIR / "high_risk_customers.xlsx"
    excel_df.to_excel(excel_path, index=False)

    # 7. 통계 데이터 생성
    stats = {
        "total_customers": len(result_df),
        "expected_churns": int(result_df["is_high_risk"].sum()),

        "average_age": {
            "churn": round(churn_group["age"].mean(), 2) if not churn_group.empty else 0,
            "non_churn": round(non_churn_group["age"].mean(), 2) if not non_churn_group.empty else 0,
        },
        "average_watch_time": {
            "churn": round(df.loc[result_df["is_high_risk"], "watch_time"].mean(), 2) if not churn_group.empty else 0,
            "non_churn": round(df.loc[~result_df["is_high_risk"], "watch_time"].mean(), 2) if not non_churn_group.empty else 0,
        },
        "average_days_since_login": {
            "churn": round(df.loc[result_df["is_high_risk"], "days_since_login"].mean(), 2) if not churn_group.empty else 0,
            "non_churn": round(df.loc[~result_df["is_high_risk"], "days_since_login"].mean(), 2) if not non_churn_group.empty else 0,
        },
        "genre_distribution": dict(Counter(result_df["preferred_category"]))
    }

    # 8. stats.json 저장 (ReactTest-main/public)
    stats_path = BASE_DIR.parent / "public/stats.json"
    stats_path.parent.mkdir(parents=True, exist_ok=True)
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print("✅ 예측 완료: 결과 stats 생성 및 엑셀 저장됨")
    return result_df, churn_group, stats

