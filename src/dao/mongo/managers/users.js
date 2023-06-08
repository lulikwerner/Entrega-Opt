import userModel from "../models/user.js";

export default class UsersManager {
  getUsers = (params) => {
    return userModel.findOne(params).lean();
  };

  updateUser = (email, newHashedPassword) => {
    return userModel.updateOne(email, {
      $set: { password: newHashedPassword },
    });
  };
}
