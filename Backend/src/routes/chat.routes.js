const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.post("/start", chatController.startChat);
router.post("/:sessionId/message", chatController.sendMessage);

module.exports = router;
