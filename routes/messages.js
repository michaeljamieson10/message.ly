const express = require("express");
const Message = require("../models/message");
const {ensureCorrectUser, ensureLoggedIn} = require("../middleware/auth");
const router = new express.Router();
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id",ensureLoggedIn,
 async function (req, res, next) {
    try {
      const { id } = req.params;
      const message = await Message.get(id)
      let username = req.user.username;
    if (message.to_user.username !== username && message.from_user.username !== username) {
        throw new ExpressError("Cannot read this message", 401);
    }
      if(message.length == 0){
        throw new ExpressError("message does not exist", 400);
      }
      return res.json(message)
    } catch (e) {
      return next(e)
    }
  });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const { from_username,to_username, body } = req.body;
      const message = await Message.create({from_username, to_username, body})
        
      return res.json(message)
    } catch (e) {
      return next(e)
    }
  });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
// idk how to make this one work
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    try {
    //   const { from_username,to_username, body } = req.body;
    let username = req.user.username;
    let msg = await Message.get(req.params.id);
    if (msg.to_user.username !== username) {
        throw new ExpressError("Cannot set this message to read", 401);
    }
    const message = await Message.markRead(req.params.id)
        
      return res.json(message)
    } catch (e) {
      return next(e)
    }
  });



module.exports = router;