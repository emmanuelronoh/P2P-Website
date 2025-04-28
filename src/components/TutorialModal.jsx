import React from "react";
import { useState } from 'react';
import '../styles/TutorialModal.css'; // We'll create this CSS file next

const TutorialModal = ({ showTutorial, closeTutorial }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to P2P Trading",
      content: "This tutorial will guide you through the process of buying and selling crypto with other users.",
      target: null
    },
    {
      title: "Buy/Sell Tabs",
      content: "Switch between buying and selling crypto using these tabs.",
      target: ".trading-tabs"
    },
    {
      title: "Order Book",
      content: "View available offers from other traders. You can filter and sort them to find the best deals.",
      target: ".orders-list"
    },
    {
      title: "Create Orders",
      content: "Place your own buy or sell orders that other traders can see and accept.",
      target: ".order-creation-section"
    },
    {
      title: "Your Orders",
      content: "Track all your active and past orders in this section.",
      target: ".user-orders-section"
    },
    {
      title: "Trade Chat",
      content: "When you initiate a trade, a secure chat opens where you can communicate with the other trader.",
      target: ".chat-container"
    }
  ];

  const nextTutorialStep = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevTutorialStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  if (!showTutorial) return null;

  return (
    <div className="tutorial-modal">
      <div className="tutorial-content">
        <h2>{tutorialSteps[activeStep].title}</h2>
        <p>{tutorialSteps[activeStep].content}</p>
        <div className="tutorial-progress">
          {activeStep > 0 && (
            <button onClick={prevTutorialStep} className="tutorial-nav-btn prev">
              Previous
            </button>
          )}
          {activeStep < tutorialSteps.length - 1 ? (
            <button onClick={nextTutorialStep} className="tutorial-nav-btn next">
              Next
            </button>
          ) : (
            <button onClick={closeTutorial} className="tutorial-nav-btn finish">
              Finish Tutorial
            </button>
          )}
        </div>
        <div className="tutorial-steps">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`step-indicator ${index === activeStep ? 'active' : ''}`}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
