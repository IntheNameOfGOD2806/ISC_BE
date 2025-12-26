const express = require('express');
const router = express.Router();
const payosService = require('../services/payos.service');
const { authenticate } = require('../middlewares/authenticate');

// Test endpoint to check PayOS configuration
router.get('/test-config', (req, res) => {
  res.json({
    status: 'success',
    data: {
      hasClientId: !!process.env.PAYOS_CLIENT_ID,
      hasApiKey: !!process.env.PAYOS_API_KEY,
      hasChecksumKey: !!process.env.PAYOS_CHECKSUM_KEY,
      clientIdLength: process.env.PAYOS_CLIENT_ID ? process.env.PAYOS_CLIENT_ID.length : 0,
      apiKeyLength: process.env.PAYOS_API_KEY ? process.env.PAYOS_API_KEY.length : 0,
      checksumKeyLength: process.env.PAYOS_CHECKSUM_KEY ? process.env.PAYOS_CHECKSUM_KEY.length : 0,
    }
  });
});

// Create payment link (authenticated)
router.post('/create-payment-link', async (req, res) => {
  // console.log(2342422)
  try {
    console.log('PayOS create payment link request:', {
      body: req.body,
      hasClientId: !!process.env.PAYOS_CLIENT_ID,
      hasApiKey: !!process.env.PAYOS_API_KEY,
      hasChecksumKey: !!process.env.PAYOS_CHECKSUM_KEY
    });

    const {
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl, 
      productName,
      price
    } = req.body;

    // Validate required fields
    // if (!productName || !price) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'productName and price are required'
    //   });
    // }

    const result = await payosService.createPaymentLink({
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      // productName,
      // price
    });

    console.log('PayOS service result:', result);

    if (result.success) {
      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to create payment link',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get payment info (authenticated)
router.get('/order/:orderCode', authenticate, async (req, res) => {
  try {
    const { orderCode } = req.params;

    const result = await payosService.getPaymentInfo(orderCode);

    if (result.success) {
      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to get payment info',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Cancel payment (authenticated)
router.post('/cancel/:orderCode', authenticate, async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { cancellationReason } = req.body;

    const result = await payosService.cancelPayment(orderCode, cancellationReason);

    if (result.success) {
      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to cancel payment',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get bank list (public)
router.get('/banks', async (req, res) => {
  try {
    const result = await payosService.getBankList();

    if (result.success) {
      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to get bank list',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get bank list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
