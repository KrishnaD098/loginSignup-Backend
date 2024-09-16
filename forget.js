const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("./model");

async function forgetPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ msg: "User does not exist" });
        }

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Save OTP and expiry in the user object
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP to user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use 'service' instead of 'services'
            auth: {
                user: 'dairymilkop1011@gmail.com',
                pass: 'duzp efnb lofb kczi'
            },
        });

        const mailOptions = {
            from: 'dairymilkop1011@gmail.com',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Failed to send OTP email:", err);
                return res.json({ msg: "Failed to send OTP" });
            } else {
                console.log("OTP email sent:", info.response);
                return res.json({ msg: 'OTP sent to email' });
            }
        });
        
    } catch (error) {
        console.error("Error in forget password:", error);
        return res.json({ msg: "Error in forget password", error: error.message });
    }
}

async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ msg: "User does not exist" });
        }

        // Ensure OTP comparison handles data type
        if (user.otp.toString() !== otp || user.otpExpiry < Date.now()) {
            return res.json({ msg: "Invalid or Expired OTP" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined; // Clear OTP after successful reset
        user.otpExpiry = undefined;
        await user.save();

        return res.json({ msg: "Password reset successful" });
    } catch (error) {
        console.error("Error in reset password:", error);
        return res.json({ msg: "Error in reset password", error: error.message });
    }
}

module.exports = { forgetPassword, resetPassword };
