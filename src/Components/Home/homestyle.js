import { makeStyles } from '@mui/styles';
import section1 from '../../img/section1.jpg';
    
const useStyles = makeStyles((theme) => ({
    section1: {
        alignItems: 'right',
        height: '100vh', // Full height of the viewport
        padding: '40px 0', // Remove side padding
        backgroundImage: `url(${section1})`, // Use the imported image
        backgroundposition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: 'black',

    },
    s1H1: {
        fontSize: '3rem', // Increase the size of h1
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)', // Add shadow for better visibility 
        '@media (max-width: 768px)': {
        fontSize: '2rem', // Reduce font size on mobile
        maxWidth: '50%'
        },
    },

    s1H2: {
        fontSize: '2rem', // Increase the size of h2
        fontWeight: '500',  
        '@media (max-width: 768px)': {
        fontSize: '2rem', // Reduce font size on mobile
        maxWidth: '50%'
        },
    },
    s1p:{
        '@media (max-width: 768px)': {
        maxWidth: '50%'
        },
    },
    column: {
        flex: '1 1 calc(33.33% - 20px)', // Each card takes up 1/3 of the row with spacing
            borderRadius: '10px',
            paddingRight: '20px',
            marginRight: '20%',
            marginTop: '10%',
            maxWidth: '38%',
            padding: '20px',
            float: 'right',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '@media (max-width: 768px)': { // Adjusts layout for tablets & smaller screens
                flex: '1 1 calc(90% - 20px)', // Each card takes full width
                margin: '30% auto', // Center the column
                maxWidth: '80%', // Prevents clipping on smaller screens
            },
        
    },
    uploadSection: {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    fileInput: {
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        width: '300px',
        height: '40px',
        alignContent: 'center',
        backgroundColor: '#fff',
    },
    uploadButton: {
        padding: '10px 20px',
        fontSize: '1.5rem',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#0056b3',
        },
    },

    container: {
        background: 'linear-gradient(to right, #d3d3c4 35%, #b2b2a6 60% )',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        margin: '0',
    },
    s2h2:{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '20px', // Add spacing below the h2
            textAlign: 'center', // Optional: Center-align the text
            color: 'black', // Change text color to white
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)', // Add shadow for better visibility
            marginTop: '20px', // Add spacing above the h2
            padding: '20px', // Add padding around the h2
            borderRadius: '10px', // Optional: Add rounded corners
            maxWidth: '800px', // Optional: Limit the width of the h2
            margin: '0 auto', // Optional: Center the h2
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', // Optional: Add a shadow effect
            textTransform: 'uppercase', // Optional: Make the text uppercase
            letterSpacing: '1px', // Optional: Add letter spacing
            fontFamily: 'Arial, sans-serif', // Optional: Change the font family
            fontWeight: 'bold', // Optional: Make the text bold
            lineHeight: '1.5', // Optional: Adjust line height
            textAlign: 'center', // Optional: Center the text
        },
        jobsection: {
            display: 'flex', // Use flexbox to arrange cards in a row
            flexWrap: 'wrap', // Allow wrapping if there are too many card
            justifyContent: 'center', // Centers content for better alignment
            gap: '20px', // Maintains spacing between job cards
            paddingBottom: '10px', // Centers the job section
        },
        jobCard: {
            flex: '1 1 calc(33.33% - 20px)', // Each card takes up 1/3 of the row with spacing
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '28%',
            backgroundColor: 'whitesmoke',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '@media (max-width: 768px)': { // Adjusts layout for tablets & smaller screens
                flex: '1 1 calc(90% - 20px)', // Each card takes full width
                maxWidth: '90%', // Prevents clipping on smaller screens
    },
        },
        jobTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        companyName: {
            fontSize: '1rem',
            marginBottom: '10px',
        },
        jobDetails: {
            fontSize: '0.9rem',
            marginBottom: '15px',
        },
        applyButton: {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#0056b3',
            },
        },
}));

export default useStyles;