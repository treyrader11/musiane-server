const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Please provide name"],
         minlength: 2,
         maxlength: 20,
      },
      email: {
         type: String,
         required: [true, "Please provide email"],
         match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
         ],
         unique: true,
      },
      profileImage: {
         type: String,
         default: "",
      },
      password: {
         type: String,
         required: [true, "Please provide password"],
         minlength: 6,
      },
      location: {
         type: String,
         maxlength: 20,
      },
      role: {
         type: String,
         required: true,
         default: "student"
       },
      userAgent: {
         type: Array,
         // required: true,
         default: []
      },
      about: {
         type: String,
         maxlength: 20,
         default: "About",
      },
      isVerified: {
         type: Boolean,
         default: false
      },
   },
   { timestamps: true }
);

UserSchema.pre("save", async function () {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
   return jwt.sign(
      { id: this._id, name: this.name, profileImage: this.profileImage, role: this.role, isVerified: this.isVerified },
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.JWT_LIFETIME,
      }
   );
};

UserSchema.methods.comparePassword = async function (pw) {
   const isCorrect = await bcrypt.compare(pw, this.password);
   return isCorrect;
};

// UserSchema.methods.createJWT = function () {
//    const payload = {
//       id: this._id,
//       name: this.name,
//       profileImage: this.profileImage,
//       role: this.role,
//       isVerified: this.isVerified
//    };

//    const signingOptions = {
//       expiresIn: process.env.JWT_LIFETIME
//    };

//    return jwt.sign(payload, process.env.JWT_SECRET, signingOptions);
// };

// UserSchema.methods.comparePassword = async function (pw) {
//    const isCorrect = await bcrypt.compare(pw, this.password);
//    return isCorrect;
// };
module.exports = mongoose.model("User", UserSchema);
