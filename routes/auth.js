const express = require("express");
// const User = require("../models/user");
const router = new express.Router();
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const User = require("../models/user");
const ExpressError = require("../expressError");
const db = require("../db");
const jwt = require("jsonwebtoken");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    try{
        const users = User.all()
        return res.json(users);
    } catch (e) {
        return next(e)
    }

});

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await User.authenticate(username, password);
    if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
          let token = jwt.sign({ username }, SECRET_KEY);
          User.updateLoginTimestamp(username);
          return res.json({ token });
        }
      }
      throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
      return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
  try {
    
    let {username} = await User.register(req.body);
    let token = jwt.sign({username}, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({token});
  }

  catch (err) {
    return next(err);
  }
});
module.exports = router;
