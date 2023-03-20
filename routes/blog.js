const express = require("express");

const db = require("../data/database.js");

const router = express.Router();

router.get("/", function(req, res) {
  res.redirect("/posts") // localhost:3000/posts로 이동
});

router.get("/posts", async function(req, res) {
  // 가독성
  const query = `
    SELECT posts.*, authors.name AS author_name FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
  `;
  // 구조분해 할당
  const [posts] = await db.query(query);

  res.render("posts-list", { posts: posts }); // posts-list.ejs
});

router.post("/posts", async function(req, res) {
  // query("SQL문법")
  // ?: placeholder
  // mysql2 패키지에서 지원하는 문법
  const datas = [req.body.title, req.body.summary, req.body.content, req.body.author ];
  // db.query("INSERT INTO posts (title, summary, body, author_id) VALUES (?, ?, ?, ?)", [datas[0], datas[1], datas[2], datas[3]]);
  await db.query("INSERT INTO posts (title, summary, body, author_id) VALUES (?)", [datas]);

  res.redirect("/posts");
})

router.get("/posts/:id", async function(req, res) {
  const query = `
    SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    res.status(404).render("404"); // 404.ejs
    return;
  }

  const postData = {
    // spread 연산자
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  res.render("post-detail", { post: postData }); // post-detail.ejs
})

router.get("/posts/:id/edit", async function(req, res) {
  const query = `
    SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    res.status(404).render("404"); // 404.ejs
    return;
  }

  res.render("update-post", { post: posts[0]})
});

router.post("/posts/:id/edit", async function(req, res) {
  const query = `
    UPDATE posts SET title = ?, summary = ?, body = ?
    WHERE id = ?
  `;
  await db.query(query, [req.body.title, req.body.summary, req.body.content, req.params.id]);

  res.redirect("/posts");
});

router.get("/new-post", async function(req, res) {
  // query("SQL문법")
  // async-await
  // result[0]: 데이터베이스에서 가져온 데이터 배열
  // result[1]: 메타데이터 배열
  // const result = await db.query("SELECT * FROM authors");
  // 구조분해 할당
  // authors = result[0]
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { // create-post.ejs
    authors: authors, // ejs 파일에 authors 전달
  });
});

router.post("/posts/:id/delete", async function(req, res) {
  await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
  res.redirect("/posts");
});

module.exports = router;