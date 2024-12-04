// src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Adjust this to your actual backend URL

// Fetch all users
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data; // Ensure response includes paymentStatus
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};

// Delete a user by ID
const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_URL}/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};

export default {
  fetchUsers,
  deleteUser,
};
