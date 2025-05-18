from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import pandas as pd
from pathlib import Path
import shutil
import json
from scripts.predict_with_model import predict_churn
from scripts.predict_with_model import BASE_DIR

app = FastAPI()
# ✅ stats.json 초기화
stats_path = Path("public/stats.json")
stats_path.parent.mkdir(parents=True, exist_ok=True)
stats_path.write_text("{}", encoding="utf-8")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- 🔁 글로벌 변수로 파일 경로와 threshold 기억
uploaded_csv_path = None
stored_threshold = 0.5


# 1. CSV 업로드만
@app.post("/upload_csv")
async def upload_csv(file: UploadFile):
    global uploaded_csv_path
    file_path = Path("backend/data/uploaded.csv")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    uploaded_csv_path = file_path
    print("✅ CSV 업로드 완료:", file_path)
    return {"message": "CSV 업로드 완료"}


# 2. 임계치만 저장
@app.post("/set_threshold")
async def set_threshold(threshold: float = Form(...)):
    threshold_path = Path("backend/data/threshold.txt")
    threshold_path.parent.mkdir(parents=True, exist_ok=True)
    with open(threshold_path, "w") as f:
        f.write(str(threshold))

    print("✅ 임계값 저장:", threshold)
    return {"message": "임계값 저장됨", "threshold": threshold}



@app.get("/get_threshold")
def get_threshold():
    return {"threshold": stored_threshold}


# 3. 예측 실행
@app.get("/predict")
async def run_prediction():
    if uploaded_csv_path is None:
        return JSONResponse(content={"error": "CSV 파일이 업로드되지 않았습니다."}, status_code=400)

    # ✅ threshold.txt에서 임계값 읽기
    threshold_path = Path("backend/data/threshold.txt")
    if not threshold_path.exists():
        return JSONResponse(content={"error": "임계값(threshold)이 설정되지 않았습니다."}, status_code=400)

    with open(threshold_path, "r") as f:
        threshold = float(f.read().strip())

    print("📌 예측 실행 시 threshold:", threshold)

    # ✅ 예측 실행
    result_df, high_risk_df, stats = predict_churn(uploaded_csv_path, threshold)

    # ✅ stats.json 저장
    stats_path = Path("public/stats.json")
    stats_path.parent.mkdir(parents=True, exist_ok=True)
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print("📊 예측 완료:", stats)
    return {"stats": stats}



# 4. 시각화용 통계 불러오기
@app.get("/stats")
async def get_stats():
    stats_path = Path("public/stats.json")
    if not stats_path.exists():
        return JSONResponse(content={"error": "stats.json not found"}, status_code=404)
    
    with open(stats_path, "r", encoding="utf-8") as f:
        stats = json.load(f)

    return stats


# 5. 이탈 고객 전체 엑셀 다운로드
@app.get("/download")
def download_excel():
    file_path = BASE_DIR / "high_risk_customers.xlsx"  # ✅ 정확한 절대 경로 사용
    if not file_path.exists():
        return JSONResponse(content={"error": "Excel file not found"}, status_code=404)
    
    return FileResponse(
        path=file_path,
        filename="이탈고객_리스트.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# 6. 이탈 위험 고객 전체 데이터 (Top10은 프론트에서 slice)
@app.get("/high-risk-customers")
async def get_high_risk_customers():
    file_path = BASE_DIR / "high_risk_customers.xlsx"
    if not file_path.exists():
        return JSONResponse(content={"error": "No churn data yet"}, status_code=404)

    df = pd.read_excel(file_path)
    if 'churn_probability' in df.columns:
        df = df.sort_values(by="churn_probability", ascending=False)
    top_10 = df.head(10)
    return JSONResponse(content=json.loads(top_10.to_json(orient="records")))
