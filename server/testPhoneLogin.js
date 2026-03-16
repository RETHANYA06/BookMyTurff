const axios = require('axios');

async function testPlayerLogin() {
    try {
        // Assuming a player exists or we use one we know
        const response = await axios.post('http://localhost:5000/api/login', {
            phone_number: '9999999999', // The admin also has this phone number
            password: 'adminpassword'
        });
        console.log('Player Login successful!');
        console.log('User role:', response.data.role);
    } catch (error) {
        console.error('Player Login failed:', error.response?.data || error.message);
    }
}

testPlayerLogin();
