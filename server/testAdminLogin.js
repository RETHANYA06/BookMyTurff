const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/login', {
            email: 'admin@bookmyturf.com',
            password: 'adminpassword'
        });
        console.log('Login successful!');
        console.log('User role:', response.data.role);
        console.log('User data:', JSON.stringify(response.data.user, null, 2));
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
    }
}

testLogin();
