import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile = () => {
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // State for delete confirmation input

    // Fetch user data on page load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile'); // Fetch user profile
                if (response.data.success) {
                    setUserInput(response.data.user); // Populate form with user data
                } else {
                    toast.error('Failed to fetch profile.');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to fetch user profile.');
            }
        };
        fetchProfile();
    }, []);

    const handleInput = (e) => {
        setUserInput({
            ...userInput,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put('/api/user/profile', userInput); // Update user profile endpoint
            if (!response.data.success) {
                setLoading(false);
                toast.error(response.data.message);
                return;
            }
            toast.success('Profile updated successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const userConfirmation = window.prompt(
            'To delete your account, please type "CONFIRM". This action cannot be undone.'
        );
    
        if (userConfirmation !== 'CONFIRM') {
            toast.error('Account deletion canceled or incorrect confirmation input.');
            return;
        }
    
        setLoading(true);
        try {
            const response = await axios.delete('/api/user/profile'); // Delete user profile endpoint
            if (!response.data.success) {
                setLoading(false);
                toast.error(response.data.message);
                return;
            }
            toast.success('Account deleted successfully.');
            navigate('/login'); // Redirect to home or login after account deletion
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className='flex flex-col items-center justify-center max-w-full mx-auto'>
            <div className='z-10 p-6 w-[400px] rounded-lg shadow-lg bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
                <h1 className='text-3xl font-bold text-center text-gray-200'>
                    Profile
                    {/* <span className='text-transparent text-3xl bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 hover:animate-pulse'>LinkUp</span>  */}
                </h1>
                <form onSubmit={handleSubmit} className='flex flex-col text-white'>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Full Name:</span>
                        </label>
                        <input
                            id='fullname'
                            type='text'
                            value={userInput.fullname || ''}
                            onChange={handleInput}
                            placeholder='Enter your full name'
                            required
                            className='w-full input input-bordered h-10'
                        />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Username:</span>
                        </label>
                        <input
                            id='username'
                            type='text'
                            value={userInput.username || ''}
                            onChange={handleInput}
                            placeholder='Enter your username'
                            required
                            className='w-full input input-bordered h-10'
                        />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Email:</span>
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={userInput.email || ''}
                            onChange={handleInput}
                            placeholder='Enter your email'
                            required
                            className='w-full input input-bordered h-10'
                        />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Gender:</span>
                        </label>
                        <select
                            id='gender'
                            value={userInput.gender || ''}
                            onChange={handleInput}
                            required
                            className='w-full input input-bordered h-10'
                        >
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                        </select>
                    </div>
                    <button
                        type='submit'
                        className='mt-4 self-center w-auto px-2 py-1 bg-gray-950 text-lg hover:bg-gray-900 text-white rounded-lg hover:scale-105 hover:bg-green-800'
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
                
                    {/* <h2 className='text-lg font-bold text-red-600'>Danger Zone</h2>
                    <p className='text-sm text-gray-700 mt-2'>To delete your account, type "CONFIRM" in the box below and click "Delete Account."</p>
                    <input
                        type='text'
                        placeholder='Type CONFIRM to delete your account'
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className='mt-2 input input-bordered w-full text-red-700 border-red-600 h-10'
                    /> */}

                
<div className="pt-5 flex justify-between items-center">
    <p className="text-sm font-semibold text-gray-800">
        <Link to={'/'}>
            <span className="text-gray-950 font-bold underline cursor-pointer hover:text-green-950">
                Back to Home
            </span>
        </Link>
    </p>
    <button
        onClick={handleDeleteAccount}
        className="w-auto px-2 py-1 bg-red-600 text-sm hover:bg-red-700 text-white rounded-lg hover:scale-105"
        disabled={loading}
    >
        {loading ? "Deleting..." : "Delete Account"}
    </button>
</div>

               
            </div>
        </div>
    );
};

export default Profile;
