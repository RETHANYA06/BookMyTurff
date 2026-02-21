import React from 'react';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                background: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                color: 'var(--danger)'
            }}>
                <FiLock size={60} />
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Access Denied</h1>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                maxWidth: '450px',
                marginBottom: '40px'
            }}>
                You don't have the required permissions to view this page.
                Please contact our support if you believe this is a mistake.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                style={{ padding: '15px 40px', borderRadius: '30px' }}
            >
                <FiArrowLeft /> Go Back
            </button>
        </div>
    );
};

export default AccessDenied;
