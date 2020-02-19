//引入mysql
const mysql = require('mysql');
const http = require('http'),
    url = require('url'),
    qs = require('querystring');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node_mysql_test'
});
//开始连接
connection.connect();
//用http模块创建服务
http.createServer((req, res) => {
    //设置允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    //接收post方式请求
    if(req.method === 'POST') {
        let pathName = req.url;
        //接收的参数
        let params = '';
        req.on('data', (chunk) => {
            params += chunk;
        });
        req.on('end', () => {
            params = qs.parse(params);
            console.log(`POST请求接收到的参数:${JSON.stringify(params)}`);
            switch(pathName) {
                case '/sendMessage':
                    console.log('提交留言信息');
                    break;
                case '/login':
                    //登录验证
                    let {username, password} = params;
                    if(!username || !password) {
                        res.end(JSON.stringify({
                            code: 0,
                            msg: '用户名和密码不能为空!'
                        }));
                    }else {
                        let sql = 'SELECT * FROM USER WHERE USER_NAME = ? AND USER_PASSWORD = ?',
                            sqlParams = [username, password];
                        connection.query(sql, sqlParams, (err, data) => {
                            if(err) throw err;
                            let result = JSON.parse(JSON.stringify(data));
                            if(!result.length) {
                                res.end(JSON.stringify({
                                    code: 0,
                                    msg: '用户名或密码不存在！'
                                }));
                            } else{
                                res.end(JSON.stringify({
                                    code: 1,
                                    msg: '登录成功！'
                                }));
                            }
                        })
                    }
                    break;
                case '/register':
                    //注册
                    let username1 = params.username,
                        password1 = params.password;
                        now = getNow();
                    if(!username1 || !password1) {
                        res.end(JSON.stringify({
                            code: 0,
                            msg: '用户名或密码不能为空!'
                        }));
                    }else {
                        let querySql = 'SELECT * FROM USER';
                        connection.query(querySql, (err, data) => {
                            if(err) throw err;
                            //node mysql查询数据会带RowDataPacket  使用JSON序列化可以去除
                            let result = JSON.parse(JSON.stringify(data));
                            //判断用户名是否重复
                            let flag = false;
                            result.length && result.forEach((item) => {
                                if(item.user_name == username1) {
                                    flag = true;
                                }
                            });
                            if(flag) {
                                res.end(JSON.stringify({
                                    code: 0,
                                    msg: '用户名已存在!'
                                }));
                            }else {
                                //注册
                                let addSql = 'INSERT INTO USER (USER_NAME, USER_PASSWORD, TIME) VALUES (?, ?, ?)';
                                let addParams = [username1, password1, now];
                                connection.query(addSql, addParams, (err, data) => {
                                    if(err) throw err;
                                    res.write(JSON.stringify({
                                        code: 1,
                                        msg: '注册成功!'
                                    }));
                                    res.end();
                                });
                            }
                        });
                    }
                    break;
            }
        })
    }else if(req.method === 'GET') {
        //get请求方式
        let pathName = url.parse(req.url).pathname;
        if(pathName === '/getMessage') {
            console.log('获取留言信息');
        }else if(pathName === '/') {
            //首页
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf-8'
            });
            res.write('<h1 style="text-align:center;color: red;">Welcome to my HomePage!</h1>');
            res.end();
        }
    }
}).listen(3000);
//获取当前时间
function getNow() {
    var date = new Date();
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();
    if(month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if(day >=0 && day <= 9) {
        day = '0' + day;
    }
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}