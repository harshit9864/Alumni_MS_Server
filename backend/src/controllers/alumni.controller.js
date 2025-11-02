import { Alumni } from "../models/alumni.model.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const saveAndFetch = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  let user = await Alumni.findOne({ clerkId: userId });
  if (!user) {
    user = await Alumni.create({ clerkId: userId });
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
  const { userId } = req.auth();

  const blogs = await Blog.find({
    authorId: userId,
  });

  res.status(200).json(new Apiresponse(201, blogs, "success"));
});

export { saveAndFetch, postBlog, fetchBlogs };
