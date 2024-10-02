import requests,sys

def login(username, password, xsrf, session, captcha, csrf):
    # 登入
	url = "https://sso.ncnu.edu.tw/login"
	headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Content-Length": "100",
    "Content-Type": "application/x-www-form-urlencoded",
	"Cookie" : "_ga=GA1.1.913465576.1713145300; username=109213059; fullname=%e7%8e%8b%e5%86%a0%e6%ac%8a; role=s; email=-329317733@ncnu.edu.tw; loginTime=2024%2f07%2f23+15%3a00%3a00; phone=049-2910960; units=; staffType=; _Mid=FxgWbrC11X; _gid=ca4e7df1-10f4-4aaf-9319-d919cc155f28; authorizedUnits=; _ga_1906M3445N=GS1.1.1722066423.1.1.1722066453.0.0.0; _ga_LZWP3HY7R4=GS1.1.1727625796.22.1.1727625801.0.0.0; XSRF-TOKEN=" + xsrf + "; national_chi_nan_university_session=" + session, 
    "Host": "sso.ncnu.edu.tw",
    "Origin": "https://sso.ncnu.edu.tw",
    "Referer": "https://sso.ncnu.edu.tw/login",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
	}
	payload = {'_token': csrf, 'uid' : username, 'password' : password, 'captcha' : captcha}

	response = requests.post(url, data=payload, headers=headers)
	if 'navbarDropdown' in response.text :
		name = response.text.split('<a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>')[1]
		name = name.split(' ')[1]
		return name
	else :
		return "login failed"

username = sys.argv[1] 
password = sys.argv[2]
xsrf = sys.argv[3]
session = sys.argv[4]
captcha = sys.argv[5]
csrf = sys.argv[6]

print(login(username, password, xsrf, session, captcha, csrf))
