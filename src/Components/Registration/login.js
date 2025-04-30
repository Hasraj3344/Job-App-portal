import React, { useState } from "react";
import login from "../../img/login.jpg"; 
import { supabase } from '../Database/supabaseClient.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate(); // ✅ Move this here (top level)
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log("Attempting login:", { email, password });

const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password: password.trim(),
});

console.log("Supabase response:", { data, error });


            if (error) {
                setErrorMessage(error.message);
            } else {
                setSuccessMessage('Logged in successfully!');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h2>Login</h2>
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                </form>
            </div>
        </section>
    );
};

const styles = {
    section: {
        backgroundImage: `url(${login})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
    },
    container: {
        maxWidth: "500px",
        width: "100%",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    inputGroup: {
        marginBottom: "15px",
        textAlign: "left",
        padding: "15px",
    },
    input: {
        width: "100%",
        padding: "8px",
        marginTop: "5px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    button: {
        padding: "10px 15px",
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

export default Login;
