exports.getPosts = (req, res, next) => {
  return res.status(200).json({ message: "Hello" });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  return res.status(201).json({
    message: "Post created",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content
    }
  });
};
