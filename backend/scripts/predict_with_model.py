# backend/scripts/predict_with_model.py

from datetime import datetime
import pandas as pd
import joblib
from pathlib import Path
from collections import Counter
import json
import matplotlib.pyplot as plt  

BASE_DIR = Path(__file__).resolve().parent.parent

def predict_churn(file_path: str, threshold: float = 0.5, versioned: bool = False):
    df = pd.read_csv(file_path)
    df['last_login'] = pd.to_datetime(df['last_login'])
    df['days_since_login'] = (pd.Timestamp.today() - df['last_login']).dt.days

    identity_df = df[['name', 'email', 'age', 'preferred_category']].copy()
    X = df[['age', 'watch_time', 'days_since_login']]

    scaler = joblib.load(BASE_DIR / "model/scaler.pkl")
    model = joblib.load(BASE_DIR / "model/model.pkl")

    X_scaled = scaler.transform(X)
    probs = model.predict_proba(X_scaled)[:, 1]

    print("📌 예측 확률 상위 10개:", probs[:10])
    print("📌 예측 확률 최소~최대:", probs.min(), "~", probs.max())
    print("📌 받은 threshold:", threshold)

    result_df = identity_df.copy()
    result_df['churn_probability'] = probs
    result_df['is_high_risk'] = result_df['churn_probability'] > threshold

    result_df.reset_index(drop=True, inplace=True)
    df.reset_index(drop=True, inplace=True)
    df["is_high_risk"] = result_df["is_high_risk"]

    print("📌 확률 상위 5명:\n", result_df.sort_values(by="churn_probability", ascending=False).head())
    print("📌 is_high_risk True 개수:", result_df['is_high_risk'].sum())

    churn_group = result_df[result_df["is_high_risk"]]
    non_churn_group = result_df[~result_df["is_high_risk"]]

    high_risk_df = df[df["is_high_risk"]].copy()
    high_risk_df["churn_probability"] = result_df.loc[high_risk_df.index, "churn_probability"].values
    high_risk_df = high_risk_df[[
        "name", "age", "last_login", "watch_time", "preferred_category", "email", "churn_probability"
    ]]
    high_risk_df["last_login"] = pd.to_datetime(high_risk_df["last_login"]).dt.strftime("%Y-%m-%d")
    high_risk_df["watch_time"] = pd.to_numeric(high_risk_df["watch_time"], errors="coerce").fillna(0).astype(int)
    high_risk_df["watch_time"] = high_risk_df["watch_time"].astype(str) + "시간"

    latest_path = BASE_DIR / "high_risk_customers.xlsx"
    high_risk_df.to_excel(latest_path, index=False)

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

    stats_path = BASE_DIR.parent / "public" / "stats.json"
    stats_path.write_text(json.dumps(stats, ensure_ascii=False, indent=2))

    top_5 = result_df.sort_values(by="churn_probability", ascending=False).head()
    top_5.to_json(BASE_DIR / "top_5_customers.json", orient="records", force_ascii=False, indent=2)

    if versioned:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        versioned_filename = f"result_{timestamp}.xlsx"
        results_dir = BASE_DIR / "results"
        results_dir.mkdir(parents=True, exist_ok=True)
        versioned_path = results_dir / versioned_filename
        high_risk_df.to_excel(versioned_path, index=False)

        log_entry = {
            "csv_file": Path(file_path).name,
            "timestamp": timestamp,
            "threshold": threshold,
            "total_customers": stats["total_customers"],
            "expected_churns": stats["expected_churns"],
            "churn_rate": round(stats["expected_churns"] / stats["total_customers"], 3) if stats["total_customers"] > 0 else 0,
            "result_file": versioned_filename
        }

        logs_path = results_dir / "logs.json"
        try:
            if logs_path.exists() and logs_path.stat().st_size > 0:
                logs = json.loads(logs_path.read_text(encoding="utf-8"))
            else:
                logs = []
        except json.JSONDecodeError:
            print("⚠️ logs.json 깨짐 -> 새로 초기화")
            logs = []

        logs.append(log_entry)
        logs_path.write_text(json.dumps(logs, ensure_ascii=False, indent=2))

        print(f"✅ versioned 사본 저장: {versioned_filename}")
        print("✅ logs.json 기록 완료")

    print(f"✅ 최신본 저장: {latest_path.name}")
    print("✅ stats.json 저장 완료")
    print("✅ top_5_customers.json 저장 완료")

    return result_df, churn_group, stats


"""
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

    # 8. email 리스트 저장
    email = result_df.sort_values(by="churn_probability", ascending=False).head()
    email.to_json("top_5_customers.json", orient="records", force_ascii=False, indent=2)

    # 8. stats.json 저장 (ReactTest-main/public)
    stats_path = BASE_DIR.parent / "public/stats.json"
    stats_path.parent.mkdir(parents=True, exist_ok=True)
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print("✅ 예측 완료: 결과 stats 생성 및 엑셀 저장됨")
    return result_df, churn_group, stats
"""

