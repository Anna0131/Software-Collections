# 軟體庫/作品集 系統
##### 系統網址：https://sw-registry.im.ncnu.edu.tw/login/sso

## Background
1. 爬蟲 NCNU SSO 網站 的 captcha, csrf-token，實現第三方登入
2. 方便同學欲部署系統時，不需和計算機中心申請VM，僅需輸入容器 image registry 及資源規格，系統便會在管理員同意後，自動部署容器到 Docker Swarm，可增加資源使用率
3. 提供網頁介面供同學監控和管理容器
4. 管理者在此平台提出需求，請別人開發系統


## 系統使用說明
### 登入
- 使用在 NCNU Moodle 可以登入的帳號密碼
- 黑名單：在 10 分鐘內登入失敗超過 3 次，ip 會被列入黑名單

  
### 申請放置軟體
1. 可以選擇要不要為系統申請部屬 Container
2. 設定 Container 規格
    - External Port
        - 使用對外開放的 public ip 的一個隨機 port 和 container 內部服務開啟的 port 做 matching
        - 單個 container 以 1 個對外的 port 為限制
        - 格式：`{internal_port}`
    - Domain
        - 將指定的 domain reverse proxy 到 external ip:port
        - 單個 container 以 1 個 domain 為限制
        - 格式：`{domain}`.im.ncnu.edu.tw
    - https + Reverse Proxy
        - 利用 Reverse Proxy 將 public ip 的 443 port proxy 到上方申請的隨機的 External Port，並申請 SSL certificate
    - Memory
        - 為了避免 Memory 不足而造成 Out Of Memory Exception，導致正常的 process 被 OS kill，故須使用 <a href="#資源限制">硬限制</a> 限制每個 container 的 Memory 的最大使用量
        - 格式：`N` MB（代表 Mem 和 Swap 各別都可以使用 `N` MB）
    - CPU
        - 為了讓所有 process 可以正常執行和結束，故須使用 <a href="#資源限制">硬限制</a> 限制每個 container 的 CPU 的最大使用量
        - 格式：`N` 顆
    - Storage
        - 避免 host 的 disk space 不足，故使用 <a href="#資源限制">軟限制</a> 限制每個 container 的 disk 的最大使用量
        - 格式：`N` GB
    - 環境變數
        - 容器內部的環境變數
        - <a href="https://docs.docker.com/compose/environment-variables/set-environment-variables">教學</a>
        - 範例設定
            ```=
            account=123
            pwd=456
            ```
    - Volumes
        - <a href="https://docs.docker.com/storage/volumes/">教學</a>
        - 範例設定
            ```=
            /var/lib/mysql
            /var/lib/test
            ```
    - Network
        - 目前 Docker Container 預設使用相同的網路，所以 Container 間可以用 Container Name 作為 Domain name 相互存取
    - GPU
        - 目前硬體不支援
3. 若管理員同意申請，系統會自動寄信告知
    - 若有申請 Domain 或 SSL，則管理員會另行通知是否完成

### 提出需求
- 可以提供需求，讓有意願的同學幫忙開發和部屬
- 有興趣完成需求的同學，自行和需求建立者聯絡
- 目前 1 credit 代表 1 TWD，由系辦負責付錢給同學

### 管理者審核軟體申請
- 可以透過兩種方式審核
1. Email 信件中的 button
    - 這種方式要求你在系統的 token 是還沒過期且有足夠權限的
3. 系統介面：`/audit`

### Feature
1. 查看 Container Info : log, resource usage
    - ![image](https://hackmd.io/_uploads/ry9T3fA50.png)

## 範例
### Wordpress 網站
1. 建立 Database Container
    1.1 填寫申請表
    - ![image](https://hackmd.io/_uploads/By6nRR_qC.png)
    - ![image](https://hackmd.io/_uploads/HJmvyq6q0.png)
    - ![image](https://hackmd.io/_uploads/Sk_O19a5A.png)
    
    1.2 等待管理員審核通過
    - ![image](https://hackmd.io/_uploads/BysnekK9A.png)
    
    1.3 管理員審核 成功/失敗 皆會寄信告知
    - ![image](https://hackmd.io/_uploads/rk9mZJF9A.png)
3. 建立 Wordpress Container
    2.1 填寫申請表
    - ![image](https://hackmd.io/_uploads/HJpHcytcR.png)
    - ![image](https://hackmd.io/_uploads/HJnT0AP2R.png)
    - ![image](https://hackmd.io/_uploads/SyQIu56qR.png)

    
    2.2 等待管理員審核通過
    - ![image](https://hackmd.io/_uploads/rkYGNlFcC.png)

    2.3 管理員審核 成功/失敗 皆會寄信告知
    - ![image](https://hackmd.io/_uploads/rJUH4gF90.png)
3. 存取 Wordpress site 申請的 public port，並設定 Wordpress
    - ![image](https://hackmd.io/_uploads/HynK3JY9R.png)
    - ![image](https://hackmd.io/_uploads/SJo23kFc0.png)
    - ![image](https://hackmd.io/_uploads/HkgCnytcC.png)
    - ![image](https://hackmd.io/_uploads/By21TktcR.png)

### 自己的系統
1. 基於自己的系統寫 <a href="https://docs.docker.com/reference/dockerfile/">Dockerfile</a>
2. 使用 Dockerfile <a href="https://docs.docker.com/build/">build</a> image 
3. <a href="https://docs.docker.com/reference/cli/docker/image/push/">push</a> image to <a href="https://hub.docker.com/">Docker Hub</a>
    - 確保你的 image 是 public（如果必須是 private 請再寄信通知管理員）
4. 填寫申請表
    - ![image](https://hackmd.io/_uploads/BkvioGCcR.png)
    - ![image](https://hackmd.io/_uploads/B1w2jG0cR.png)
    - ![image](https://hackmd.io/_uploads/HkBTozC5R.png)
5. 等待管理員審核通過


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
  

