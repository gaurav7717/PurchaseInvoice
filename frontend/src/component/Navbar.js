import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slicers/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-zinc-900 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            Invoice App
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-4">
            <li>
              <Link to="/invoices" className="hover:text-gray-300">
                Purchase Invoice List
              </Link>
            </li>
            <li>
              <Link to="/vendors" className="hover:text-gray-300">
                Vendor
              </Link>
            </li>
            <li>
              <button onClick={handleSignOut} className="hover:text-gray-300 focus:outline-none">
                Sign Out
              </button>
            </li>
          </ul>

          {/* Mobile Menu (Visible on smaller screens) */}
          <div className="md:hidden">
            <ul className="flex flex-col items-center space-y-2">
              <li>
                <Link to="/invoices" className="block py-2 hover:text-gray-300">
                  Purchase Invoice List
                </Link>
              </li>
              <li>
                <Link to="/create" className="block py-2 hover:text-gray-300">
                  Create Purchase Invoice
                </Link>
              </li>
              <li>
                <button onClick={handleSignOut} className="block py-2 hover:text-gray-300 focus:outline-none">
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;