const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// Admin routes with image upload
router.post("/", 
    isAuthenticated, 
    hasRole(["admin"]), 
    upload.single('image'), 
    categoryController.createCategory
);

router.put("/:id", 
    isAuthenticated, 
    hasRole(["admin"]), 
    upload.single('image'), 
    categoryController.updateCategory
);

router.delete("/:id", isAuthenticated, hasRole(["admin"]), categoryController.deleteCategory);

module.exports = router;