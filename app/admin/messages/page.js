'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Trash2, Mail, Phone, Clock, User, Tag } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function AdminMessages() {
    const showToast = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            showToast('Error fetching messages: ' + error.message, 'error');
        } else {
            setMessages(data || []);
        }
        setLoading(false);
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this message? This cannot be undone.')) return;
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (error) {
            showToast('Error: ' + error.message, 'error');
        } else {
            showToast('Message deleted successfully.', 'success');
            fetchMessages();
        }
    };

    return (
        <div className="admin-section active">
            <div className="messages-header">
                <div className="header-left">
                    <div className="title-area">
                        <MessageSquare size={28} className="title-icon" />
                        <div>
                            <h1>Inbound Inquiries</h1>
                            <p>Direct communication from clients and partners</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <div className="stat-badge glass-panel">
                        <span className="count">{messages.length}</span>
                        <span className="label">Total Messages</span>
                    </div>
                </div>
            </div>
            
            <div className="messages-grid">
                {loading ? (
                    <div className="loader-container glass-panel">
                        <div className="premium-loader"></div>
                        <p>Synchronizing communications...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((m) => (
                        <div key={m.id} className="message-card glass-panel">
                            <div className="card-top">
                                <div className="sender-profile">
                                    <div className="avatar-hex">
                                        {m.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="sender-details">
                                        <h4>{m.name}</h4>
                                        <div className="timestamp">
                                            <Clock size={12} />
                                            <span>{new Date(m.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn-delete" onClick={() => handleDelete(m.id)} title="Archive Message">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="card-middle">
                                <div className="subject-pill">
                                    <Tag size={12} />
                                    <span>{m.subject || 'General Inquiry'}</span>
                                </div>
                                <p className="message-text">{m.message}</p>
                            </div>
                            
                            <div className="card-bottom">
                                <div className="contact-methods">
                                    <a href={`mailto:${m.email}`} className="contact-item" title="Send Email">
                                        <Mail size={14} />
                                        <span>{m.email}</span>
                                    </a>
                                    {m.phone && (
                                        <a href={`tel:${m.phone}`} className="contact-item" title="Call Number">
                                            <Phone size={14} />
                                            <span>{m.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass-panel">
                        <MessageSquare size={64} className="empty-icon" />
                        <h3>Crystal Clear</h3>
                        <p>Your inbox is currently empty. New inquiries will appear here automatically.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .admin-section {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .messages-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .title-area {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .title-icon {
                    color: var(--accent);
                    padding: 10px;
                    background: rgba(52, 152, 219, 0.1);
                    border-radius: 12px;
                }

                h1 {
                    font-size: 24px;
                    color: var(--secondary);
                    margin: 0;
                }

                p {
                    color: var(--text-muted);
                    margin: 5px 0 0 0;
                    font-size: 14px;
                }

                .stat-badge {
                    padding: 10px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 120px;
                }

                .stat-badge .count {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--accent);
                }

                .stat-badge .label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                }

                .messages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 25px;
                }

                .message-card {
                    padding: 25px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .message-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .sender-profile {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .avatar-hex {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, var(--accent), #2980b9);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 18px;
                    border-radius: 12px;
                    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
                }

                .sender-details h4 {
                    margin: 0;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                }

                .timestamp {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                .btn-delete {
                    background: rgba(231, 76, 60, 0.05);
                    border: 1px solid rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-delete:hover {
                    background: #e74c3c;
                    color: white;
                    transform: scale(1.05);
                }

                .card-middle {
                    flex: 1;
                    margin-bottom: 25px;
                }

                .subject-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(52, 152, 219, 0.1);
                    color: var(--accent);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 15px;
                }

                .message-text {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 6;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-bottom {
                    border-top: 1px solid var(--glass-border);
                    padding-top: 20px;
                }

                .contact-methods {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .contact-item:hover {
                    color: var(--accent);
                }

                .loader-container {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 100px !important;
                }

                .premium-loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(52, 152, 219, 0.1);
                    border-top: 3px solid var(--accent);
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    animation: spin 1s linear infinite;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 100px !important;
                    color: var(--text-muted);
                }

                .empty-icon {
                    opacity: 0.1;
                    margin-bottom: 25px;
                }

                .empty-state h3 {
                    color: white;
                    font-size: 20px;
                    margin-bottom: 10px;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .messages-grid {
                        grid-template-columns: 1fr;
                    }
                    .messages-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .stat-badge {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
