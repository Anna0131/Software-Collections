# 軟體庫-作品集 系統
#### 系統文件說明：https://hackmd.io/QscYPE9jRGe5qd3W6Hn5rQ?view

## 系統功能
學生登入：學生可使用學號和密碼登入系統。

填寫申請表：登入後可填寫需求和提交作品集。

系統說明與 Docker 資訊：申請表附有系統使用說明和 Docker 相關資訊。

審核流程：申請表會提交給系主任進行審核。

自動處理：審核通過後自動拉取 Docker 映像檔。

回信 URL：申請者將收到包含作品集存取 URL 的電子郵件。

展示作品集：系統將展示所有學生的作品集。

安裝與設定:

## Usagw
- `npm install pm2 -g`
- `pm2 start npm --name "software_collections" -- start`

## 使用說明
### 學生使用者
訪問系統 URL。
使用您的學號和密碼登入。
填寫申請表，並提交您的作品集。
### 系主任
接收並審核來自學生的申請表。
根據審核結果，系統將自動處理相關操作。


## ER model
![image](https://github.com/krixi0131/Software-Collections/assets/101371329/1b36f3e4-3349-40c7-94ce-727af6673f6f)
