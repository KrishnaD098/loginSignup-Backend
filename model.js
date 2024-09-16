const { Schema,model} = require("mongoose");

const userSchema = new Schema(
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true,
        index: true
      },
      password: {
        type: String,
        required: true
      },
      otp: {
        type: Number
      },
      otpExpiry: {
        type: Date
      }
    },
    {
      timestamps: true
    }
  );
const User = model("User",userSchema);

module.exports = User;