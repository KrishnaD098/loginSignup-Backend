const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const port = 8000;
const User = require("./model");
const app = express();

const { forgetPassword, resetPassword } = require("./forget");


app.use(express.json());

const connectDB  = async () => {
    try{
        const connectionInstance = await mongoose.connect(
            `mongodb+srv://dhootkrishna123:Ayush233054@cluster0.jocr4.mongodb.net/login-signup?retryWrites=true&w=majority&appName=Cluster0`    
        );
        console.log('DATABASE CONNECTED!! DBHOST: ${connectionInstance.connection.host}')
    }catch(err){
        console.log("Connection Failed",err);
        process.exit(1);
    }
}

app.listen(port, () =>{
    console.log(`App is running ${port}`);
    connectDB();
})

app.get("/",(req,res) => {
    res.json(
        {
            msg:"App is working"
        }
    )
});


app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email is already in use
        const flag = await User.findOne({ email });
        if (flag) {
            return res.json({
                msg: "Email already in use",
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const createdUser = await User.findById(user._id).select("-password");

        res.json({
            msg: "User created",
            createdUser
        });

    } catch (error) {
        console.error("Error signing up:", error);
        return res.json({
            msg: "Error signing up",
            error: error.message
        });
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                msg: "User does not exist",
            });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                msg: "Invalid password",
            });
        }

        // If login is successful
        res.json({
            msg: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error("Error Logging in:", error);
        return res.json({
            msg: "Error logging in",
            error: error.message
        });
    }
});

app.post("/forget-password", forgetPassword);
app.post("/reset-password", resetPassword);

