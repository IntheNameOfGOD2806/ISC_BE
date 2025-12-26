const axios = require('axios');
const crypto = require('crypto');

// Import PayOS SDK
// let payOS;

// try {
//   const PayOS =  require('@payos/node');
//   payOS = new PayOS(
//     process.env.PAYOS_CLIENT_ID,
//     process.env.PAYOS_API_KEY,
//     process.env.PAYOS_CHECKSUM_KEY
//   );
//   console.log('PayOS SDK initialized successfully');
// } catch (error) {
//   console.warn('PayOS SDK not available dsfsf:', error.message);
//   console.warn('Falling back to manual API calls');
// }
class PayOSService {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID?.trim();
    this.apiKey = process.env.PAYOS_API_KEY?.trim();
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim();
    this.baseURL = "https://api-merchant.payos.vn";

    console.log("PayOS Service initialized with:", {
      hasClientId: !!this.clientId,
      hasApiKey: !!this.apiKey,
      hasChecksumKey: !!this.checksumKey,
      clientId: this.clientId
        ? `${this.clientId.substring(0, 8)}...`
        : "undefined",
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "undefined",
      checksumKey: this.checksumKey
        ? `${this.checksumKey.substring(0, 8)}...`
        : "undefined",
    });

    // Validate required credentials
    if (!this.clientId || !this.apiKey || !this.checksumKey) {
      console.warn(
        "PayOS credentials not configured. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY in environment variables."
      );
    }
  }

  /**
   * Generate signature for PayOS API requests
   */
  generateSignature(data) {
    if (!this.checksumKey) {
      throw new Error("PayOS checksum key is not configured");
    }

    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    return crypto
      .createHmac("sha256", this.checksumKey)
      .update(signatureString)
      .digest("hex");
  }

  /**
   * Create payment link
   */
  async createPaymentLink(orderData) {
    try {
      // Check if credentials are configured
      if (!this.clientId || !this.apiKey || !this.checksumKey) {
        return {
          success: false,
          error:
            "PayOS credentials not configured. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY environment variables.",
        };
      }

      const {
        orderCode,
        amount,
        description,
        returnUrl,
        cancelUrl,
        // items = []
      } = orderData;

      const paymentData = {
        orderCode: parseInt(orderCode),
        amount: parseInt(amount),
        description: description || `Payment for order ${orderCode}`,
        returnUrl: returnUrl || `${process.env.FRONTEND_URL}/checkout/success`,
        cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/checkout/cancel`,
        items: [
          {
            name: description || `Order ${orderCode}`,
            quantity: 1,
            price: parseInt(amount)
          }
        ]
      };

      // Generate signature according to PayOS spec: amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
      const signaturePayload = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
      const paymentSignature = crypto
        .createHmac('sha256', this.checksumKey)
        .update(signaturePayload)
        .digest('hex');

      // Add signature to payment data
      paymentData.signature = paymentSignature;

      console.log('PayOS Payment Data:', JSON.stringify(paymentData, null, 2));
      console.log('Signature Payload:', signaturePayload);
      console.log('Generated Signature:', paymentSignature);

      // Try using PayOS SDK first, fallback to manual API call
      // if (payOS) {
      //   try {
      //     const response = await payOS.createPaymentLink({
      //       ...paymentData,
      //     });

      //     return !!response?.checkoutUrl
      //       ? {
      //           success: true,
      //           data: response,
      //         }
      //       : {
      //           success: false,
      //           error: "PayOS create payment link error: " + response?.status,
      //         };
      //   } catch (sdkError) {
      //     console.warn('PayOS SDK failed, falling back to manual API:', sdkError.message);
      //   }
      // }

      // Fallback to manual API call - PayOS signature is already included in paymentData
      console.log('Using manual PayOS API call with payload:', paymentData);

      const response = await axios.post(
        `${this.baseURL}/v2/payment-requests`,
        paymentData,
        {
          headers: {
            'x-client-id': this.clientId,
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(
        "PayOS create payment link error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get payment information
   */
  async getPaymentInfo(orderCode) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v2/payment-requests/${orderCode}`,
        {
          headers: {
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "PayOS get payment info error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(orderCode, cancellationReason = "User cancelled") {
    try {
      const cancelData = {
        cancellationReason,
      };

      const response = await axios.post(
        `${this.baseURL}/v2/payment-requests/${orderCode}/cancel`,
        cancelData,
        {
          headers: {
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "PayOS cancel payment error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(webhookData, signature) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.checksumKey)
        .update(JSON.stringify(webhookData))
        .digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      console.error("PayOS webhook verification error:", error);
      return false;
    }
  }

  /**
   * Get bank list
   */
  async getBankList() {
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Get bank list error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}

module.exports = new PayOSService();
