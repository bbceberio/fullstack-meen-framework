var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    slugid = require('slugid'),
    saltRounds = 10;

var userSchema = mongoose.Schema({
    local: {
        email: {
            type: String,
            lowercase: true,
            unique: true
        },
        username: {
            type: String,
            unique: true
        },
        password: String,
        token: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});
userSchema.methods.generateToken = function () {
    return slugid.decode(slugid.v4());
};
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, saltRounds);
};
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('User', userSchema);