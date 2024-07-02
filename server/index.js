const express = require('express');
const app = express();

//collecting all the routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
//configs
const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const PORT = process.env.PORT;

database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());



app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running....",
    });
});

app.listen(PORT, () => {
    console.log(`Successfully connected at port ${PORT}`);
});