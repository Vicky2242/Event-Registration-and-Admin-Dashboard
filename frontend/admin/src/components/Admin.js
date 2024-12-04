import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import jsPDF from 'jspdf';
import useAuth from '../context/useAuth';
import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon } from '@heroicons/react/solid';


const Admin = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [activePage, setActivePage] = useState('users');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Controls edit state

  const navigate = useNavigate();
  const { logout } = useAuth(); // Combined destructuring

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      // Validate token with the backend, if needed
      // If token is invalid, redirect to login
    }
  }, [navigate]);

  // Fetch registrations when component mounts
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/admin/event-registrations');
        setRegistrations(response.data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      }
    };
    fetchRegistrations();
  }, []);

  const viewRegistration = (registration) => {
    setSelectedRegistration(registration);
  };

  const editRegistration = (registration) => {
    if (!isEditing) {
      setSelectedRegistration(registration);
      setIsEditing(true); // Start editing mode
    }
  };

  const deleteRegistration = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this registration?');
    
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/admin/event-registrations/${id}`);
        setRegistrations(registrations.filter((registration) => registration._id !== id));
        alert('Registration deleted successfully!');
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('Failed to delete registration.');
      }
    }
  };

  const calculateAge = (dob) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    return age;
  }

  const saveRegistration = async (updatedData) => {
    try {
      await axios.put(`http://localhost:8080/admin/event-registrations/${selectedRegistration._id}`, updatedData);
      
      // Update the list of registrations with the saved data
      const updatedRegistrations = registrations.map((reg) =>
        reg._id === selectedRegistration._id ? { ...selectedRegistration, ...updatedData } : reg
      );
      
      setRegistrations(updatedRegistrations);
      
      // Reset state after saving to allow further edits
      setSelectedRegistration(null);
      setIsEditing(false);
      
      alert('Registration updated successfully!');  // Optional feedback
    } catch (error) {
      console.error('Error saving registration:', error);
    }
  };
  
  const downloadPDF = (registration) => {
    const doc = new jsPDF();
  
    doc.text('User Registration Details', 10, 10);
    doc.text(`Name: ${registration.name}`, 10, 20);
    doc.text(`Email: ${registration.email}`, 10, 30);
    doc.text(`Event: ${registration.event}`, 10, 40);
    doc.text(`Gender: ${registration.gender}`, 10, 50);
    doc.text(`D.O.B: ${registration.dob}`, 10, 60);
    doc.text(`Age: ${registration.age}`, 10, 70);
    doc.text(`Price: ${registration.price}`, 10, 80);
    doc.text(`Payment Id: ${registration.payment_id}`, 10, 90);
    doc.text(`Order Id: ${registration.order_id}`, 10, 100);
  
    doc.save('registration-details.pdf');
  };

  const downloadCSV = (registration) => {
    const csvContent = `data:text/csv;charset=utf-8,Name,Email,Event,Gender,D.O.B,Age,Price,Payment Id,Order Id\n` +
      `${registration.name},${registration.email},${registration.event},${registration.gender},${registration.dob},${registration.age},${registration.price},${registration.payment_id},${registration.order_id}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registration_details.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  };

  const downloadDOC = (registration) => {
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body>
        <h1>User Registration Details</h1>
        <p>Name: ${registration.name}</p>
        <p>Email: ${registration.email}</p>
        <p>Event: ${registration.event}</p>
        <p>Gender: ${registration.gender}</p>
        <p>D.O.B: ${registration.dob}</p>
        <p>Age: ${registration.age}</p>
        <p>Price: ${registration.price}</p>
        <p>Payment Id: ${registration.payment_id}</p>
        <p>Order Id: ${registration.order_id}</p>
      </body>
      </html>`;

    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'registration_details.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFile = (registration) => {
    const format = document.getElementById("format").value;
    
    if (format === "pdf") {
      downloadPDF(registration);
    } else if (format === "csv") {
      downloadCSV(registration);
    } else if (format === "doc") {
      downloadDOC(registration);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/admin/login');
  };

  const handleBack = () => {
    setSelectedRegistration(null);
    setIsEditing(false); // Exit edit mode
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-violet-800 text-white ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <button
          className="p-4 text-2xl focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        {isSidebarOpen && (
          <nav className="p-4">
            <ul>
              <li className={`mb-5 ${activePage === 'users' ? 'font-bold' : ''}`}>
                <button onClick={() => setActivePage('users')} className="bg-violet-500 text-white w-full py-2 rounded mt-6 mb-20">
                  Users
                </button>
              </li>

              <li>
                <button onClick={handleLogout} className="bg-red-500 text-white w-full py-2 rounded mt-6">
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8">
        {/* Users List */}
        {activePage === 'users' && !selectedRegistration && !isEditing && (
          <div>
            <h1 className="text-2xl mb-4 text-red-500">Admin Dashboard</h1>
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Event</th>
                  <th className="border px-4 py-2">Gender</th>
                  <th className="border px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration._id}>
                    <td className="border px-4 py-2">{registration.name}</td>
                    <td className="border px-4 py-2">{registration.email}</td>
                    <td className="border px-4 py-2">{registration.event}</td>
                    <td className="border px-4 py-2">{registration.gender}</td>
                    
                    <td className="border px-4 py-2">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => viewRegistration(registration)} className="text-green-500">
                          <EyeIcon className="h-5 w-5 hover:text-green-700" />
                        </button>

                        <button onClick={() => editRegistration(registration)} className="text-blue-500">
                          <PencilIcon className="h-5 w-5 hover:text-blue-700" />
                        </button>

                        <button onClick={() => deleteRegistration(registration._id)} className="text-red-500">
                          <TrashIcon className="h-5 w-5 hover:text-red-700" />
                        </button>

                        <div className="flex items-center space-x-2">
                          <label htmlFor="format" className="text-sm">Format:</label>
                          <select id="format" className="border p-1 text-sm rounded">
                            <option value="pdf">PDF</option>
                            <option value="csv">CSV</option>
                            <option value="doc">DOC</option>
                          </select>
                          <button onClick={() => downloadFile(registration)} className="text-violet-500">
                            <DownloadIcon className="h-5 w-5 hover:text-violet-700" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View and Edit Pages */}
        {(selectedRegistration || isEditing) && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl mb-4 font-bold text-gray-800">{isEditing ? 'Edit Registration' : 'User Details'}</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Name: </span> {selectedRegistration?.name}</p>
              <p><span className="font-semibold">Email: </span> {selectedRegistration?.email}</p>
              <p><span className="font-semibold">Gender: </span> {selectedRegistration?.gender}</p>
              <p><span className="font-semibold">D.O.B: </span> {selectedRegistration?.dob}</p>
              <p><span className="font-semibold">Age: </span> {isEditing?calculateAge(selectedRegistration.dob):selectedRegistration?.age}</p> {/* Render Age */}
              <p><span className="font-semibold">Event: </span> {selectedRegistration?.event}</p>
              <p><span className="font-semibold">Proof: </span>
                {selectedRegistration?.filePath ? (
                 <a href={`http://localhost:8080${selectedRegistration.filePath}`} target="_blank" rel="noopener noreferrer" className='text-blue-500 hover:underline'>
                 View proof
               </a>               
                ) : (
                  'No proof uploaded'
                )}
              </p>
              <p><span className="font-semibold">Price: </span> {selectedRegistration?.price}</p>
              <p><span className="font-semibold">Payment_Id: </span> {selectedRegistration?.payment_id}</p>
              <p><span className="font-semibold">Order_id: </span> {selectedRegistration?.order_id}</p>

              {isEditing && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const updatedData = {
                    name: selectedRegistration.name,
                    email: selectedRegistration.email,
                    gender: selectedRegistration.gender,
                    dob: selectedRegistration.dob,
                    event: selectedRegistration.event,
                    price: selectedRegistration.price,
                    age: calculateAge(selectedRegistration.dob),
                  };
                  saveRegistration(updatedData);
                }} className="mt-4 space-y-4">
                  <div>
                    <label className="block mb-2 font-bold">Name:</label>
                    <input
                      type="text"
                      value={selectedRegistration.name}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, name: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">Email:</label>
                    <input
                      type="email"
                      value={selectedRegistration.email}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, email: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">Gender:</label>
                    <input
                      type="text"
                      value={selectedRegistration.gender}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, gender: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">DOB:</label>
                    <input
                      type="date"
                      value={selectedRegistration.dob}
                      onChange={(e) =>{
                      setSelectedRegistration({ ...selectedRegistration, dob: e.target.value })
                      setSelectedRegistration((prev) => ({
                        ...prev,
                        age: calculateAge(e.target.value),
                      }));
                      }}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">Age:</label>
                    <input
                      type="number"
                      value={selectedRegistration.age}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, age: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">Event:</label>
                    <input
                      type="text"
                      value={selectedRegistration.event}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, event: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">Price:</label>
                    <input
                      type="number"
                      value={selectedRegistration.price}
                      onChange={(e) => setSelectedRegistration({ ...selectedRegistration, price: e.target.value })}
                      className="w-full p-2 border"
                    />
                  </div>

                  <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded mr-4">Save</button>
                  <button
                    type="button"
                    onClick={handleBack}  // Reuse the handleBack function
                    className="bg-gray-500 text-white py-2 px-4 rounded"
                  >
                    Back
                  </button>
                </form>
              )}

              {!isEditing && (
                <button
                  onClick={handleBack}
                  className="mt-4 bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
