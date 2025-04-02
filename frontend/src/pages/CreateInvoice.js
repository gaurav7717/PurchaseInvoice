import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadInvoice, createInvoice } from "../slicers/invoiceSlice";
import { toast } from "react-toastify";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { selectVendors } from "../slicers/vendorSlice";

const CreateInvoice = ({
  open,
  handleClose,
  initialValues = null,
  onUpdate = null,
  onCreateSuccess = null,
}) => {
  const dispatch = useDispatch();
  const { uploadStatus, saveStatus, error } = useSelector((state) => state.invoices);
  const vendors = useSelector(selectVendors);
  console.table(vendors);
  // Default empty form state
  const emptyFormState = {
    vendor_name: "",
    invoice_number: "",
    ewaybill_number: "",
    invoice_date: new Date().toISOString().slice(0, 16),
    description: "",
    sub_total: 0,
    discount: 0,
    grand_total: 0,
    items: [],
  };

  const [formData, setFormData] = useState(emptyFormState);

  // Reset form when modal is opened/closed or when initialValues changes
  useEffect(() => {
    if (!open) {
      // If modal is closed, don't update state
      return;
    }
    
    if (initialValues) {
      console.log("Setting form with initial values:", initialValues);
      // Populate form with initialValues for edit mode
      setFormData({
        vendor_name: initialValues.vendor_name || "",
        invoice_number: initialValues.invoice_number || "",
        ewaybill_number: initialValues.ewaybill_number || "",
        invoice_date: initialValues.invoice_date 
          ? new Date(initialValues.invoice_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        description: initialValues.description || "",
        sub_total: initialValues.sub_total || 0,
        discount: initialValues.discount || 0,
        grand_total: initialValues.grand_total || 0,
        // Make sure items exists and is an array
        items: Array.isArray(initialValues.items) 
          ? initialValues.items.map(item => ({
              isService: item.isService || false,
              description: item.description || "",
              hsn_sac: item.hsn_sac || "",
              expiry: item.expiry || "",
              quantity: Number(item.quantity) || 0,
              deal: Number(item.deal) || 0,
              mrp: Number(item.mrp) || 0,
              tax: Number(item.tax) || 0,
              discount_percent: Number(item.discount_percent) || 0,
              amount: Number(item.amount) || 0,
            }))
          : [] // Provide an empty array if items is undefined
      });
    } else {
      // Reset form to empty state for create mode
      console.log("Resetting form to empty state");
      setFormData(emptyFormState);
    }
  }, [initialValues, open]);



  const itemFields = [
    { name: "hsn_sac", label: "HSN/SAC", type: "text" },
    { name: "expiry", label: "Expiry", type: "date" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "deal", label: "Deal", type: "number" },
    { name: "mrp", label: "MRP", type: "number" },
    { name: "tax", label: "Tax", type: "number" },
    { name: "discount_percent", label: "Discount %", type: "number" },
  ];

  const calculateTotals = (items, discount = 0) => {
    const sub_total = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.mrp || 0),
      0
    );
    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const grand_total = total_amount - Number(discount);
    return { sub_total, grand_total };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB.");
      return;
    }
    try {
      const result = await dispatch(uploadInvoice(file)).unwrap();
      if (!result.invoice_data || !result.items) {
        toast.error("Incomplete data extracted from PDF.");
        return;
      }
      const items = result.items.map((item) => {
        const qty = parseFloat(item.quantity) || 0;
        const discPercent = parseFloat(item.discount_percent) || 0;
        const tax = parseFloat(item.tax) || 0;
        const amount = parseFloat(item.amount) || 0;
        let expiry = item.expiry || "";
        if (expiry.match(/^\d{2}-\d{2}$/)) {
          expiry = `2025-${expiry.split("-")[1]}-${expiry.split("-")[0]}`;
        }
        return {
          isService: false,
          description: item.description || "",
          hsn_sac: item.hsn_sac || "",
          expiry: expiry,
          quantity: qty,
          deal: parseFloat(item.deal) || 0,
          mrp: parseFloat(item.mrp) || 0,
          tax,
          discount_percent: discPercent,
          amount,
        };
      });
      const { sub_total, grand_total } = calculateTotals(items);
      setFormData({
        vendor_name: result.invoice_data.vendor_name || "",
        invoice_number: result.invoice_data.invoice_number || "",
        ewaybill_number: result.invoice_data.ewaybill_number || "",
        invoice_date:
          result.invoice_data.invoice_date?.replace(" ", "T").slice(0, 16) ||
          new Date().toISOString().slice(0, 16),
        description: "",
        sub_total,
        discount: parseFloat(result.invoice_data.discount) || 0,
        grand_total,
        items,
      });
      toast.success("PDF uploaded successfully. You can now edit the data.");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload PDF.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    if (
      !newItems[index].isService &&
      ["quantity", "tax", "discount_percent", "mrp"].includes(field)
    ) {
      const qty = Number(newItems[index].quantity || 0);
      const tax = Number(newItems[index].tax || 0);
      const discPercent = Number(newItems[index].discount_percent || 0);
      const baseAmount = qty * Number(newItems[index].mrp || 0);
      const discountAmount = baseAmount * (discPercent / 100);
      const amountAfterDiscount = baseAmount - discountAmount;
      const taxAmount = amountAfterDiscount * (tax / 100);
      newItems[index].amount = amountAfterDiscount + taxAmount;
    }

    const { sub_total, grand_total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, sub_total, grand_total });
  };

  const addItem = () => {
    const newItem = {
      isService: false,
      description: "",
      hsn_sac: "",
      expiry: "",
      quantity: 0,
      deal: 0,
      mrp: 0,
      tax: 0,
      discount_percent: 0,
      amount: 0,
    };
    const newItems = [...formData.items, newItem];
    const { sub_total, grand_total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, sub_total, grand_total });
  };

  // Custom close handler that ensures proper form reset
  const handleModalClose = () => {
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      vendor_name: formData.vendor_name,
      sub_total: Number(formData.sub_total),
      discount: Number(formData.discount),
      grand_total: Number(formData.grand_total),
      ewaybill_number: formData.ewaybill_number || null,
      items: formData.items.map((item) => ({
        description: item.description || "",
        hsn_sac: item.hsn_sac || "",
        expiry: item.expiry || "",
        quantity: Number(item.quantity || 0),
        deal: Number(item.deal || 0),
        total_quantity: Number(item.quantity || 0) + Number(item.deal || 0),
        mrp: Number(item.mrp || 0),
        tax: Number(item.tax || 0),
        discount_percent: Number(item.discount_percent || 0),
        amount: Number(item.amount || 0),
      })),
    };

    if (initialValues && onUpdate) {
      try {
        await onUpdate(submitData);
        toast.success("Invoice updated successfully");
        handleModalClose();
      } catch (error) {
        console.error("Update failed:", error);
        toast.error("Failed to update invoice");
      }
    } else {
      try {
        await dispatch(createInvoice(submitData)).unwrap();
        toast.success("Invoice created successfully");
        if (onCreateSuccess) {
          onCreateSuccess(); // Call the success callback to refresh the list
        }
        handleModalClose();
      } catch (error) {
        console.error("Create failed:", error);
        toast.error("Failed to create invoice");
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="create-invoice-modal-title"
      aria-describedby="create-invoice-modal-description"
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      }}
    >
      <Box className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto my-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initialValues ? "Edit Invoice" : "Create Purchase Invoice"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor:</label>
              <select
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.vendor_name}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice ID:</label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E Way ID:</label>
              <input
                type="text"
                name="ewaybill_number"
                value={formData.ewaybill_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bill Date:</label>
              <input
                type="datetime-local"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {!initialValues && (
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploadStatus === "loading" && (
                <p className="mt-2 text-gray-600">Processing PDF...</p>
              )}
              {error && uploadStatus === "failed" && (
                <p className="mt-2 text-red-600">{error}</p>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Item Details</h3>
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50"
              >
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 mr-2">Is Service:</label>
                  <input
                    type="checkbox"
                    checked={item.isService}
                    onChange={(e) => handleItemChange(index, "isService", e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Description:</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Amount:</label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {!item.isService && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {itemFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}:
                        </label>
                        <input
                          type={field.type}
                          value={item[field.name]}
                          onChange={(e) => handleItemChange(index, field.name, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sub Total:</label>
              <input
                type="number"
                value={formData.sub_total}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount:</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grand Total:</label>
              <input
                type="number"
                value={formData.grand_total}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={saveStatus === "loading"}
              className={`py-2 px-4 rounded-md text-white ${
                saveStatus === "loading"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {initialValues
                ? "Update Invoice"
                : saveStatus === "loading"
                ? "Saving..."
                : "Save Invoice"}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
          {saveStatus === "failed" && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </Box>
    </Modal>
  );
};

export default CreateInvoice;