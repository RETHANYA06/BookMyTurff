const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/login', {
            email: 'admin@bookmyturf.com',
            password: 'adminpassword'
        });
        console.log('Login Success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Login Failed:', error.response?.status);
        console.log('Message:', error.response?.data?.message);
    }
};

testLogin();