# import pandas as pd
# import joblib
# from pathlib import Path
# from collections import Counter
# import json
# import matplotlib.pyplot as plt

# # 현재 파일 위치를 기준으로 backend 디렉토리 기준 경로 확보
# BASE_DIR = Path(__file__).resolve().parent.parent  # backend/


# def predict_churn(file_path: str, threshold: float = 0.5):
#     # 1. 데이터 로드
#     df = pd.read_csv(file_path)
#     df['last_login'] = pd.to_datetime(df['last_login'])
#     df['days_since_login'] = (pd.Timestamp.today() - df['last_login']).dt.days

#     # 신원 정보 백업
#     identity_df = df[['name', 'email', 'age', 'preferred_category']].copy()

#     # 2. 머신러닝 입력용 컬럼 선택
#     X = df[['age', 'watch_time', 'days_since_login']]  # 훈련에 사용한 feature만

#     # 3. 정규화 및 예측
#     scaler = joblib.load(BASE_DIR/"model/scaler.pkl")
#     model = joblib.load(BASE_DIR/"model/model.pkl")
#     X_scaled = scaler.transform(X)
#     probs = model.predict_proba(X_scaled)[:, 1]


#     print("📌 예측 확률 상위 10개:", probs[:10])
#     print("📌 예측 확률 최소~최대:", probs.min(), "~", probs.max())


#     # 4. 결과 결합
#     result_df = identity_df.copy()
#     result_df['churn_probability'] = probs
#     print("📌 받은 threshold:", threshold)
#     result_df['is_high_risk'] = result_df['churn_probability'] > threshold
#     # 🔥 반드시 필요! 이후 df.loc[...]에서 올바르게 동작하게 하기 위해
#     result_df.reset_index(drop=True, inplace=True)
#     df.reset_index(drop=True, inplace=True)
#     df["is_high_risk"] = result_df["is_high_risk"]

#     # 🔥 디버그 출력
#     print("📌 확률 상위 5명:\n", result_df.sort_values(by="churn_probability", ascending=False).head())
#     print("📌 is_high_risk True 개수:", result_df['is_high_risk'].sum())

#     # 5. 그룹별 분리
#     churn_group = result_df[result_df["is_high_risk"] == True]
#     non_churn_group = result_df[result_df["is_high_risk"] == False]

#     # 6. 엑셀로 저장 (지표 순서대로 정리)
#     # 6. 엑셀로 저장 (지표 순서대로 정리)
#     high_risk_mask = result_df["is_high_risk"]
#     excel_df = df[high_risk_mask].copy()
#     excel_df["churn_probability"] = result_df[high_risk_mask]["churn_probability"].values
#     excel_df = excel_df[["name", "age", "last_login", "watch_time", "preferred_category", "email", "churn_probability"]]



#     # ✅ 포맷 변경
#     excel_df["last_login"] = pd.to_datetime(excel_df["last_login"]).dt.strftime("%Y-%m-%d")
#     excel_df["watch_time"] = pd.to_numeric(excel_df["watch_time"], errors="coerce").fillna(0).astype(int)
#     excel_df["watch_time"] = excel_df["watch_time"].astype(str) + "시간"

#     # ✅ 저장
#     excel_path = BASE_DIR / "high_risk_customers.xlsx"
#     excel_df.to_excel(excel_path, index=False)

#     # 7. 통계 데이터 생성
#     stats = {
#         "total_customers": len(result_df),
#         "expected_churns": int(result_df["is_high_risk"].sum()),

#         "average_age": {
#             "churn": round(churn_group["age"].mean(), 2) if not churn_group.empty else 0,
#             "non_churn": round(non_churn_group["age"].mean(), 2) if not non_churn_group.empty else 0,
#         },
#         "average_watch_time": {
#             "churn": round(df.loc[result_df["is_high_risk"], "watch_time"].mean(), 2) if not churn_group.empty else 0,
#             "non_churn": round(df.loc[~result_df["is_high_risk"], "watch_time"].mean(), 2) if not non_churn_group.empty else 0,
#         },
#         "average_days_since_login": {
#             "churn": round(df.loc[result_df["is_high_risk"], "days_since_login"].mean(), 2) if not churn_group.empty else 0,
#             "non_churn": round(df.loc[~result_df["is_high_risk"], "days_since_login"].mean(), 2) if not non_churn_group.empty else 0,
#         },
#         "genre_distribution": dict(Counter(result_df["preferred_category"]))
#     }

#     # 8. stats.json 저장 (ReactTest-main/public)
#     stats_path = BASE_DIR.parent / "public/stats.json"
#     stats_path.parent.mkdir(parents=True, exist_ok=True)
#     with open(stats_path, "w", encoding="utf-8") as f:
#         json.dump(stats, f, ensure_ascii=False, indent=2)

#     print("✅ 예측 완료: 결과 stats 생성 및 엑셀 저장됨")
#     return result_df, churn_group, stats

