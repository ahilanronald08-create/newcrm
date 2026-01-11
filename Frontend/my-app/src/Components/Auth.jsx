import React, { useState,useEffect } from "react";
import Paper from "@mui/material/Paper";
import { Box, Typography, TextField, Button,useMediaQuery, } from "@mui/material";
import forturalogo from "../assets/fortura.svg";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
const Auth = ({setUser}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/addlead", { replace: true }); 
    }
  }, [navigate]);

  const handleAuth = async () => {
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    // Validation
    if (!email) {
      setEmailError("Email is required");
      setLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.email);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);
        
        // Update user state in App
        setUser({ email: data.user.email });
        
        // Navigate to addlead
        navigate("/addlead", { replace: true });
      } else {
        // Handle error from backend
        setPasswordError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setPasswordError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2, // mobile padding
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth:300,
          borderRadius: 3,
          px: 4,
          py: 5,
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box mb={3}>
          <img
            src={forturalogo}
            alt="Fortura Tech"
            style={{ height: 80 }}
          />
        </Box>

        {/* Heading */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome Back
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={4}>
          Sign in to continue
        </Typography>

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          error={!!emailError}
          helperText={emailError}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          error={!!passwordError}
          helperText={passwordError}
          disabled={loading}
          sx={{ mb: 3 }}
        />

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            py: 1.3,
            fontWeight: "bold",
            bgcolor: "#4A90E2",
            "&:hover": {
              bgcolor: "#357ABD",
            },
          }}
           onClick={handleAuth}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Paper>
    </Box>
  );
};

export default Auth;
