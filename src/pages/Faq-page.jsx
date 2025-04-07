import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiChevronDown, FiExternalLink, FiShield, FiDollarSign, FiUserCheck } from "react-icons/fi";
import { SiBitcoin } from "react-icons/si";  // Correct the case to lowercase 'si'
import { useNavigate } from 'react-router-dom';


const CheetahXFAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const faqRefs = useRef([]);

  // FAQ data structured for easy maintenance and localization
  const faqSections = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'How do I create an account on CheetahX?',
          answer: 'Click the "Sign Up" button and complete the verification process. You\'ll need to provide basic information and verify your email address. For vendor accounts, additional verification is required.'
        },
        {
          question: 'What\'s the difference between a regular user and a vendor?',
          answer: 'Regular users can buy and sell crypto in individual trades. Vendors can create ongoing trade offers and appear in our vendor directory. Vendor accounts require identity verification and a small security deposit.'
        },
        {
          question: 'Is there a fee to use CheetahX?',
          answer: 'For regular users, trading is free. Vendors pay a small fee (0.5%) on completed trades. There are never any hidden charges or withdrawal fees.'
        }
      ]
    },
    {
      title: 'Security & Trust',
      items: [
        {
          question: 'How does CheetahX protect my funds?',
          answer: 'CheetahX is a non-custodial platform - we never hold user funds. All trades are secured by our escrow system when needed, and we offer dispute resolution. For high-value trades, we recommend using our multi-sig options.'
        },
        {
          question: 'What verification is required?',
          answer: 'Basic email verification is required for all users. For vendors, we require government-issued ID, proof of address, and sometimes a video verification. All data is encrypted and stored securely.'
        },
        {
          question: 'How does the escrow system work?',
          answer: 'For crypto trades, the seller\'s coins are locked in escrow until payment is confirmed. For fiat trades, the buyer\'s funds are held by a trusted third-party escrow service until both parties confirm the trade is complete.'
        }
      ]
    },
    {
      title: 'Trading Process',
      items: [
        {
          question: 'How do I start a trade?',
          answer: 'Browse offers from vendors or create your own. When you find an offer you like, click "Start Trade" and follow the instructions. Our system will guide you through the secure trading process.'
        },
        {
          question: 'What payment methods are supported?',
          answer: 'We support bank transfers, PayPal, Venmo, Cash App, gift cards, and over 50 other payment methods depending on your region. Each vendor sets their own accepted payment options.'
        },
        {
          question: 'How long does a typical trade take?',
          answer: 'Crypto-to-crypto trades usually complete in 5-15 minutes. Fiat trades depend on the payment method - bank transfers may take 1-3 days while digital payments are typically under an hour.'
        }
      ]
    },
    {
      title: 'Vendor Accounts',
      items: [
        {
          question: 'How do I become a vendor?',
          answer: 'Apply through your account dashboard after completing basic verification. Our team reviews applications within 24-48 hours. Approved vendors must complete full KYC and post a security deposit (fully refundable when you stop vending).'
        },
        {
          question: 'What are the benefits of being a vendor?',
          answer: 'Vendors get premium placement in search results, ability to create multiple trade offers, lower fees at higher volumes, access to our vendor analytics dashboard, and a verified badge that builds trust with traders.'
        },
        {
          question: 'What are the requirements to maintain vendor status?',
          answer: 'Vendors must maintain a 95%+ completion rate, respond to trades within 15 minutes during active hours, keep sufficient security deposit, and follow all platform rules. We provide tools to help you meet these standards.'
        }
      ]
    }
  ];
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  // Accessibility improvements
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  // Auto-scroll to opened FAQ for better UX
  useEffect(() => {
    if (activeIndex !== null && faqRefs.current[activeIndex]) {
      faqRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  // Get appropriate icon for each section
  const getSectionIcon = (title) => {
    switch(title) {
      case 'Security & Trust':
        return <FiShield />;
      case 'Trading Process':
        return <FiDollarSign />;
      case 'Vendor Accounts':
        return <FiUserCheck />;
      default:
        return <SiBitcoin />;
    }
  };

  return (
    <FAQContainer>
      <Header>
        <h2>CheetahX Knowledge Base</h2>
        <p>Everything you need to know about trading crypto and fiat securely</p>
      </Header>
      
      <SearchBox>
        <input type="text" placeholder="Search FAQs..." />
        <button>Search</button>
      </SearchBox>

      <FAQGrid>
        {faqSections.map((section, sectionIndex) => (
          <Section key={sectionIndex}>
            <SectionHeader>
              <SectionIcon>
                {getSectionIcon(section.title)}
              </SectionIcon>
              <h3>{section.title}</h3>
            </SectionHeader>
            <FAQList>
              {section.items.map((item, itemIndex) => {
                const globalIndex = faqSections.slice(0, sectionIndex).reduce((acc, curr) => acc + curr.items.length, 0) + itemIndex;
                const isActive = activeIndex === globalIndex;
                
                return (
                  <FAQItem 
                    key={itemIndex}
                    ref={el => faqRefs.current[globalIndex] = el}
                    isActive={isActive}
                  >
                    <FAQQuestion 
                      onClick={() => toggleFAQ(globalIndex)}
                      onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                      tabIndex="0"
                      aria-expanded={isActive}
                      aria-controls={`faq-answer-${globalIndex}`}
                    >
                      <span>{item.question}</span>
                      <ChevronIcon isActive={isActive}>
                        <FiChevronDown />
                      </ChevronIcon>
                    </FAQQuestion>
                    <FAQAnswer 
                      id={`faq-answer-${globalIndex}`}
                      isActive={isActive}
                      aria-hidden={!isActive}
                    >
                      <p>{item.answer}</p>
                      {item.link && (
                        <LearnMoreLink href={item.link} target="_blank" rel="noopener noreferrer">
                          Learn more <FiExternalLink />
                        </LearnMoreLink>
                      )}
                    </FAQAnswer>
                  </FAQItem>
                );
              })}
            </FAQList>
          </Section>
        ))}
      </FAQGrid>

      <SupportCTA>
        <h3>Still have questions?</h3>
        <p>Our support team is available 24/7 to help you with any issues.</p>
        <CTAButton onClick={() => navigate('/support')}>Contact Support</CTAButton>
      </SupportCTA>
    </FAQContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotateOpen = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
`;

const rotateClose = keyframes`
  from { transform: rotate(180deg); }
  to { transform: rotate(0deg); }
`;

// Styled Components
const FAQContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #FF7B25 0%, #FF4D00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SearchBox = styled.div`
  display: flex;
  max-width: 600px;
  margin: 0 auto 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  
  input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: none;
    font-size: 1rem;
    outline: none;
    
    &::placeholder {
      color: #999;
    }
  }
  
  button {
    background: linear-gradient(90deg, #FF7B25 0%, #FF4D00 100%);
    color: white;
    border: none;
    padding: 0 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    color: #1a1a1a;
  }
`;

const SectionIcon = styled.div`
  margin-right: 1rem;
  background: linear-gradient(135deg, #FF7B25 0%, #FF4D00 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const FAQList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FAQItem = styled.li`
  margin-bottom: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  background: ${props => props.isActive ? '#fff9f6' : 'transparent'};
  border: 1px solid ${props => props.isActive ? '#ffe8dc' : '#f0f0f0'};
`;

const FAQQuestion = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #fff9f6;
  }
  
  span {
    flex: 1;
    margin-right: 1rem;
  }
`;

const ChevronIcon = styled.span`
  transition: all 0.3s;
  transform: ${props => props.isActive ? 'rotate(180deg)' : 'rotate(0deg)'};
  animation: ${props => props.isActive ? rotateOpen : rotateClose} 0.3s ease;
  color: #FF7B25;
`;

const FAQAnswer = styled.div`
  padding: ${props => props.isActive ? '1rem 1.25rem 1.5rem' : '0 1.25rem'};
  max-height: ${props => props.isActive ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isActive ? '1' : '0'};
  animation: ${props => props.isActive ? fadeIn : 'none'} 0.3s ease;
  border-top: ${props => props.isActive ? '1px solid #ffe8dc' : 'none'};
  
  p {
    margin: 0;
    color: #555;
    line-height: 1.6;
  }
`;

const LearnMoreLink = styled.a`
  display: inline-flex;
  align-items: center;
  margin-top: 0.75rem;
  color: #FF7B25;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    color: #FF4D00;
    text-decoration: underline;
  }
  
  svg {
    margin-left: 0.3rem;
    font-size: 0.9rem;
  }
`;

const SupportCTA = styled.div`
  text-align: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }
  
  p {
    color: #666;
    max-width: 500px;
    margin: 0 auto 1.5rem;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(90deg, #FF7B25 0%, #FF4D00 100%);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 123, 37, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 123, 37, 0.4);
  }
`;

export default CheetahXFAQ;