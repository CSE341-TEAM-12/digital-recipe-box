module.exports = (mongoose) => {
    const Review = mongoose.model(
        "Review", new mongoose.Schema({
            reviewerId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
            recipeId: {type: mongoose.Schema.Types.ObjectId, ref: "Recipe"},
            rating: {type: Number},
            comment: {type: String},
        },
    {
        timestamps: true
    }),
    );

    return Review;
};