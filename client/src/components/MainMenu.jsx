import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainMenu.css';
import SearchIcon from '@mui/icons-material/Search';
import { ComposeEmail } from './ComposeEmail';

export const MainMenu = () => {
    // Mail states
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [emails, setEmails] = useState([]);
    const [shownEmail, setShownEmail] = useState(null);
    // Web states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [username] = useState(localStorage.getItem('username'));
    const [showCompose, setShowCompose] = useState(false);

    const navigate = useNavigate();

    const handleCloseCompose = () => {
        setShowCompose(false);
    };

    const handleCompose = () => {
        setShowCompose(true);
    };

    const handleSendEmail = async (emailData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/email/send_email`,
                emailData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Refresh inbox after sending
            await fetchEmails();
        } catch (error) {
            console.error('Error sending email:', error);
            throw error; // Propagate error to ComposeEmail component
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/');                     
    };

    // Inbox
    // Fetch emails
    const fetchEmails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/email/inbox`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEmails(response.data.emails);
            setLoading(false);
            setActiveFolder('inbox');
        } catch (error) {
            console.error('Error fetching emails:', error);
            setError('Could not load emails');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    // Handle email click
    const handleEmailClick = async (email) => {
        const emailData = await getEmail(email.id);
        setShownEmail(emailData);
        setSelectedEmail(email);
    };

    // Get email
    const getEmail = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/email/inbox/get_email?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching email:', error);
            return null;
        }
    }

    const fetchSent = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/email/sent`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEmails(response.data.emails);
            setActiveFolder('sent');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sent emails:', error);
            setError('Could not load sent emails');
            setLoading(false);
        }
    };

    const fetchDrafts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/email/drafts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEmails(response.data.emails);
            setActiveFolder('drafts');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching drafts:', error);
            setError('Could not load drafts');
            setLoading(false);
        }
    };

    const handleSaveDraft = async (emailData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/email/save-draft`,
                emailData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error('Error sending email:', error);
            throw error; // Propagate error to ComposeEmail component
        }
    };

    const fetchTrash = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/email/trash`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEmails(response.data.emails);
            setActiveFolder('trash');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching trash:', error);
            setError('Could not load trash');
            setLoading(false);
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Delete email
    const handleDelete = async () => {
        try {
            console.log('selectedEmail:', selectedEmail);
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/email/inbox/delete_email?id=${selectedEmail.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSelectedEmail(null);
            fetchEmails();
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    };

    return (
        <div className="mail-container">
            {/* Top Bar */}
            <div className="top-bar">
                <div className='app-name'>Mail App</div>
                <div className="search-bar">
                    <input type="text" placeholder="Search mail..." />
                    <button className="search-button">
                        <SearchIcon className="search-icon" />
                    </button>
                </div>
                <div className="user-info">{username}</div>
            </div>
            {/* Sidebar */}
            <div className="sidebar">
                <button className="compose-btn" onClick={()=>handleCompose()}>Compose</button>
                <ul className="folder-list">
                    <li onClick={()=>fetchEmails()} className={activeFolder === 'inbox' ? 'active' : ''}>Inbox</li>
                    <li onClick={()=>fetchSent()} className={activeFolder === 'sent' ? 'active' : ''}>Sent</li>
                    <li onClick={()=>fetchDrafts()} className={activeFolder === 'drafts' ? 'active' : ''}>Drafts</li>
                    <li onClick={()=>fetchTrash()} className={activeFolder === 'trash' ? 'active' : ''} >Trash</li>
                </ul>
                <button 
                    className="logout-btn"
                    onClick={handleLogout}
                >
                Logout</button>
            </div>

            {/* Email List */}
            <div className="email-list">
                <div className='email-control-buttons'>
                    <button className="control-button" onClick={() => handleDelete()}>
                        Delete
                    </button>
                    {/* <button className="control-button" onClick={() => handleRead()}>
                        <span className="control-icon">📨</span>
                        Mark as Read
                    </button> */}
                    <button className="control-button">
                        <span className="control-icon">📁</span>
                        Move to
                    </button>
                </div>
                <div className="email-list-container">
                    {emails && emails.length > 0 ? (
                        emails.map(email => (
                            <div key={email.id} className="email-item" onClick={() => handleEmailClick(email)}>
                                <div className="email-sender">{email.sender}</div>
                                <div className="email-subject">{email.subject}</div>
                                <div className="email-date">{email.timestamp}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-emails">No emails found</div>
                    )}
                </div>
            </div>

            {/* Email View */}
            <div className="email-view">
                {selectedEmail ? (
                    <div className="email-detail">
                        <h3>{selectedEmail.subject}</h3>
                        <div className="email-header">
                            <span>From: {shownEmail.sender}</span>
                            <span>{shownEmail.timestamp}</span>
                        </div>
                        <div className="email-body">
                            {shownEmail.body}
                        </div>
                    </div>
                ) : (
                    <div className="no-email-selected">
                        Select an email to read
                    </div>
                )}
            </div>
            {/* Compose */}
            {showCompose && (
                <ComposeEmail onClose={handleCloseCompose} onSend={handleSendEmail} onSaveDraft={handleSaveDraft}/>
            )}
        </div>
    );
}