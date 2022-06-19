const mongoose = require("mongoose");
const validator = require("validator");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "user must have a name!"]
    },
    email: {
        type: String,
        required: [true, 'please provide an email address'],
        // unique: true,
        lowerCase: true,
        validate: [validator.isEmail, "please provide a valid email"]

    },
    message: {
        type: String,
        required: [true, "please drop a message"],
        minLength: [8, "must have at least 8 characters"],
        maxLength: [250, "must not be more than 250 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    from: {
        type: String,
        default: "zedxog.com"
    }
});

userSchema.pre("/^find/", function (next) {
    this.find({ __v: { select: false } })
    next();
})
const User = model("User", userSchema);
module.exports = User;