import mongoose, { Schema } from 'mongoose';
export var Role;
(function (Role) {
    Role["reader"] = "user";
    Role["editor"] = "sawing";
    Role["tester"] = "door";
    Role["admin"] = "watcher";
})(Role || (Role = {}));
const userSchema = new Schema({
    username: { type: String },
    user_id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    role: { type: String, enum: Role },
    date_created: { type: Date },
});
const UserModel = mongoose.model('User', userSchema);
export default UserModel;
