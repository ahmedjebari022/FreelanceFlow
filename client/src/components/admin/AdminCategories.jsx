import { useState, useEffect } from "react";
import axios from "axios";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/categories${searchTerm ? `?search=${searchTerm}` : ""}`,
        {
          withCredentials: true,
        }
      );
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        image: null,
      });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: null,
      });
      setImagePreview(null);
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    setFormError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      let response;
      if (editingCategory) {
        response = await axios.put(
          `/api/categories/${editingCategory._id}`,
          submitData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        // Update the category in the list
        setCategories(
          categories.map((cat) =>
            cat._id === editingCategory._id ? response.data : cat
          )
        );
      } else {
        response = await axios.post("/api/categories", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });

        // Add the new category to the list
        setCategories([...categories, response.data]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error submitting category:", err);
      setFormError(err.response?.data?.message || "Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/categories/${deletingCategory._id}`, {
        withCredentials: true,
      });

      // Remove the category from the list
      setCategories(
        categories.filter((cat) => cat._id !== deletingCategory._id)
      );
      setDeletingCategory(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Categories Management</h1>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="form-control w-full sm:w-auto">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search categories..."
              className="input input-bordered w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => handleOpenModal()}
        >
          Add New Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="card bg-base-100 shadow-xl">
            {category.image && (
              <figure>
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-48 w-full object-cover"
                />
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title">{category.name}</h2>
              <p className="text-sm line-clamp-3">{category.description}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span>Slug: {category.slug}</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenModal(category)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-error btn-outline btn-sm"
                  onClick={() => handleDeleteClick(category)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h3>

            {formError && (
              <div className="alert alert-error mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Category Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Enter category description"
                  className="textarea textarea-bordered w-full min-h-[120px]"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Image</span>
                  {editingCategory && !formData.image && (
                    <span className="label-text-alt">
                      Leave empty to keep current image
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingCategory}
                />
              </div>

              {imagePreview && (
                <div className="mb-4">
                  <p className="label-text mb-2">Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete the category "
              {deletingCategory.name}"? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeletingCategory(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-xl font-semibold mb-2">No categories found</div>
          <p className="text-gray-500">
            Create your first category to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
