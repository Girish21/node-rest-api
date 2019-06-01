const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { validationResult } = require("express-validator/check");

const Post = require("../model/post");
const User = require("../model/user");

const postPerPage = +process.env.POST_PER_PAGE;

exports.getPosts = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    const count = await Post.find().countDocuments();
    if (!count) {
      const error = new Error("Could not retrieve the Posts");
      error.statusCode = 404;
      throw error;
    }
    const posts = await Post.find()
      .skip((page - 1) * postPerPage)
      .limit(postPerPage)
      .populate("creator");

    return res.status(200).json({
      posts: posts,
      totalItems: count
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const err = validationResult(req);

  if (!err.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.file.path;
  imageUrl = imageUrl.replace(/\\/g, "/");
  const userId = req.userId;
  let creator;

  const post = new Post({
    title: title,
    content: content,
    creator: userId,
    imageUrl: imageUrl
  });
  try {
    await post.save();

    const user = await User.findById(userId);

    creator = user;
    user.posts.push(post);

    await user.save();

    post.creator = creator.name;

    return res.status(201).json({
      message: "Post created",
      post: post,
      creator: {
        _id: creator._id,
        name: creator.name
      }
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const result = await Post.findById(postId);
    if (!result) {
      const error = new Error("Could not retrieve the Post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post: result });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.editPost = async (req, res, next) => {
  const postId = req.params.postId;

  const err = validationResult(req);

  if (!err.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image;

  let result;

  if (req.file) {
    imageUrl = req.file.path;
    imageUrl = imageUrl.replace(/\\/g, "/");
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not retrieve the Post");
      error.statusCode = 404;
      throw error;
    }
    if (req.userId == post.creator.toString()) {
      if (imageUrl !== post.imageUrl) deleteImage(post.imageUrl);
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      result = await post.save();
    } else {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({ message: "Post Updated", post: result });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not retrieve the Post");
      error.statusCode = 404;
      throw error;
    }
    if (req.userId == post.creator.toString()) {
      deleteImage(post.imageUrl);
      await Post.deleteOne({ _id: postId });
    } else {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Could not retrieve User");
      error.statusCode = 403;
      throw error;
    }
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({
      message: "Post deleted"
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const deleteImage = filepath => {
  filePath = path.join(__dirname, "..", filepath);
  fs.unlink(filePath, err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  });
};
