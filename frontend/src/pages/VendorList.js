import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVendor, updateVendor, deleteVendor, selectVendors } from '../slicers/vendorSlice';
import { CreateVendorModal } from './CreateVendorModal';
import Navbar from '../component/Navbar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';


export const VendorList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewOnlyVendor, setViewOnlyVendor] = useState(null);
  const vendors = useSelector(selectVendors);
  const dispatch = useDispatch();

  const handleCreateVendor = (newVendor) => {
    dispatch(addVendor(newVendor));
  };

  const handleUpdateVendor = (updatedVendor) => {
    dispatch(updateVendor(updatedVendor));
    setSelectedVendor(null);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeleteVendor = (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      dispatch(deleteVendor(vendorId));
    }
  };

  const handleViewVendor = (vendor) => {
    setViewOnlyVendor(vendor);
    setIsModalOpen(true);
  };

  const handleViewClose = () => {
    setIsModalOpen(false);
    setViewOnlyVendor(null);
  };

  return (
    <>
      <Navbar />
      <div className="vendor-list md:w-11/12 mx-auto" style={{ padding: '20px' }}>
        <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Vendors</h2>
        <button 
          onClick={() => {
            setSelectedVendor(null);
            setViewOnlyVendor(null);
            setIsModalOpen(true);
          }}
          sx={{ mb: 2 }}
          className='border-2 p-2 rounded-md hover:bg-gray-100 hover:border-gray-300 hover:shadow-md transition duration-100 ease-in-out'
        >
          Add New Vendor
          <AddIcon className="inline-block ml-1" />
        </button>

        </div>
        <CreateVendorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
          }}
          initialValues={viewOnlyVendor || selectedVendor}
          onCreate={handleCreateVendor}
          onUpdate={handleUpdateVendor}
          isViewOnly={!!viewOnlyVendor}
          onViewClose={handleViewClose}
        />

        {vendors.length === 0 ? (
          <p>No vendors available</p>
        ) : (
          <Grid container spacing={2}>
            {vendors.map(vendor => (
              <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                <Card sx={{ minWidth: 275, cursor: 'pointer' }}>
                  <CardContent onClick={() => handleViewVendor(vendor)}>
                    <Typography variant="h6" component="div">
                      {vendor.vendor_name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Phone: {vendor.phone_number}
                    </Typography>
                    <Typography variant="body2">
                      License: {vendor.license_number}
                    </Typography>
                  </CardContent>
                  <CardActions className='flex justify-between'>
                    <button 
                   
                      onClick={() => handleEditVendor(vendor)}
                      className='text-blue-500'
                    >
                     <ModeEditOutlineOutlinedIcon className='ml-1 '/>
                    </button>
                    <button 
                     
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className='text-red-500'
                    >
                      <DeleteIcon className='mr-1 '/>
                    </button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </>
  );
};