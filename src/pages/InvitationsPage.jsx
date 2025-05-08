import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { PeopleAlt, ContentCopy, Share, MonetizationOn } from '@mui/icons-material';

const InvitationsPage = () => {
  // Generate a simple referral code based on user ID (mock)
  const generateReferralCode = () => {
    const userId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF-${userId}`;
  };

  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState({
    totalReferrals: 12,
    activeReferrals: 5,
    earnedAmount: 25.00
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setReferralCode(generateReferralCode());
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const referralLink = `https://p2p-frontend-rfhu.vercel.app/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSnackbar({
      open: true,
      message: 'Referral link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on this awesome platform!',
          text: 'Sign up using my referral link and we both get rewards!',
          url: referralLink,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Invite Friends & Earn
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#666', mb: 3 }}>
        Share your referral link and earn rewards when your friends sign up and complete their first transaction.
      </Typography>

      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 4,
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
          Your Referral Link
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center', 
          mt: 2,
          '@media (max-width: 600px)': {
            flexDirection: 'column'
          }
        }}>
          <TextField
            value={referralLink}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: {
                backgroundColor: '#f9f9f9'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<ContentCopy />}
            onClick={handleCopyLink}
            sx={{ 
              whiteSpace: 'nowrap',
              borderRadius: '8px',
              px: 3,
              py: 1.5
            }}
          >
            Copy
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Share />}
            onClick={handleShare}
            sx={{ 
              whiteSpace: 'nowrap',
              borderRadius: '8px',
              px: 3,
              py: 1.5
            }}
          >
            Share
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <PeopleAlt color="primary" sx={{ mr: 1 }} />, 
            title: 'Total Referrals', 
            value: stats.totalReferrals },
          { icon: <PeopleAlt color="success" sx={{ mr: 1 }} />, 
            title: 'Active Referrals', 
            value: stats.activeReferrals },
          { icon: <MonetizationOn color="warning" sx={{ mr: 1 }} />, 
            title: 'Earned', 
            value: `$${stats.earnedAmount.toFixed(2)}` }
        ].map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ 
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ fontWeight: '600' }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: '700' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={3} sx={{ 
        p: 3,
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
          How It Works
        </Typography>
        <Divider sx={{ my: 2, backgroundColor: '#eee' }} />
        {[
          'Share your unique referral link with friends',
          'They sign up using your link',
          'They complete their first transaction (minimum $10)',
          'You earn $5 for each qualified referral'
        ].map((step, index) => (
          <Typography variant="body1" key={index} sx={{ mb: 2 }}>
            <strong>{index + 1}.</strong> {step}
          </Typography>
        ))}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvitationsPage;