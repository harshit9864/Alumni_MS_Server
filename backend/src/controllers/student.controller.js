import mongoose from "mongoose";
import { Alumni } from "../models/alumni.model.js";
import { Mentorship } from "../models/mentorship.model.js";
import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";

const addstudent = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  if (!userId) {
    throw new ApiError(401, "user not authenticated");
  }
  const { fullName, passoutYear, email, interests, college } = req.body;

  const student = await Student.create({
    fullName,
    clerkId: userId,
    passoutYear,
    interests,
    email,
    organisationName: college,
  });

  const user = await User.findOne({ userId });
  if (!user) {
    const newUser = await User.create({
      clerkId: userId,
      fullName,
      email,
      role: "student", // student or alumni
    });

    await Student.findOneAndUpdate(
      { email },
      { userId: newUser._id },
      { new: true }
    );
  }

  res
    .status(200)
    .json(new Apiresponse(201, student, "student added succesfully"));
});

const addMentorship = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  if (!userId) {
    throw new ApiError(401, "user not authenticated");
  }
  const { email, purpose } = req.body;
  const alumni = await Alumni.findOne({ email });
  const student = await Student.findOne({ clerkId: userId });
  if (!alumni) {
    throw new ApiError(401, "Alumni has not registered yet");
  }
  const find = await Mentorship.findOne({
    studentName: student._id,
    alumniMail: alumni.email,
  });
  console.log(find);
  if (find) {
    throw new ApiError(401, "connection with this alumni already exist");
  }
  const doc = await Mentorship.create({
    studentName: student._id,
    alumniMail: alumni.email,
    date: new Date(),
    purpose,
  });

  res
    .status(200)
    .json(new Apiresponse(201, doc, "mentorship request sent succesfully"));
});

const fetchMentorships = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  // console.log(userId);
  if (!userId) {
    throw new ApiError(401, "not authenticated");
  }
  const student = await Student.findOne({
    clerkId: userId,
  });
  const studentId = student._id;

  // Ensure it's a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(401, "Not valid student id");
  }

  // Aggregation pipeline
  const mentorships = await Mentorship.aggregate([
    // 1️⃣ Match mentorships of logged-in student
    {
      $match: {
        studentName: new mongoose.Types.ObjectId(studentId),
      },
    },

    // 2️⃣ Lookup alumni profile info (alumnidirs)
    {
      $lookup: {
        from: "alumnidirs", // ✅ public alumni info
        localField: "alumniMail",
        foreignField: "email",
        as: "alumniProfile",
      },
    },

    {
      $unwind: {
        path: "$alumniProfile",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 3️⃣ Lookup alumni auth/user mapping (alumnis)
    {
      $lookup: {
        from: "alumnis", // ✅ auth-linked alumni
        localField: "alumniMail",
        foreignField: "email",
        as: "alumniAuth",
      },
    },

    {
      $unwind: {
        path: "$alumniAuth",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4️⃣ Lookup student info (optional)
    {
      $lookup: {
        from: "students",
        localField: "studentName",
        foreignField: "_id",
        as: "studentInfo",
      },
    },

    {
      $unwind: "$studentInfo",
    },

    // 5️⃣ Final projection (🔥 includes alumniUserId)
    {
      $project: {
        purpose: 1,
        date: 1,
        status: 1,

        // ✅ THIS is what your chat needs
        alumniUserId: "$alumniAuth.userId",

        // display info
        alumniInfo: {
          fullName: "$alumniProfile.fullName",
          email: "$alumniProfile.email",
        },

        studentInfo: {
          name: "$studentInfo.name",
          email: "$studentInfo.email",
        },
      },
    },
  ]);
  // console.log(mentorships);

  res
    .status(200)
    .json(
      new Apiresponse(201, mentorships, "Mentorships fetched successfully")
    );
});

const fetchBlogs = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const student = await Student.findOne({ clerkId: userId });
  const { organisationName } = student;
  console.log(student);
  const blogs = await Blog.find({ college: organisationName });
  console.log(blogs);
  res.status(201).json(new Apiresponse(201, blogs, "fetched"));
});

export { addstudent, addMentorship, fetchMentorships, fetchBlogs };
