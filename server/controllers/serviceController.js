const Service = require("../models/Service");
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
      const { title, description, category, price } = req.body;

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

      const service = new Service({
        title,
        description,
        category,
        price,
        freelancer: req.user._id,
        images: imageUrls,
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

      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.$text = { $search: search };
      }

      const services = await Service.find(query)
        .populate("freelancer", "firstName lastName location")
        .populate("category", "name");

      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      const { title, description, category, price } = req.body;
      const updateData = { title, description, category, price };

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
