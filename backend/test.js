let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node_mysql_test'
});
connection.connect();

let sql = 'select * from customers where name = "twshen"';
connection.query(sql, (err, data) => {
    if(err) throw err;
    console.log(JSON.parse(JSON.stringify(data)));
});
connection.end();