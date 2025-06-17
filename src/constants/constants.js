export const phoneRegex = /^01[0125][0-9]{8}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const englishNameRegex = /^[a-zA-Z\s]+$/;
// Fix the Arabic regex by removing quotes and fixing the pattern
export const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
// Properly combine the regexes
export const nameRegex = /^([a-zA-Z\s]+|[\u0600-\u06FF\s]+)$/;

export const emailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

// New regex patterns for address components
export const cityRegex = /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/; // Allow English and Arabic city names
export const streetRegex = /^[a-zA-Z0-9\u0600-\u06FF\s\.\,\-]{3,100}$/; // Allow English, Arabic, numbers and some special characters

// Date format regex for MM-DD-YYYY
export const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;

// Purchase Status Enums
export const PURCHASE_STATUS = {
  WAITING_PAYMENT: "Waiting Payment",
  STARTED: "Started",
  COMPLETED: "Completed",
  ENDED: "Ended",
  ENDED_WITHOUT_PURCHASE: "Ended without purchase",
};

// Customer Purchase Status Enums
export const CUSTOMER_PURCHASE_STATUS = {
  WAITING_PAYMENT: "Waiting payment",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ENDED_WITHOUT_PURCHASE: "Ended without purchase",
};

// Payment Status
export const paymentSuccessHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Payment Successful</title>
    <style>
      body {
        background: linear-gradient(to right, #00c6ff, #0072ff);
        color: white;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding-top: 100px;
      }
      .success-box {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 40px;
        display: inline-block;
        animation: pop 0.6s ease-out;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      h1 {
        font-size: 3em;
        margin-bottom: 0.2em;
      }
      p {
        font-size: 1.2em;
        margin-top: 0;
      }
      @keyframes pop {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .emoji {
        font-size: 4em;
        margin-bottom: 20px;
        animation: bounce 1.5s infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    </style>
  </head>
  <body>
    <div class="success-box">
      <div class="emoji">🎉</div>
      <h1>Payment Successful!</h1>
      <p>Thank you! Your transaction was completed successfully.</p>
      <p>🚀 Get ready for greatness!</p>
    </div>
  </body>
  </html>
`;
