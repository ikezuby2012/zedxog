const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const xss = require("xss-clean");

const app = express();

const userRoute = require("./routes/userRoute");

const AppError = require("./utils/appError");
//cors
app.use(cors());
//<-- body parser parsing data to the backend
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "10kb"}));
//data sanitisation against xss attacks
app.use(xss());

if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use("/api/v4/user", userRoute);

//UNSPECIFIED ROUTE 
app.all("*", (req, res,next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

const handleCastErrorDB = err => {
    const message = `invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateErrorDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `duplicate field value ${value}. please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(el => el.message);
    const message = `invalid input data --${error.join('. ')}`;
    return new AppError(message, 400);
};

app.use((err, req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error"; 

    if (process.env.NODE_ENV === "development") {
        if (req.originalUrl.startsWith("/api")) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                error: err,
                stack: err.stack
            });
        }
    }
    
    if (process.env.NODE_ENV === "production"){
        let error = {...err};
        error.message = err.message;
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateErrorDB(error);
        if (error.name === "validationError") error = handleValidationErrorDB(error);

        if (req.originalUrl.startsWith("/api")) {
            if (err.isOperation) {
                return res.status(err.statusCode).json({
                    status: err.status,
                    message: err.message,
                });
            }
            //programming or unknown error
            console.error("ERROR", err);
            return res.status(500).json({
                status: "error",
                message: "something went very wrong"
            })
        }
    }
    //next();
});

module.exports = app;