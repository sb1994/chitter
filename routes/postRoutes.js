const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const passport = require("passport");

module.exports = (io) => {
  // Get all posts
  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  // Create a new post
  // POST a new post
  router.post(
    "/create",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      // console.log(req);
      const { content, feedId } = req.body;
      // console.log(text);

      // const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content field is required." });
      }

      if (!content) {
        return res.status(400).json({ message: "Content field is required." });
      }

      try {
        const newPost = new Post({
          user: req.user.id,
          content,
          feedId,
        });

        const savedPost = await newPost.save();
        res.json(savedPost);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );

  router.get(
    "/:postId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const post = await Post.findById(req.params.postId)
          .populate("user", ["email", "profile_pic"])
          .populate("feedId", ["email", "profile_pic"])
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: ["email", "firstName", "lastName", "profile_pic"],
            },
          })
          .populate({
            path: "likes",
            populate: { path: "user", select: ["email", "profile_pic"] },
          });

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );

  // DELETE a single post by ID
  router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const post = await Post.findById(req.params.id);

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the author of the post
        if (post.user.toString() !== req.user.id) {
          return res
            .status(401)
            .json({ message: "User not authorized to delete this post" });
        }

        await post.remove();
        // await Comment.deleteMany({ post: post._id });

        res.json({ message: "Post and associated comments deleted" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );
  router.post(
    "/:postId/comment/create",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      let { postId } = req.params;
      let { comment } = req.body;
      let { user } = req;
      // console.log(text);

      let newComment = {
        post: postId,
        comment,
        user: user._id,
      };
      // res.json("hello");
      Post.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: newComment } },
        { new: true, upsert: true }
      )
        .then((post) => {
          console.log(post);
          Post.find()
            .sort({ created: -1 })
            .populate("user")
            .populate({
              path: "comments",
              populate: {
                path: "user",
                select: ["email", "firstName", "lastName", "profile_pic"],
              },
            })
            .then((posts) => {
              // console.log(posts);
              res.json(posts);
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log();
        });
    }
  );

  router.delete(
    "/post/:postId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        // Find the post in the database by ID
        const post = await Post.findById(req.params.postId);

        // Check if the post exists
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user is the creator of the post
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ error: "User not authorized" });
        }

        // Delete the post from the database
        await post.remove();

        // Return a success message
        return res.json({ message: "Post deleted successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
      }
    }
  );

  return router;
};
