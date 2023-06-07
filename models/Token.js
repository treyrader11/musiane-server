const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
          },
        vToken: { //verification token
            type: String,
            default: ""
        },
        resetToken: { //reset token
            type: String,
            default: ""
        },
        loginToken: { //login token
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }
  );

module.exports = mongoose.model("Token", TokenSchema);