module.exports = (mongoose) =>{
    const User = new mongoose.model(
        "User",
        new mongoose.Schema({
            oauthId : {type: String},
            displayName : {type: String},
            firstName: {type: String},
            lastName: {type: String},
            email: {type: String},
            profileImageUrl: {type: String},
        }, 
    {
        timestamps: true
    })
    );

    return User;
}