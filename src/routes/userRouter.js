const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();
userRouter.use(userAuth);

userRouter.get("/user/requests/received", async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "skills",
      "age",
      "gender",
    ]);

    res.status(200).send({
      message: "All connection requests!",
      requests: connectionRequest,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching requests", ERROR: error.message });
  }
});

userRouter.get("/user/connections", async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "about",
        "skills",
        "age",
        "gender",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "about",
        "skills",
        "age",
        "gender",
      ]);

    const data = connectionRequest.map((el) => {
      if (el.fromUserId._id.toString() === loggedInUser._id) {
        return el.toUserId;
      }
      return el.fromUserId;
    });

    res.status(200).send({
      message: "All connection list!",
      myConnections: data,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error connections list", ERROR: error.message });
  }
});

userRouter.get("/user/feed", async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUserFromFeed = new Set();

    connectionRequest.forEach((el) => {
      if (el.fromUserId) hideUserFromFeed.add(el.fromUserId.toString());
      if (el.toUserId) hideUserFromFeed.add(el.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(["firstName", "lastName", "photoUrl", "about", "skills", "age", "gender"])
      .skip(skip)
      .limit(limit);

    res.status(200).send({ message: "All users fetched successfully!", users });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching users", ERROR: error.message });
  }
});

module.exports = userRouter;
