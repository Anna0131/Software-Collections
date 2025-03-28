# 軟體庫/作品集 系統
##### 系統網址：https://sw-registry.im.ncnu.edu.tw/login/sso
##### 系統文件說明：https://hackmd.io/QscYPE9jRGe5qd3W6Hn5rQ?view

## Features
- 爬蟲 NCNU SSO 網站 的 captcha, csrf-token，實現第三方登入
- 方便同學欲部署系統時，不需和計算機中心申請VM，僅需輸入容器 image registry 及資源規格，系統便會在管理員同意後，自動部署容器到 Docker Swarm，可增加資源使用率
- 提供網頁介面供同學監控和管理容器
- 系辦或教授可以在此平台提出需求，請同學開發系統

## System Screenshots
- 藉由爬蟲 NCNU SSO 的 captcha, csrf-token，實現第三方登入。使用者輸入容器規格，系統自動部署於 Docker Swarm。
  - <img width="156" alt="image" src="https://github.com/user-attachments/assets/42cdd41f-f8c4-41fa-9cdd-fc36001c2496"><img width="246" alt="image" src="https://github.com/user-attachments/assets/d3f65925-c66d-46f7-9c08-2a966c069c7f">

- 提供網頁介面讓使用者監控或對容器操作
  - <img width="408" alt="image" src="https://github.com/user-attachments/assets/4c047a1e-ba78-42e1-abca-1efee9d75b12">

-	可於系統瀏覽系上已架設的系統
    -	<img width="407" alt="image" src="https://github.com/user-attachments/assets/12d080f0-1d7a-48ce-a9ac-e55d2f79863f">



## Workflow
- 學生登入：學生可使用學號和密碼登入系統。
- 填寫申請表：登入後可填寫需求和提交作品集。
- 系統說明與 Docker 資訊：申請表附有系統使用說明和 Docker 相關資訊。
- 審核流程：申請表會提交給系主任進行審核。
- 自動處理：審核通過後自動拉取 Docker 映像檔。
- 回信 URL：申請者將收到包含作品集存取 URL 的電子郵件。
- 展示作品集：系統將展示所有學生的作品集。


## Installation & Configuration
### Develop Env
- `vi utilities/utilities.js`
```=
const system_url = <your-url>;
const system_ip = <your-ip>;
```
### Usage
- `npm install pm2 -g`
- `pm2 start npm --name "software_collections" -- start`
  

## User Guide
### 學生使用者
訪問系統 URL。
使用您的學號和密碼登入。
填寫申請表，並提交您的作品集。

### 系主任
接收並審核來自學生的申請表。
根據審核結果，系統將自動處理相關操作。

## ER model
![image](https://github.com/krixi0131/Software-Collections/assets/101371329/1b36f3e4-3349-40c7-94ce-727af6673f6f)

