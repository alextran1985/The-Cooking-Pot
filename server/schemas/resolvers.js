const { User, Recipe } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    getCurrent: async (parent, args, context) => {
      const user = await User.findOne({ email: args.email });
      const token = "";
      return {
        token,
        user,
      };
    },
    getUserRecipes: async (_, args, { token, user }) => {
      const recipes = await Recipe.find({ creator: user._id });
      return recipes;
    },
  },
  Mutation: {
    createUser: async (
      parent,
      { email, password, confirmPassword, termsAccepted }
    ) => {
      if (!termsAccepted) {
        throw new Error("You must accept the terms of conditions.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const createdUser = await User.create({ email, password });
      const token = signToken(createdUser);
      return { token, user: createdUser };
    },
    login: async (_, { email, password }) => {
      const foundUser = await User.findOne({ email });
      if (!foundUser) {
        throw AuthenticationError;
      }
      const correctPw = await foundUser.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error("User not found");
      }

      const token = signToken(foundUser);
      return { token, user: foundUser };
    },
    createRecipe: async (_, { recipeData }, { token, user }) => {
      if (user) {
        const recipe = await Recipe.create({
          ...recipeData,
          creator: user._id,
        });
        const populatedRecipe = await recipe.populate("creator", "email");
        return populatedRecipe;
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;
