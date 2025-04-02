// CreateVendorModal.js
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Using percentage for responsiveness
  maxWidth: 400, // Maximum width
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2, // Reduced padding to work better with Tailwind
};

const vendorFields = [
  { id: 'vendor_name', label: 'Vendor Name', type: 'text', required: true, validation: 'vendor_name' },
  { id: 'phone_number', label: 'Phone Number', type: 'number', validation: 'phone_number' },
  { id: 'email', label: 'Email', type: 'email', validation: 'email' },
  { id: 'address', label: 'Address', type: 'text', multiline: true, rows: 2 },
  { id: 'city', label: 'City', type: 'text' },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'state_code', label: 'State Code', type: 'text' },
  { id: 'zipcode', label: 'Zipcode', type: 'text', validation: 'zipcode' },
  { id: 'license_number', label: 'License Number', type: 'text' },
  // { id: 'associated_brands', label: 'Associated Brands', type: 'text' }, // Consider a different component for this
];

export const CreateVendorModal = ({
  isOpen,
  onClose,
  initialValues,
  onCreate,
  onUpdate,
  isViewOnly = false,
  onViewClose
}) => {
  const initialFormData = vendorFields.reduce((acc, field) => {
    acc[field.id] = '';
    return acc;
  }, { associated_brands: [] });

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    } else {
      resetForm();
    }
  }, [initialValues]);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    vendorFields.forEach(field => {
      if (field.required && !formData[field.id].trim()) {
        newErrors[field.validation || field.id] = `${field.label} is required`;
      }
      if (field.validation === 'email' && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (field.validation === 'phone_number' && formData.phone_number && !/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
        newErrors.phone_number = 'Phone number must be 10 digits';
      }
      if (field.validation === 'zipcode' && formData.zipcode && !/^\d{5}$/.test(formData.zipcode)) {
        newErrors.zipcode = 'Zipcode must be 5 digits';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (initialValues?.id && !isViewOnly) {
        onUpdate({ ...formData, id: initialValues.id });
      } else if (!isViewOnly) {
        onCreate({ ...formData, id: Date.now() });
      }
      resetForm();
      onClose();
    } catch (error) {
      setErrors({ ...errors, submit: 'An error occurred while saving' });
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={isViewOnly ? onViewClose : onClose}
      aria-labelledby="vendor-modal-title"
      aria-describedby="vendor-modal-description"
      className="flex items-center justify-center"
    >
      <Box  className="rounded-lg w-5/12 max-h bg-white p-4">
        <div className="flex flex-col h-[90vh] sm:h-[80vh] md:h-[70vh]">
          <Typography
            id="vendor-modal-title"
            variant="h6"
            component="h2"
            className="mb-4 text-center"
          >
            {isViewOnly ? 'View Vendor' : (initialValues ? 'Edit Vendor' : 'Create New Vendor')}
          </Typography>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-2">
            {errors.submit && !isViewOnly && (
              <Typography color="error" className="mb-4 text-center">
                {errors.submit}
              </Typography>
            )}

            <div className="space-y-4">
              {vendorFields.map((field) => (
                <TextField
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  value={formData[field.id]}
                  onChange={handleChange}
                  required={!isViewOnly && field.required}
                  fullWidth
                  margin="normal"
                  multiline={field.multiline}
                  rows={field.rows}
                  error={!!errors[field.validation || field.id]}
                  helperText={errors[field.validation || field.id]}
                  disabled={isViewOnly}
                  className="w-full text-black"
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: 'gray', // Label color
                    },
                    '& .MuiInputBase-input': {
                      color: 'black', // Input text color
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'black', // Border color
                      },
                      '&:hover fieldset': {
                        borderColor: 'black', // Border color on hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'black', // Border color when focused
                      },
                      '&:hover .Mui_focused .MuiInputLabel-root': {
                        color: 'black'
                      }
                    },
                  }}
                />
              ))}
            </div>

            <Box
              className="mt-6 flex flex-col sm:flex-row gap-4 justify-end sticky bottom-0 bg-white py-2"
            >
              {!isViewOnly ? (
                <>
                  <button
                    type="submit"

                    className="w-full sm:w-auto bg-black text-white px-3 py-2 rounded-4xl hover:bg-gray-600 hover:text-black"
                  >
                    {initialValues ? 'Update' : 'Create'}
                  </button>
                  <button

                    onClick={() => { resetForm(); onClose(); }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button

                  onClick={onViewClose}
                  className="w-full sm:w-auto"
                >
                  Close
                </button>
              )}
            </Box>
          </form>
        </div>
      </Box>
    </Modal>
  );
};