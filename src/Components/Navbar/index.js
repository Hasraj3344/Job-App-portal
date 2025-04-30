import React, { useState, useEffect } from "react";
import { Link as LinkR, useLocation } from "react-router-dom";
import styled from "styled-components";
import { MenuRounded } from "@mui/icons-material";
import { supabase } from "../Database/supabaseClient"; // ✅ Make sure this path is correct

// ... your styled components remain the same

const Nav = styled.div`
  background-color: black;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  color: white;
`;
const ColorText = styled.div`
  color: #746382};
  font-size: 32px;
`;

const NavbarContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
`;
const NavLogo = styled(LinkR)`
  display: flex;
  align-items: center;
  width: 80%;
  padding: 0 6px;
  font-weight: 1000;
  font-size: 18px;
  text-decoration: none;
  color: inherit;
`;

const NavItems = styled.ul`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 0 6px;
  list-style: none;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color:White;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 0 6px;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const GithubButton = styled.a`
  border: 1px solid black;
  color: white;
  justify-content: center;
  display: flex;
  float: right;
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  text-decoration: none;
  background:rgb(65, 73, 84);
  &:hover {
    background: white;
    color: black;
  }
`;

const MobileIcon = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  color: rgb(65, 73, 84);
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 16px;
  padding: 0 6px;
  list-style: none;
  padding: 12px 40px 24px 40px;
  background: black;
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 768px;

  transition: all 0.3s ease-in-out;
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0)" : "translateY(-100%)"};
  border-radius: 0 0;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  opacity: ${({ isOpen }) => (isOpen ? "100%" : "0")};
  z-index: ${({ isOpen }) => (isOpen ? "1000" : "-1000")};
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const styles = {
  navbar: {
      backgroundColor: "#000", // Navbar background color
      height: "80px", // Navbar height
      display: "flex", // Flexbox for layout
      alignItems: "center", // Center items vertically
      justifyContent: "space-between", // Space between items
      padding: "0 20px", // Padding on left and right
      position: "sticky", // Sticky positioning
      top: 0, // Stick to the top
      zIndex: 10, // Ensure it stays above other content
  },
  hiddenNavbar: {
    display: "none", // Hide navbar for specific pages
  },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null); // ✅ Track logged in user
  const isLoginOrRegisterPage = location.pathname === "/login" || location.pathname === "/register";
  const [userName, setUserName] = useState("Guest"); // Default name


  // ✅ Check login state on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchUser();

    // ✅ Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Handle signout
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      alert("You have been signed out successfully.");
      window.location.href = "/"; // Redirect to home page
    } else {
      alert("Error signing out. Please try again.");
      console.error("Sign out error:", error);
    }
  };

  
  
  

  return (
    <Nav style={isLoginOrRegisterPage ? styles.hiddenNavbar : styles.navbar}>
      <NavbarContainer>
        <NavLogo to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        HOME
        </NavLogo>

        <MobileIcon onClick={() => setIsOpen(!isOpen)}>
          <MenuRounded style={{ color: "inherit" }} />
        </MobileIcon>

        <NavItems>
          <NavLink href="#about">AboutUs</NavLink>
          <NavLink href="#skills">ContactUs</NavLink>
          <NavLink href="/jobsearch">JobListings</NavLink>
          <NavLink href="#projects">Feedback</NavLink>
          <NavLink href="#education">Profile</NavLink>
          {!user && <NavLink href="/register">Register</NavLink>}
        </NavItems>

        {isOpen && (
          <MobileMenu isOpen={isOpen}>
            <NavLink onClick={() => setIsOpen(!isOpen)} href="#about">AboutUs</NavLink>
            <NavLink onClick={() => setIsOpen(!isOpen)} href="#skills">ContactUs</NavLink>
            <NavLink onClick={() => setIsOpen(!isOpen)} href="/jobsearch">Job Listings</NavLink>
            <NavLink onClick={() => setIsOpen(!isOpen)} href="#education">Feedback</NavLink>
            <NavLink onClick={() => setIsOpen(!isOpen)} href="#projects">Profile</NavLink>
            {!user && (
              <>
                <NavLink href="/register">Register</NavLink>
                <GithubButton href="/login">Sign IN</GithubButton>
              </>
            )}
            {user && (
              <GithubButton onClick={handleSignOut} href="#">Sign Out</GithubButton>
            )}
          </MobileMenu>
        )}

        <ButtonContainer>
          {!user ? (
            <GithubButton href="/login">Sign IN</GithubButton>
          ) : (
            <GithubButton onClick={handleSignOut} href="#">Sign Out</GithubButton>
          )}
        </ButtonContainer>
      </NavbarContainer>
    </Nav>
  );
};

export default Navbar;


