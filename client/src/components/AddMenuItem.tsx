import axios from "axios";
import { useState } from "react";
import { outletService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

const AddMenuItem = ({ fetchMenuItems }: { fetchMenuItems: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Name price and image is required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setSubmitting(true);
      await axios.post(`${outletService}/api/item/new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Item added successfully");
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.log(error);
      toast.error("failed to add item");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md space-y-4 m-auto">
      <h2 className="text-lg font-semibold">Add Menu Item</h2>
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
      />
      <textarea
        placeholder="Item description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
      />
      <input
        type="number"
        placeholder="price ₹"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
        <BiUpload className="h-5 w-5 text-red-500" />
        {image ? image.name : "Upload Item Image"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </label>

      <button
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full rounded-lg text-white text-sm py-3 font-semibold transition bg-red-500 cursor-pointer"
      >
        {submitting ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
};

export default AddMenuItem;
