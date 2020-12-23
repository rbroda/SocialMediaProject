const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    getPosts: async () => {
      try {
        //  Find all posts and sort in chronological order
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    getPost: async (_, { postId }) => {
      try {
        //  Find a post by id
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createPost: async (_, { body }, context) => {
      //  Validate user auth
      const user = checkAuth(context);
      //  Make sure post body is not empty
      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }
      //  Create a new post
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      //  Save new post
      const post = await newPost.save();
      //  Publish new post to subscriptions
      context.pubsub.publish("NEW_POST", { newPost: post });

      return post;
    },
    deletePost: async (_, { postId }, context) => {
      //  Validate user auth
      const user = checkAuth(context);

      try {
        //  Find a post by id
        const post = await Post.findById(postId);
        //  Make sure the post belongs to the user trying to delete it
        if (user.username === post.username) {
          //  If true, delete it
          await post.delete();
          return "Post deleted successfully";
        } else {
          //  Else throw an error
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likePost: async (_, { postId }, context) => {
      //  Validate user auth
      const { username } = checkAuth(context);
      //  Find a post by id
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          //  Post already liked...unlike
          post.likes = post.likes.filter((like) => like.username !== username);
          await post.save();
        } else {
          //  Not liked...like
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        //  Save post
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
