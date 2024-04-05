import requests
from bs4 import BeautifulSoup
import re,sys

def login(username, password):
    # 登入
    url = 'https://moodle.ncnu.edu.tw/login/index.php'
    session = requests.Session()
    response = session.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    # 取得登入 token
    token = soup.find('input', {'name': 'logintoken'})['value']
    data = {
        'username': username,
        'password': password,
        'logintoken': token
    }
    response = session.post(url, data=data)
    # 檢查是否登入成功
    soup = BeautifulSoup(response.text, 'html.parser')
    if soup.find('div', {'class': 'alert alert-danger'}):
        return 'login failed'
    return 'login success'


# 讓 util.py可以帶入username, password等參數，
username = sys.argv[1] # 取得帳號
password = sys.argv[2]

#執行login函數
print(login(username, password))


