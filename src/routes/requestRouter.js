const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { sendTestEmail } = require("../services/sendMail");

const requestRouter = express.Router();
requestRouter.use(userAuth);

requestRouter.post("/request/send/:status/:toUserId", async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const status = req.params.status;
    const toUserId = req.params.toUserId;

    const allowedStatus = ["ignored", "interested"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid Status", allowedStatus });
    }

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).send("Connection Request Already Exists!");
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    if (status === "interested") {

    const fullMessage = `
    Hi ${toUser.firstName},
    
    You have received a new connection request on Code Swipe!
    
    Details:
    - Name: ${req.user.firstName} ${req.user.lastName || ""}
    - Email: ${req.user.emailId}
    - About : ${req.user.about}
    
    Log in now to view the request.
    
    Happy coding!
    – Code Swipe Team
    `;

    sendTestEmail(
      toUser.emailId,
      "New Request Notification!",
      fullMessage
    ).catch(console.error);
  }

    res.status(200).json({
      message: "Connection request as " + status + " for " + toUser.firstName,
      data,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error sending connection request",
      ERROR: error.message,
    });
  }
});

requestRouter.post("/request/review/:status/:requestId", async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid Status", allowedStatus });
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found!" });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.status(200).json({ message: "Connection request " + status, data });
  } catch (error) {
    res.status(500).send({
      message: "Error reviewing connection request",
      ERROR: error.message,
    });
  }
});

module.exports = requestRouter;
