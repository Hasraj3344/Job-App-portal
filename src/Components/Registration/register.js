import React, { useState } from 'react';
import './register.css'; // Import the CSS file for styling
import { supabase } from '../Database/supabaseClient'; // Ensure this path is correct

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneno: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        education: '',
        major: '',
        experience: '',
        skills: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form...');

        setSuccessMessage('');
        setErrorMessage('');

        // ✅ Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('❌ Passwords do not match!');
            return setFormData({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                confirmPassword: '',
                phoneno: '',
                gender: '',
                address: '',
                city: '',
                state: '',
                country: '',
                zipcode: '',
                education: '',
                major: '',
                experience: '',
                skills: '',
            });
        }

        try {
            // ✅ Step 1: Register the user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            const authId = authData.user.id; // Retrieve Supabase Auth `auth_id`

            // ✅ Step 2: Insert user data into `users` table with `auth_id`
            const { error: dbError } = await supabase.from('users').insert([
                {
                    auth_id: authId, // Store auth_id
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    phoneno: formData.phoneno,
                    gender: formData.gender,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    zipcode: formData.zipcode,
                    education: formData.education,
                    major: formData.major,
                    experience: formData.experience,
                    skills: formData.skills.split(',').map(skill => skill.trim()),
                },
            ]);

            if (dbError) throw dbError;

            console.log('✅ User registered successfully:', authData);
            setSuccessMessage('Registration successful!');
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000); // 2-second delay to show success message
            
            

        } catch (err) {
            console.error('❌ Registration failed:', err.message || err);
            setErrorMessage(err.message.includes('duplicate key value') ? 'An account with this email already exists.' : 'Error registering user.');
        }
    };
return (
    <div className="registration-page">
            <div className="registration-form-container">
                    <h2>Job Application Registration</h2>
                    <form onSubmit={handleSubmit}>
                            <div>
                                    <label>First Name:</label>
                                    <input type="text" name="firstname" value={formData.firsname} onChange={handleChange} required/>
                            </div>
                            <div>
                                    <label>Last Name:</label>
                                    <input
                                            type="text"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Email:</label>
                                    <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Password:</label>
                                    <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Confirm Password:</label>
                                    <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Phone:</label>
                                    <input
                                            type="tel"
                                            name="phoneno"
                                            value={formData.phoneno}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Gender:</label>
                                    <select 
                                            name="gender" 
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                    >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                    </select>
                            </div>
                            <div>
                                    <label>Address:</label>
                                    <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                    ></textarea>
                            </div>
                            <div>
                                    <label>City:</label>
                                    <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                    ></input>
                            </div>
                            <div>
                                    <label>State:</label>
                                    <select 
                                            name="state" 
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                    >
                                            <option value="">Select State</option>
                                            <option value="Alabama">Alabama</option>
                                            <option value="Alaska">Alaska</option>
                                            <option value="Arizona">Arizona</option>
                                            <option value="Arkansas">Arkansas</option>
                                            <option value="California">California</option>
                                            <option value="Colorado">Colorado</option>
                                            <option value="Connecticut">Connecticut</option>
                                            <option value="Delaware">Delaware</option>
                                            <option value="Florida">Florida</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Hawaii">Hawaii</option>
                                            <option value="Idaho">Idaho</option>
                                            <option value="Illinois">Illinois</option>
                                            <option value="Indiana">Indiana</option>
                                            <option value="Iowa">Iowa</option>
                                            <option value="Kansas">Kansas</option>
                                            <option value="Kentucky">Kentucky</option>
                                            <option value="Louisiana">Louisiana</option>
                                            <option value="Maine">Maine</option>
                                            <option value="Maryland">Maryland</option>
                                            <option value="Massachusetts">Massachusetts</option>
                                            <option value="Michigan">Michigan</option>
                                            <option value="Minnesota">Minnesota</option>
                                            <option value="Mississippi">Mississippi</option>
                                            <option value="Missouri">Missouri</option>
                                            <option value="Montana">Montana</option>
                                            <option value="Nebraska">Nebraska</option>
                                            <option value="Nevada">Nevada</option>
                                            <option value="New Hampshire">New Hampshire</option>
                                            <option value="New Jersey">New Jersey</option>
                                            <option value="New Mexico">New Mexico</option>
                                            <option value="New York">New York</option>
                                            <option value="North Carolina">North Carolina</option>
                                            <option value="North Dakota">North Dakota</option>
                                            <option value="Ohio">Ohio</option>
                                            <option value="Oklahoma">Oklahoma</option>
                                            <option value="Oregon">Oregon</option>
                                            <option value="Pennsylvania">Pennsylvania</option>
                                            <option value="Rhode Island">Rhode Island</option>
                                            <option value="South Carolina">South Carolina</option>
                                            <option value="South Dakota">South Dakota</option>
                                            <option value="Tennessee">Tennessee</option>
                                            <option value="Texas">Texas</option>
                                            <option value="Utah">Utah</option>
                                            <option value="Vermont">Vermont</option>
                                            <option value="Virginia">Virginia</option>
                                            <option value="Washington">Washington</option>
                                            <option value="West Virginia">West Virginia</option>
                                            <option value="Wisconsin">Wisconsin</option>
                                            <option value="Wyoming">Wyoming</option>
                                    </select>
                            </div>
                            <div>
                                    <label>Country:</label>
                                    <input
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                    ></input>
                            </div>
                            <div>
                                    <label>Zipcode:</label>
                                    <input
                                            type="number"
                                            name="zipcode"
                                            value={formData.zipcode}
                                            onChange={handleChange}
                                            required
                                    ></input>
                            </div>
                            <div>
                                    <label>Education Level:</label>
                                    <input
                                            type="text"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <div>
                                    <label>Major:</label>
                                    <input
                                            name="major"
                                            value={formData.major}
                                            onChange={handleChange}
                                            required
                                    ></input>
                            </div>
                            <div>
                                    <label>Experience:</label>
                                    <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                    />
                            </div>
                            <div>
                                    <label>Skills:</label>
                                    <input
                                            name="skills"
                                            placeholder='Enter skills separated by commas'
                                            type="text"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            required
                                    />
                            </div>
                            <button type="submit">Register</button>
                    </form>
                    <div className="tologin">
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>
            </div>
    </div>
);
};

export default Register;