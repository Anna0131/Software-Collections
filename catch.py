import requests
from bs4 import BeautifulSoup
import re

def login(username, password):
    url = 'https://moodle.ncnu.edu.tw/login/index.php'
    session = requests.Session()
    response = session.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    token = soup.find('input', {'name': 'logintoken'})['value']
    data = {
        'username': username,
        'password': password,
        'logintoken': token
    }
    response = session.post(url, data=data)
    soup = BeautifulSoup(response.text, 'html.parser')
    if soup.find('div', {'class': 'alert alert-danger'}):
        return '登入失敗'
    return '登入成功'

username = input('請輸入帳號: ')
password = input('請輸入密碼: ')
print(login(username, password))

