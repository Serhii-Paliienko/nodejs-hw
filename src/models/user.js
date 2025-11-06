import { Schema, model } from 'mongoose';
import { emailRegexp } from '../constants/tags.js';

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: emailRegexp,
      trim: true,
    },
    password: { type: String, required: true, trim: true, minlength: 8 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.pre('save', function (next) {
  if (!this.username) this.username = this.email;
  next();
});

const User = model('user', userSchema);

export default User;
