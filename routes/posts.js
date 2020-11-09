const express = require('express');
const router = express.Router();
// could use one line instead: const router = require('express').Router();
const client = require("../db");
const postList = require("../views/postList");
const postDetails = require("../views/postDetails");
const baseQuery = "SELECT posts.*, users.name, counting.upvotes FROM posts INNER JOIN users ON users.id = posts.userId LEFT JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) AS counting ON posts.id = counting.postId\n";
const addPost = require("../views/addPost");

router.get("/", async (req, res, next) => {
  try {
    const data = await client.query(baseQuery);
    res.send(postList(data.rows));
  } catch (error) { next(error) }
});

router.get("/posts/:id", async (req, res, next) => {
  try {
    const data = await client.query(baseQuery + "WHERE posts.id = $1", [req.params.id]);
    const post = data.rows[0];
    res.send(postDetails(post));
  } catch (error) { next(error) }
});

router.get("/add", (req, res) => {
  console.log(req.jason);
  res.send(addPost());
});

router.post("/", async (req, res) => {
  try {  
  const name = req.body.name;
  const title = req.body.title;
  const content = req.body.content;
    const SQL = `
    INSERT INTO posts (userId, title, content) VALUES ((SELECT id from users where name='${name}'), '${title}', '${content}');
    `;
    await client.query(SQL);
    res.redirect(`/posts`); // Redirect to the post details page
  } catch (err){
    throw(err);
  }
})



module.exports = router;