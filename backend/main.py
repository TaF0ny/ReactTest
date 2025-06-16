from fastapi import FastAPI, UploadFile, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import pandas as pd
from pathlib import Path
import shutil
import json
from scripts.predict_with_model import predict_churn
from scripts.predict_with_model import BASE_DIR
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import openai


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

# GMAIL SMTP 계정 정보
GMAIL_USER="joker082800@gmail.com"
GMAIL_APP_PASSWORD="lkpb xecz tpib gxuu"


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


# 7. email 발송
@app.post("/send-email/")
async def send_email():
  file_path = Path(__file__).resolve().parent / "top_5_customers.json"

  with open(file_path, "r", encoding="utf-8") as f:
      email = json.load(f)

  openai.api_key = "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"
  email_list = [person["email"] for person in email]
  server = smtplib.SMTP('smtp.gmail.com', 587)
  server.starttls()
  server.login(GMAIL_USER, GMAIL_APP_PASSWORD)

  idx = 0
  for to in email_list:
      msg = MIMEMultipart()
      msg['From'] = GMAIL_USER
      msg['To'] = to
      msg['Subject'] = "맞춤형 추천이 도착했어요"

      prompt = f"""
      `안녕하세요. {email[idx]["name"]}고객님!
      오랜만이네요. 넷플릭스에 오래 접속하지 않아 걱정이 되네요. 최근까지 (35 ~ 50 랜덤값 입력)일이 지났더라구요. 제가 추천해드릴만한 {email[idx]["preferred_category"]} 콘텐츠 소개해드릴게요.

      1. '(추천 {email[idx]["preferred_category"]} 컨텐츠 이름)' - (추천 {email[idx]["preferred_category"]} 컨텐츠 1줄 작품 설명)
      2. '(추천 {email[idx]["preferred_category"]} 컨텐츠 이름)' - (추천 {email[idx]["preferred_category"]} 컨텐츠 1줄 작품 설명)
      3. '(추천 {email[idx]["preferred_category"]} 컨텐츠 이름)' - (추천 {email[idx]["preferred_category"]} 컨텐츠 1줄 작품 설명)

      넷플릭스의 새로운 콘텐츠들을 확인하고 다시 저희 서비스를 이용해보시면 좋을 것 같아요. {email[idx]["name"]} 고객님을 다시 만날 수 있기를 기대하며, 여기를 클릭하시면 넷플릭스로 바로 이동하실 수 있습니다. [넷플릭스 바로가기](https://www.nefilix.com/). 돌아와 주셔서 감사합니다!
      `

      위 양식에 맞게 메일 내용을 작성하는데 추천 컨텐츠 부분과 일자 랜덤입력을 채워서 전달해줘"""

      response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
          {"role": "system", "content": "고객 맞춤 메시지를 생성하세요."},
          {"role": "user", "content": prompt}
        ]
      )
      message = response["choices"][0]["message"]["content"]

      msg.attach(MIMEText(message, 'plain'))

      server.send_message(msg)
      print(f"✅ 이메일 전송 완료: {to}")

      idx += 1

  server.quit()
  return {"message": "Email sent successfully"}
