// 데이터베이스 연결

const mysql = require("mysql2/promise");

// createConnection(); 메소드는 단일 데이터베이스 연결
// createPool(options); 메소드는 다수 데이터베이스 연결 
const pool = mysql.createPool({
  host: "localhost", // 데이터베이스 서버 주소
  database: "blog", // 데이터베이스 이름
  user: "root", // 데이터베이스 유저
  password: "mysql",
});

module.exports = pool;