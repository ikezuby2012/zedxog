const mongoose = require("mongoose");
const dotenv = require('dotenv');

process.on("uncaughtException", err => {
    console.log("uncaught exception ... shutting down");
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({path: "./config.env"});
const app = require ("./app");

if (process.env.NODE_ENV === "production"){
    mongoose.createConnection(process.env.DATABASE_ATLAS, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true
    }).then(() => {
        console.log(`Atlas database connected successfully`);
    })
}
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}).then(() => {
    console.log(`Local Database connected successfully`);
});



//server setup
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`now listening to ${PORT}`);
});

process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});