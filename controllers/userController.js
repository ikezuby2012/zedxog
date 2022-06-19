const User = require(`../models/userModel`);
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require("../utils/Email");

exports.getAllUsers = catchAsync( async (req, res, next) => {
    const features = new ApiFeatures(User.find(), req.query).filter()
        .sort().limitFields().paginate();

    const users = await features.query;

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    })
});

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    console.log(newUser);
    
    // send mail
    // await new Email(newUser).sendMessage();
    
    res.status(201).json({
        status: "success",
        data: newUser
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new AppError("no user found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    });
});

exports.updateUser = catchAsync( async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidator: true
    });

    res.status(201).json({
        status: "success",
        data: {
            user
        }
    });
})

exports.deleteUser = catchAsync (async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: "success",
        data: null
    });
})