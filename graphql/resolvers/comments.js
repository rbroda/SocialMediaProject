const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      //  Validate user auth
      const { username } = checkAuth(context);
      //  Make sure body of comment is not empty
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }
      //  Find particular post by id
      const post = await Post.findById(postId);
      //  Make sure post exists
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      //  Validate user auth
      const { username } = checkAuth(context);
      //  Find particular post by id
      const post = await Post.findById(postId);
      //  Make sure post exists
      if (post) {
        //  Find the index of the post
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        //  If the post username matches the user's username, delete the comment from the post
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
          //  Otherwise do not allow a user to delete another user's comments
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
