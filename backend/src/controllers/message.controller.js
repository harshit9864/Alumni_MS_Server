import asyncHandler from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const handleMessages = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.auth();
    // const myUserId = req.user._id.toString();
    const user = await User.findOne({clerkId:userId});
    const { peerUserId } = req.params;
    const actualId = user._id.toString();
    console.log(peerUserId);

    const conversationId = [actualId, peerUserId].sort().join("_");

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName ")
      .populate("receiver", "fullName ");
      console.log(messages);

    res
      .status(200)
      .json(new Apiresponse(201, messages, "messages found successfully"));
  } catch (err) {
    throw new ApiError(500, "messages not founded ");
  }
});

export { handleMessages };
