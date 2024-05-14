const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const appRouter = require("./routes");

connectDB()


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use("/", appRouter);

app.use('/', (req, res) => {
    return res.json({
        message: 'JBS Admin',
    });
});

// app.use('/api/users', errorHandler);


module.exports = app;