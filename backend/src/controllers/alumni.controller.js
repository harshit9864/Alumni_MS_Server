import { Alumni } from "../models/alumni.model.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Mentorship } from "../models/mentorship.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.model.js";
import { AlumniDir } from "../models/alumniDir.model.js";
import { Event } from "../models/event.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const saveAndFetch = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  console.log(sessionClaims);
  let user = await Alumni.findOne({ clerkId: userId });
  const alumni = await AlumniDir.findOne({ email: sessionClaims.emailAddress });
  if (!alumni) {
    throw new ApiError(401, "alumni not added by admin");
  }
  console.log(alumni);
  const email = sessionClaims.emailAddress;

  if (!user) {
    user = await Alumni.create({
      clerkId: userId,
      email,
      college: alumni.college,
    });
  }

  const newUser = await User.findOne({ clerkId: userId });
  if (!newUser) {
    const newUser = await User.create({
      clerkId: userId,
      fullName: sessionClaims.emailAddress,
      email,
      role: "alumni", // student or alumni
    });

    await Alumni.findOneAndUpdate(
      { email },
      { userId: newUser._id },
      { new: true }
    );
  }

  res.status(200).json(new Apiresponse(201, user, "user created"));
});

const postBlog = asyncHandler(async (req, res) => {
  const { title, authorName, date, summary, content } = req.body;
  const { userId, sessionClaims } = req.auth();

  // 1. Validate Text Fields
  if (
    [title, authorName, date, summary, content].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All text fields are required");
  }

  // 2. Handle Optional Image
  let imageUrl = ""; // Default to empty string or a placeholder URL if you prefer
  const imageLocalPath = req.file?.path;

  if (imageLocalPath) {
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);

    // Only throw error if we TRIED to upload but it failed
    if (!uploadedImage) {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    imageUrl = uploadedImage.url;
  }

  // 3. Get College Info
  const alumniDir = await AlumniDir.findOne({
    email: sessionClaims.emailAddress,
  });

  // Safety check: ensure alumniDir exists
  if (!alumniDir) {
    throw new ApiError(404, "Alumni record not found");
  }

  const college = alumniDir.college;

  // 4. Create Blog
  const blog = await Blog.create({
    title,
    authorId: userId,
    authorName: authorName.toUpperCase(),
    date,
    image: imageUrl, // Will be "" if no image uploaded
    summary,
    content,
    college,
  });

  if (!blog) {
    throw new ApiError(500, "Something went wrong while creating the blog");
  }

  // 5. Link Blog to Alumni
  await Alumni.findOneAndUpdate(
    { clerkId: userId },
    { $push: { blogs: blog._id } },
    { new: true }
  );

  res.status(200).json(new Apiresponse(201, blog, "Blog posted successfully"));
});

const fetchBlogs = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();

  const blogs = await Blog.find({
    authorId: userId,
  });

  res.status(200).json(new Apiresponse(201, blogs, "success"));
});

const fetchEvent = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  // const alumni = await Alumni.findOne({ clerkId: userId });
  const alumniDir = await AlumniDir.findOne({
    email: sessionClaims.emailAddress,
  });
  console.log(alumniDir);
  const today = new Date();
  const college = alumniDir.college;
  const events = await Event.find({
    date: { $gte: today },
    college,
  });
  res
    .status(200)
    .json(new Apiresponse(201, events, "Events found successfully"));
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
        "studentInfo.userId": 1,
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
  ).populate("studentName");

  const alumni = await Alumni.findOneAndUpdate(
    {
      clerkId: userId,
    },
    { $push: { mentorship: id } },
    { new: true }
  );

  const studentEmail = updatedMentorship.studentName.email;
  const studentName = updatedMentorship.studentName.fullName;

  await sendEmail(
    studentEmail,
    `Your Mentorship Request Was ${status}`,
    `Hi ${studentName},\n\nYour mentorship request has been ${status} by the ${alumni.email}.\n\nPurpose: ${updatedMentorship.purpose}\n\nBest regards,\nMentorship Team`
  );

  res
    .status(200)
    .json(new Apiresponse(201, updatedMentorship, "updated Successfully"));
});

export {
  saveAndFetch,
  postBlog,
  fetchBlogs,
  fetchEvent,
  joinEvent,
  fetchMentorships,
  updateStatus,
};
