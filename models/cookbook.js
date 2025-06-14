module.exports = (mongoose) => {
  const Cookbook = mongoose.model(
    'Cookbook',
    new mongoose.Schema(
      {
        ownerId: {type : mongoose.Schema.Types.ObjectId, ref: "User"},
        name: {type : String},
        description: {type : String},
        recipeIds: [{type : mongoose.Schema.Types.ObjectId, ref: "Recipe"}],
      },
      { timestamps: true }
    )
  );

  return Cookbook;
};
