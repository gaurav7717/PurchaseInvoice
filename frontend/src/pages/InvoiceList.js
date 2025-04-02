import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchInvoices, updateInvoice, deleteInvoice } from '../slicers/invoiceSlice';
import Navbar from '../component/Navbar';
import { toast } from 'react-toastify';
import CreateInvoiceModal from './CreateInvoice'; // Updated to use modal version
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

function InvoiceList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Add clientSideReady state to prevent hydration issues
  const [clientSideReady, setClientSideReady] = useState(false);

  useEffect(() => {
    setClientSideReady(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else {
        dispatch(fetchInvoices());
      }
    }
  }, [dispatch, isAuthenticated, authLoading, navigate]);

  if (!clientSideReady || authLoading) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }


  if (!clientSideReady || authLoading) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return null; // Prevent rendering if not authenticated
  }

  if (loading) return <div className="p-4 text-center">Loading invoices...</div>;
  if (error) return <div className="p-4 text-center text-red-600">Error: {error}</div>;

  const handleEditClick = (invoice) => {
    // Make a deep copy of the invoice to avoid reference issues
    const invoiceCopy = JSON.parse(JSON.stringify(invoice));
    
    // Ensure the items array is properly initialized
    if (!invoiceCopy.items || !Array.isArray(invoiceCopy.items)) {
      invoiceCopy.items = [];
    }
    
    setEditingInvoice(invoiceCopy);
    setModalOpen(true);
  };

  const handleUpdateInvoice = async (updatedData) => {
    if (editingInvoice?.id) {
      try {
        await dispatch(updateInvoice({ invoiceId: editingInvoice.id, updateData: updatedData })).unwrap();
        toast.success('Invoice updated successfully');
        // Refresh the invoices data after updating
        dispatch(fetchInvoices());
        setModalOpen(false);
        setEditingInvoice(null);
      } catch (err) {
        toast.error('Failed to update invoice');
      }
    }
  };

  const handleDeleteClick = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await dispatch(deleteInvoice(invoiceId)).unwrap();
        toast.success('Invoice deleted successfully');
      } catch (err) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingInvoice(null);
  };

  // Safe rendering of invoice items
  const renderInvoiceItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <div className="p-3 text-gray-500">No items found for this invoice.</div>;
    }

    return items.map((item) => (
      <div key={item.id || `item-${Math.random()}`} className="border-t">
        {/* Mobile item view */}
        <div className="md:hidden p-3 space-y-2">
          <div className="font-medium">{item.description || 'No description'}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>HSN/SAC: {item.hsn_sac || 'N/A'}</div>
            <div className="text-right">MRP: ₹{item.mrp || '0'}</div>
            <div>Expiry: {item.expiry || 'N/A'}</div>
            <div className="text-right">Tax: {item.tax || '0'}%</div>
            <div>Qty: {item.quantity || '0'}</div>
            <div className="text-right">Disc: {item.discount_percent || '0'}%</div>
            <div className="col-span-2 text-right font-medium">
              Amount: ₹{item.amount || '0'}
            </div>
          </div>
        </div>

        {/* Desktop item view */}
        <div className="hidden md:grid md:grid-cols-11 gap-2 p-3 text-sm">
          <div className="col-span-2 truncate">{item.description || 'No description'}</div>
          <div className="text-right col-span-1">{item.hsn_sac || 'N/A'}</div>
          <div className="text-right col-span-1">{item.expiry || 'N/A'}</div>
          <div className="text-right col-span-1">{item.quantity || '0'}</div>
          <div className="text-right col-span-1">{item.deal || '0'}</div>
          <div className="text-right col-span-1">{item.total_quantity || '0'}</div>
          <div className="text-right col-span-1">₹{item.mrp || '0'}</div>
          <div className="text-right col-span-1">{item.tax || '0'}%</div>
          <div className="text-right col-span-1">{item.discount_percent || '0'}%</div>
          <div className="text-right col-span-1 font-medium">₹{item.amount || '0'}</div>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-full mx-auto mt-0">
      <Navbar />
      <div className='max-w-7xl mx-auto mt-6 md:w-11/12'>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoice List</h1>
          <button
            onClick={() => {
              setEditingInvoice(null); // Ensure no editing invoice is set
              setModalOpen(true);
            }}
            className="border-2 p-2 rounded-md hover:bg-gray-100 hover:border-gray-300 hover:shadow-md transition duration-100 ease-in-out"
          >
            Create New Invoice
            <AddIcon className="inline-block ml-1" />
          </button>
        </div>

        {/* Modal only rendered client-side */}
        {clientSideReady && (
          <CreateInvoiceModal
            open={modalOpen}
            handleClose={handleModalClose}
            initialValues={editingInvoice}
            onUpdate={handleUpdateInvoice}
            onCreateSuccess={() => {
              // Refresh invoices after creation
              dispatch(fetchInvoices());
            }}
          />
        )}

        {invoices.length === 0 ? (
          <p className="text-gray-500 text-center">No invoices found.</p>
        ) : (
          <div className="space-y-4">
            {/* Table headers for larger screens */}
            <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 font-medium items-center">
                <div className="col-span-2">Invoice Number</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Vendor</div>
                <div className="col-span-1 text-right">Sub Total</div>
                <div className="col-span-2 text-right">Grand Total</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>
            </div>

            {invoices.map((invoice) => (
              <Accordion key={invoice.id || `invoice-${Math.random()}`} className="shadow-sm mb-0">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="hover:bg-gray-50"
                >
                  <div className="w-full">
                    {/* Mobile view */}
                    <div className="md:hidden space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{invoice.invoice_number || 'No number'}</span>
                        <span className="text-right">₹{invoice.grand_total || '0'}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.vendor_name || 'Unknown'} · {invoice.invoice_date || 'No date'}
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(invoice);
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(invoice.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Desktop view */}
                    <div className="hidden md:grid md:grid-cols-12 md:gap-4 items-center">
                      <div className="col-span-2">{invoice.invoice_number || 'No number'}</div>
                      <div className="col-span-2">{invoice.invoice_date || 'No date'}</div>
                      <div className="col-span-3">{invoice.vendor_name || 'Unknown'}</div>
                      <div className="col-span-1 text-right">₹{invoice.sub_total || '0'}</div>
                      <div className="col-span-2 text-right">₹{invoice.grand_total || '0'}</div>
                      <div className="col-span-2 flex justify-around space-x-0">
                        <button
                          
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(invoice);
                          }}
                          className="text-blue-500"
                        >
                         <ModeEditOutlineOutlinedIcon/>
                        </button>        
                        
                        <button
                         
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(invoice.id);
                          }}
                          className='text-red-500'
                        >
                          <DeleteIcon/>
                        </button>
                      </div>
                    </div>
                  </div>
                </AccordionSummary>

                <AccordionDetails className="bg-gray-50">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Invoice Items</h3>
                    <div className="overflow-x-auto rounded-lg shadow-sm">
                      <div className="min-w-[800px] bg-white">
                        {/* Table headers */}
                        <div className="grid grid-cols-11 gap-2 p-3 bg-gray-100 text-sm font-medium">
                          <div className="col-span-2">Description</div>
                          <div className="text-right col-span-1">HSN/SAC</div>
                          <div className="text-right col-span-1">Expiry</div>
                          <div className="text-right col-span-1">Qty</div>
                          <div className="text-right col-span-1">Deal</div>
                          <div className="text-right col-span-1">Total Qty</div>
                          <div className="text-right col-span-1">MRP</div>
                          <div className="text-right col-span-1">Tax%</div>
                          <div className="text-right col-span-1">Disc%</div>
                          <div className="text-right col-span-1">Amount</div>
                        </div>

                        {renderInvoiceItems(invoice.items)}
                      </div>
                    </div>
                  </div>
                </AccordionDetails>

                {/* Actions at bottom for mobile */}
                <div className="md:hidden p-3 flex justify-end space-x-2 bg-gray-50">
                  <Button
                    size="small"
                    onClick={() => handleEditClick(invoice)}
                    className="text-blue-600"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(invoice.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;