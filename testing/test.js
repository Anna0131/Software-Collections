// supertest 可以讓專案不用另外跑起來也可以測試 api，它會幫你跑
const request = require('supertest')
const app = require('../index')
const expect = require('chai').expect;
    
// dedscribe 為一個測試區塊，通常裡面會有多個 it，代表實際要測試的更小的測試區塊
describe('test API : Login', () => {
  it('should respond test good', (done) => {
    request(app)
      .post('/api/login')
      .send({account : "test", password : "123"})
      .end((err, res) => {
        const text = res.text;
	console.log(text)
        // chai 的語法，讓我們比較好描述要測試的東西
	const failed_login_msg = `{"suc":false,"authen_result":"login failed"}`;
        expect(text).to.not.be.equal(failed_login_msg);
        done();
      })
  })
})
