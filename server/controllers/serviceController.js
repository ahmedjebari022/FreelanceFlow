const Service = require("../models/Service");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = async (file) => {
  const stream = Readable.from(file.buffer);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "services",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.pipe(uploadStream);
  });
};

const serviceController = {
  // Create service (for freelancers)
  createService: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        price,
        features,
        requirements,
        deliveryTime,
        revisions,
      } = req.body;

      // Handle image uploads
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const result = await uploadToCloudinary(req.files[i]);
          imageUrls.push({
            url: result.secure_url,
            isPrimary: i === 0, // First image is primary
          });
        }
      }

      // Parse features if they're sent as a string
      let featuresArray = features;
      if (features && typeof features === "string") {
        try {
          featuresArray = JSON.parse(features);
        } catch {
          // If parsing fails, split by newlines
          featuresArray = features.split("\n").filter((line) => line.trim() !== "");
        }
      }

      const service = new Service({
        title,
        description,
        category,
        price,
        freelancer: req.user._id,
        images: imageUrls,
        features: featuresArray || [],
        requirements: requirements || "",
        deliveryTime: deliveryTime || 7,
        revisions: revisions || 3,
      });

      await service.save();
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all services with filters
  getAllServices: async (req, res) => {
    try {
      const { category, minPrice, maxPrice, search } = req.query;
      let query = { isActive: true };

      // Find category by slug or name first if category filter is present
      if (category && category !== "") {
        // Try to find by slug first
        const categoryDoc = await Category.findOne({
          $or: [{ slug: category }, { name: category }],
        });

        if (categoryDoc) {
          query.category = categoryDoc._id;
          console.log("Category found:", categoryDoc.name, "ID:", categoryDoc._id);
        } else {
          console.log("Category not found:", category);
          // If we can't find the category, return an empty result
          return res.json([]);
        }
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (search) {
        query.$text = { $search: search };
      }

      console.log("Final query:", JSON.stringify(query));
      const services = await Service.find(query)
        .populate("freelancer", "firstName lastName location")
        .populate("category", "name");

      res.json(services);
    } catch (error) {
      console.error("Service fetch error:", error);
      res.status(500).json({
        message: "Error fetching services",
        error: error.message,
      });
    }
  },

  // Get my services (freelancer)
  getMyServices: async (req, res) => {
    try {
      const services = await Service.find({ freelancer: req.user._id })
        .populate("category", "name")
        .sort({ createdAt: -1 });
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching your services", error: error.message });
    }
  },

  // Get service by ID
  getServiceById: async (req, res) => {
    try {
      const service = await Service.findById(req.params.id)
        .populate("freelancer", "firstName lastName location biography")
        .populate("category", "name");

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update service (freelancer only)
  updateService: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        price,
        features,
        requirements,
        deliveryTime,
        revisions,
      } = req.body;
      const updateData = { title, description, category, price };

      // Parse features if they're sent as a string
      if (features) {
        let featuresArray = features;
        if (typeof features === "string") {
          try {
            featuresArray = JSON.parse(features);
          } catch {
            // If parsing fails, split by newlines
            featuresArray = features.split("\n").filter((line) => line.trim() !== "");
          }
        }
        updateData.features = featuresArray;
      }

      if (requirements !== undefined) updateData.requirements = requirements;
      if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
      if (revisions !== undefined) updateData.revisions = revisions;

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (let i = 0; i < req.files.length; i++) {
          const result = await uploadToCloudinary(req.files[i]);
          imageUrls.push({
            url: result.secure_url,
            isPrimary: i === 0,
          });
        }
        updateData.images = imageUrls;
      }

      const service = await Service.findOneAndUpdate(
        { _id: req.params.id, freelancer: req.user._id },
        updateData,
        { new: true }
      );

      if (!service) {
        return res
          .status(404)
          .json({ message: "Service not found or unauthorized" });
      }

      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete service (freelancer only)
  deleteService: async (req, res) => {
    try {
      const service = await Service.findOneAndDelete({
        _id: req.params.id,
        freelancer: req.user._id,
      });

      if (!service) {
        return res
          .status(404)
          .json({ message: "Service not found or unauthorized" });
      }

      res.json({ message: "Service deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = serviceController;
