module.exports = (mongoose) => {
  const Recipe = mongoose.model(
    'Recipe',
    new mongoose.Schema(
      {
        creatorId: { type: mongoose.Schema.Types.ObjectId, required: true ,ref: "User"},
        title: { type: String, required: true },
        description: { type: String },
        ingredients: { type: [{name: { type: String, required: true },quantity: { type: String, required: true }}], default: [] },
        instructions: { type: [String], default: [] },
        prepTimeMinutes: { type: Number },
        cookTimeMinutes: { type: Number },
        servings: { type: Number },
        isPublic: { type: Boolean, default: false },
        tags: { type: [String], default: [] }
},
      { timestamps: true }
    )
  );

  return Recipe;
};
