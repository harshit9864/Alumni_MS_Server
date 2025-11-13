import { clerkClient } from "@clerk/express";
import { Alumni } from "../models/alumni.model.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Mentorship } from "../models/mentorship.model.js";

const saveAndFetch = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  let user = await Alumni.findOne({ clerkId: userId });
  if (!user) {
    user = await Alumni.create({
      clerkId: userId,
      email: sessionClaims.emailAddress,
    });
  }
  res.status(200).json(new Apiresponse(201, user, "user created"));
});

const postBlog = asyncHandler(async (req, res) => {
  const { title, authorName, date, image, summary, content } = req.body;
  const { userId } = req.auth();
  if (
    [title, authorName, date, summary, content].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // const userId = 123;

  const blog = await Blog.create({
    title,
    authorId: userId,
    authorName: authorName.toUpperCase(),
    date: new Date(date),
    image: image?.url,
    summary,
    content,
  });

  if (!blog) {
    throw new ApiError(400, "some error occured");
  }

  res.status(200).json(new Apiresponse(201, blog, "blog posted succesfully"));
});

const fetchBlogs = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  // const user = await clerkClient.users.getUser(userId);
  console.log(sessionClaims.emailAddress);

  const blogs = await Blog.find({
    authorId: userId,
  });

  res.status(200).json(new Apiresponse(201, blogs, "success"));
});

const joinEvent = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  console.log("req.auth:", req.auth);

  const { userId } = req.auth();
  try {
    const alumni = await Alumni.findOneAndUpdate(
      { clerkId: userId },
      { $addToSet: { eventsJoined: _id } }, // $addToSet prevents duplicates
      { new: true }
    );
    if (!alumni) {
      throw new Error(alumni);
    }
    res
      .status(200)
      .json(new Apiresponse(201, alumni, "event joined succesfullly"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error);
  }
});

const fetchMentorships = asyncHandler(async (req, res) => {
  const { userId } = req.auth();

  const alumni = await Alumni.findOne({ clerkId: userId });
  const email = alumni.email;
  const mentorships = await Mentorship.aggregate([
    // 1️⃣ Match mentorships with given alumni email
    {
      $match: { alumniMail: email },
    },

    // 2️⃣ Lookup student details from Student collection
    {
      $lookup: {
        from: "students", // collection name in MongoDB
        localField: "studentName", // field in Mentorship
        foreignField: "_id", // field in Student
        as: "studentInfo", // output field
      },
    },

    // 3️⃣ Unwind the array (each mentorship has exactly one student)
    {
      $unwind: "$studentInfo",
    },

    // 4️⃣ Project only the fields we need
    {
      $project: {
        _id: 1,
        purpose: 1,
        date: 1,
        status: 1,
        createdAt: 1,
        "studentInfo.fullName": 1,
        "studentInfo.email": 1,
      },
    },

    // 5️⃣ Optional: Sort (latest first)
    {
      $sort: { createdAt: -1 },
    },
  ]);
  console.log(mentorships);

  res
    .status(200)
    .json(
      new Apiresponse(201, mentorships, "Mentorships successfully fetched")
    );
});

const updateStatus = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const { id } = req.params;
  const { status } = req.body;

  // Update mentorship
  const updatedMentorship = await Mentorship.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  const alumni = await Alumni.findOneAndUpdate(
    {
      clerkId: userId,
    },
    { $push: { mentorship: id } },
    { new: true }
  );

  res
    .status(200)
    .json(new Apiresponse(201, updatedMentorship, "updated Successfully"));
});

export {
  saveAndFetch,
  postBlog,
  fetchBlogs,
  joinEvent,
  fetchMentorships,
  updateStatus,
};
