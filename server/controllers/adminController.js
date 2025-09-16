const User = require("../models/User");
const Service = require("../models/Service");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const adminController = {
  // Dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const [
        userCount,
        serviceCount,
        orderCount,
        totalRevenue,
        totalEarnings,
        platformFees,
        categoryCount, // Add this line
      ] = await Promise.all([
        User.countDocuments(),
        Service.countDocuments(),
        Order.countDocuments(),
        Payment.aggregate([
          { $match: { status: { $in: ["succeeded", "transferred"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Payment.aggregate([
          { $match: { status: { $in: ["succeeded", "transferred"] } } },
          { $group: { _id: null, total: { $sum: "$freelancerAmount" } } },
        ]),
        Payment.aggregate([
          { $match: { status: { $in: ["succeeded", "transferred"] } } },
          { $group: { _id: null, total: { $sum: "$platformFee" } } },
        ]),
        Category.countDocuments(), // Add this line
      ]);

      // Get counts by role
      const freelancerCount = await User.countDocuments({ role: "freelancer" });
      const clientCount = await User.countDocuments({ role: "client" });
      const adminCount = await User.countDocuments({ role: "admin" });

      // Get recent orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "firstName lastName")
        .populate("freelancer", "firstName lastName")
        .populate("service", "title");

      // Get recent payments
      const recentPayments = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "order",
          select: "_id client freelancer",
          populate: [
            { path: "client", select: "firstName lastName" },
            { path: "freelancer", select: "firstName lastName" },
          ],
        });

      res.json({
        userCount,
        freelancerCount,
        clientCount,
        adminCount,
        serviceCount,
        orderCount,
        categoryCount, // Add this line
        revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        earnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        platformFees: platformFees.length > 0 ? platformFees[0].total : 0,
        recentOrders,
        recentPayments,
      });
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // User management
  getAllUsers: async (req, res) => {
    try {
      const { role, search, sortBy, order, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Build filter query
      let query = {};

      // Filter by role if provided
      if (role && ["client", "freelancer", "admin"].includes(role)) {
        query.role = role;
      }

      // Search by name or email
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort options
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1; // Default sort by creation date
      }

      // Execute query with pagination
      const users = await User.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-passwordHash");

      // Get total count for pagination
      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select(
        "-passwordHash"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's services if they're a freelancer
      let services = [];
      let orders = [];
      let payments = [];

      if (user.role === "freelancer") {
        services = await Service.find({ freelancer: user._id })
          .sort({ createdAt: -1 })
          .limit(5);

        orders = await Order.find({ freelancer: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("service", "title")
          .populate("client", "firstName lastName");

        payments = await Payment.find()
          .populate({
            path: "order",
            match: { freelancer: user._id },
            select: "status",
          })
          .limit(5);

        // Filter out null orders
        payments = payments.filter((payment) => payment.order);
      } else if (user.role === "client") {
        orders = await Order.find({ client: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("service", "title")
          .populate("freelancer", "firstName lastName");

        payments = await Payment.find()
          .populate({
            path: "order",
            match: { client: user._id },
            select: "status",
          })
          .limit(5);

        // Filter out null orders
        payments = payments.filter((payment) => payment.order);
      }

      res.json({
        user,
        services,
        orders,
        payments,
      });
    } catch (error) {
      console.error("Error getting user details:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, email, role, isActive } = req.body;

      // Create update object with only provided fields
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      // Handle profile image upload if present
      if (req.file) {
        // Create a stream from buffer
        const stream = Readable.from(req.file.buffer);

        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "profile_images",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(uploadStream);
        });

        const uploadResult = await uploadPromise;
        updateData.profileImage = uploadResult.secure_url;
      }

      const user = await User.findByIdAndUpdate(req.params.userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-passwordHash");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Consider adding additional cleanup here: delete user's services, orders, etc.

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Service management
  getAllServices: async (req, res) => {
    try {
      const {
        category,
        freelancer,
        isActive,
        search,
        sortBy,
        order,
        page = 1,
        limit = 10,
      } = req.query;
      const skip = (page - 1) * limit;

      // Build filter query
      let query = {};

      if (category) {
        query.category = category;
      }

      if (freelancer) {
        query.freelancer = freelancer;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true";
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort options
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      // Execute query with pagination
      const services = await Service.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("freelancer", "firstName lastName")
        .populate("category", "name");

      // Get total count for pagination
      const total = await Service.countDocuments(query);

      res.json({
        services,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting services:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateService: async (req, res) => {
    try {
      const { 
        title, 
        description, 
        price, 
        isActive, 
        features, 
        requirements,
        deliveryTime,
        revisions
      } = req.body;

      // Create update object with only provided fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Handle features array
      if (features !== undefined) {
        if (typeof features === 'string') {
          try {
            updateData.features = JSON.parse(features);
          } catch {
            updateData.features = features.split('\n').filter(line => line.trim() !== '');
          }
        } else {
          updateData.features = features;
        }
      }
      
      // Handle other new fields
      if (requirements !== undefined) updateData.requirements = requirements;
      if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
      if (revisions !== undefined) updateData.revisions = revisions;

      const service = await Service.findByIdAndUpdate(
        req.params.serviceId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("freelancer", "firstName lastName")
        .populate("category", "name");

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteService: async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.serviceId);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Order management
  getAllOrders: async (req, res) => {
    try {
      const {
        status,
        client,
        freelancer,
        sortBy,
        order,
        page = 1,
        limit = 10,
      } = req.query;
      const skip = (page - 1) * limit;

      // Build filter query
      let query = {};

      if (
        status &&
        [
          "pending",
          "accepted",
          "in_progress",
          "completed",
          "cancelled",
        ].includes(status)
      ) {
        query.status = status;
      }

      if (client) {
        query.client = client;
      }

      if (freelancer) {
        query.freelancer = freelancer;
      }

      // Build sort options
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      // Execute query with pagination
      const orders = await Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("client", "firstName lastName")
        .populate("freelancer", "firstName lastName")
        .populate("service", "title price");

      // Get total count for pagination
      const total = await Order.countDocuments(query);

      res.json({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId)
        .populate("client", "firstName lastName email")
        .populate("freelancer", "firstName lastName email")
        .populate("service", "title description price images");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get payment information for this order
      const payment = await Payment.findOne({ order: order._id });

      // Get messages for this order
      const messages = order.messages || [];

      res.json({
        order,
        payment,
        messages,
      });
    } catch (error) {
      console.error("Error getting order details:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;

      if (
        ![
          "pending",
          "accepted",
          "in_progress",
          "completed",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update status and relevant dates
      order.status = status;

      if (status === "accepted") {
        order.startDate = new Date();
      } else if (status === "completed") {
        order.completionDate = new Date();
        order.isReviewable = true;
      }

      await order.save();

      // Populate required fields
      await order
        .populate("client", "firstName lastName")
        .populate("freelancer", "firstName lastName")
        .populate("service", "title price");

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Payment management
  getAllPayments: async (req, res) => {
    try {
      const {
        status,
        payoutStatus,
        sortBy,
        order,
        page = 1,
        limit = 10,
      } = req.query;
      const skip = (page - 1) * limit;

      // Build filter query
      let query = {};

      if (status) {
        query.status = status;
      }

      if (payoutStatus) {
        query.payoutStatus = payoutStatus;
      }

      // Build sort options
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      // Execute query with pagination
      const payments = await Payment.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: "order",
          populate: [
            { path: "client", select: "firstName lastName" },
            { path: "freelancer", select: "firstName lastName" },
            { path: "service", select: "title" },
          ],
        });

      // Get total count for pagination
      const total = await Payment.countDocuments(query);

      res.json({
        payments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting payments:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.paymentId).populate({
        path: "order",
        populate: [
          { path: "client", select: "firstName lastName email" },
          {
            path: "freelancer",
            select: "firstName lastName email stripeConnectId",
          },
          { path: "service", select: "title price" },
        ],
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(payment);
    } catch (error) {
      console.error("Error getting payment details:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Add any other admin functions below
  getRevenueStats: async (req, res) => {
    try {
      const { period = "monthly" } = req.query;
      let groupBy;

      if (period === "daily") {
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
      } else if (period === "weekly") {
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
      } else {
        // monthly is default
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
      }

      const revenueStats = await Payment.aggregate([
        { $match: { status: { $in: ["succeeded", "transferred"] } } },
        {
          $group: {
            _id: groupBy,
            totalRevenue: { $sum: "$amount" },
            platformFees: { $sum: "$platformFee" },
            freelancerEarnings: { $sum: "$freelancerAmount" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 },
        },
      ]);

      res.json(revenueStats);
    } catch (error) {
      console.error("Error getting revenue stats:", error);
      res.status(500).json({ message: error.message });
    }
  },

  createAdminUser: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        passwordHash,
        role: "admin",
      });

      await user.save();

      res.status(201).json({
        message: "Admin user created successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Add this to your adminController.js
  getServiceById: async (req, res) => {
    try {
      const service = await Service.findById(req.params.serviceId)
        .populate("freelancer", "firstName lastName email")
        .populate("category", "name");

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Get any associated orders for this service
      const orderCount = await Order.countDocuments({ service: service._id });

      // Get revenue data
      const payments = await Payment.find().populate({
        path: "order",
        match: { service: service._id },
        select: "price",
      });

      // Filter out null orders and calculate revenue
      const validPayments = payments.filter((payment) => payment.order);
      const revenue = validPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Add these stats to the service object
      const serviceWithStats = {
        ...service.toObject(),
        orderCount,
        revenue,
      };

      res.json(serviceWithStats);
    } catch (error) {
      console.error("Error getting service details:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Add endpoint to update service status
  updateServiceStatus: async (req, res) => {
    try {
      const { status, reason } = req.body;

      if (!["active", "inactive", "pending", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const service = await Service.findById(req.params.serviceId);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Update status
      service.status = status;

      // If we have a status history field, add to it
      if (!service.statusHistory) {
        service.statusHistory = [];
      }

      service.statusHistory.push({
        status,
        date: new Date(),
        reason: reason || undefined,
      });

      await service.save();

      // Return updated service
      const updatedService = await Service.findById(req.params.serviceId)
        .populate("freelancer", "firstName lastName email")
        .populate("category", "name");

      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service status:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
