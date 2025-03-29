import React from 'react';
import '../styles/dashboard.css';
import profileImage from '../assets/cheetah-logo.png';

const Dashboard = () => {
    return (
        <div className="fiverr-dashboard">
            {/* Profile Header Section */}
            <div className="profile-header">
                <img src={profileImage} alt="Profile" className="profile-avatar" />
                <div className="profile-info">
                    <h1>Welcome, Emmanuel K.</h1>
                    <p className="welcome-message">Find important messages, tips, and links to helpful resources here:</p>
                </div>
            </div>

            {/* Level Overview Section */}
            <div className="level-overview">
                <h1>Level overview</h1>

                <div className="level-metrics">
                    <div className="metric-card">
                        <h3>My level</h3>
                        <p className="level-badge">New seller</p>
                    </div>

                    <div className="metric-card">
                        <h3>Success score</h3>
                        <p>-</p>
                    </div>

                    <div className="metric-card">
                        <h3>Rating</h3>
                        <p>-</p>
                    </div>

                    <div className="metric-card">
                        <h3>Response rate</h3>
                        <p>100%</p>
                    </div>
                </div>
            </div>

            {/* View Progress Section */}
            <div className="progress-section">
                <h2>View progress</h2>

                <div className="availability-card">
                    <h3>Availability</h3>
                    <p>While unavailable, your trades are hidden and you will not receive new orders.</p>
                    <button className="fiverr-button">Set your availability</button>
                </div>

                <div className="earnings-card">
                    <p>Earned in March</p>
                    <p className="earnings-amount">$0</p>
                </div>
            </div>

            {/* Upgrade Section */}
            <div className="upgrade-section">
                <h2>Upgrade Your Trading</h2>
            </div>

            {/* 3 Steps Section */}
            <div className="steps-card">
                <h2>3 steps to become a top trader on our platform</h2>
                <p>The key to your success in crypto trading is the brand you build through your reputation. We gathered tips to help you become a leading trader.</p>

                <div className="step">
                    <h3>Get noticed</h3>
                    <p>Tap into the power of social media by sharing your trades, and get expert help to grow your impact.</p>
                    <button className="fiverr-button secondary">Share Your Trades</button>
                </div>

                <div className="step">
                    <h3>Get more skills & exposure</h3>
                    <p>Hone your skills and expand your knowledge with online courses. You'll be able to offer more services and gain more exposure.</p>
                    <button className="fiverr-button simple">Explore Learn</button>
                </div>

                <div className="step">
                    <h3>Become a successful trader!</h3>
                    <p>Watch this free online course to learn how to create an outstanding trading experience and grow your career.</p>
                    <button className="fiverr-button secondary">Watch Free Course</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;