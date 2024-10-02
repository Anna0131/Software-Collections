// Required modules
const router = require('express').Router();
const util = require("./../utilities/utilities.js");
const puppeteer = require('puppeteer');

//設定一個 HTTP GET 請求的路由處理 -> 前往根 URL（ '/'）會被觸發
router.get('/', async function(req, res) {
    try {
        res.sendFile(util.getParentPath(__dirname) + '/templates/login.html');  //回應靜態文件
    }
    catch(e) {
        console.error(e);
	res.status(500).sned("Internal Server Error");
    }
});

const login_page_html = `<style>
        div {
            border-radius: 8px;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            color: #333;
        }

        input[type="text"]:focus, input[type="password"]:focus {
            border-color: #3498db;
            outline: none;
        }

        body {
            background-color: #f7f7f7;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
		.spinner {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 100%;
            width: 1px;
            height: 1000px;
            animation: spin 1s linear infinite;
            margin-top: 3%;
        display: none;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        button {
            transition: background-color 0.3s;
            width: 10%;
            padding: 10px;
            background-color: #3498db;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #2980b9;
        }

        .notranslate {
            display: none;
        }
    </style>
    <head>
        <title>
            登入頁面
        </title>
    	<div class="spinner"></div>
        <h1>
            NCNU IM 軟體庫
        </h1>
    </head>
		`

router.get('/sso', async function(req, res) {
	try {
    	const url = "https://sso.ncnu.edu.tw/login";
		// crawl the ncnu sso
    	const browser = await puppeteer.launch({
    		args: ['--no-sandbox'],
    		timeout: 10000,
  		});
    	const page = await browser.newPage();
    	const response = await page.goto(url);
		// keep only the captcha image display on screen
		// Evaluate JavaScript
  		await page.evaluate(() => {
			b = document.getElementById('app')
			b.style.display='none'
			a = document.getElementsByClassName('captcha')
			c = document.createElement('div')
			c.appendChild(a[0])
			d  = document.getElementsByTagName('body')
			d[0].appendChild(c)
			a[0].childNodes[0].style.height='100%';
			a[0].childNodes[0].style.width='100%';
  		});
		// get screeenshot of browser
    	const screenshot = await page.screenshot({ encoding: 'base64' }); // 使用 base64 格式傳遞
		// extract csrf from html source code
		const source = await response.text();
		const csrf = source.split("csrf-token")[1].split('content="')[1].split('"')[0];
		// extract session and xsrf from cookies
		const cookies = await page.cookies();
		const session = JSON.parse(JSON.stringify(Object.values(cookies)[0])).value;
		const xsrf = JSON.parse(JSON.stringify(Object.values(cookies)[1])).value;
    	await browser.close();
		// response a html with above infos
    	res.send(`${login_page_html}<div><label>請使用 <a href='https://sso.ncnu.edu.tw'>NCNU SSO</a> 帳號登入</label><br/>帳號：<input id='account'/><br/>密碼：<input type='password' id='password'/><br/>驗證碼：<input id='captcha'/><br/></div><img style='width:10%' src="data:image/png;base64,${screenshot}"/><br/><div style='display:none'><div id='csrf'>${csrf}</div><div id='xsrf'>${xsrf}</div><div id = 'session'>${session}</div></div><button onclick='submitLogin()'>送出</button><script src = "/js/sso_login.js"></script><script src = 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.27.2/axios.min.js'></script>`); // 回傳圖片
	}
	catch(e) {
		console.error(e);
		res.status(500).json({msg : "Internal Server Error"});
	}
});

module.exports = router;
