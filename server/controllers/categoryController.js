const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const categoryController = {
  // Get all categories with search functionality
  getAllCategories: async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};

      // If search term exists, create a case-insensitive regex search
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        };
      }

      const categories = await Category.find(query);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get category by slug
  getCategoryBySlug: async (req, res) => {
    try {
      const category = await Category.findOne({ slug: req.params.slug });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Admin: Create category
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Create a stream from buffer
      const stream = Readable.from(req.file.buffer);

      // Upload to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "categories",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.pipe(uploadStream);
      });

      const uploadResult = await uploadPromise;
      const slug = name.toLowerCase().replace(/\s+/g, "-");

      const category = new Category({
        name,
        description,
        image: uploadResult.secure_url,
        slug,
      });

      await category.save();
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Admin: Update category
  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      const updateData = { name, description };

      if (req.file) {
        // Upload new image
        const stream = Readable.from(req.file.buffer);
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "categories",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(uploadStream);
        });

        const uploadResult = await uploadPromise;
        updateData.image = uploadResult.secure_url;
      }

      if (name) {
        updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Admin: Delete category
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = categoryController;
