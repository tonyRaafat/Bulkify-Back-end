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
  <meta charset="UTF-8">
  <title>Bulkify - Payment Success</title>
  <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f5f5f5;
      text-align: center;
    }

    header {
      background-color: #4CAF50;
      padding: 20px;
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .logo {
      font-size: 2rem;
      color: white;
    }

    .content {
      margin-top: 100px;
    }

    .card {
      background-color: white;
      margin: auto;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      display: inline-block;
    }

    .success-icon {
      font-size: 80px;
      color: #4CAF50;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    p {
      font-size: 1.2rem;
      color: #555;
      margin-bottom: 30px;
    }

    .btn {
      background-color: #4CAF50;
      color: white;
      padding: 14px 30px;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
    }

    .btn:hover {
      background-color: #43a047;
    }

    footer {
      margin-top: 100px;
      color: #888;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>

  <header>
    <span class="logo">bulkify</span> - Payment Success
  </header>

  <div class="content">
    <div class="card">
      <div class="success-icon">✅</div>
      <h1>Payment Successful!</h1>
      <p>Your transaction has been completed successfully.<br>Thank you for being part of the community purchase!</p>
      <a class="btn" href="https://bulkify-web.netlify.app/">Back to Dashboard</a>
    </div>
  </div>

  <footer>
    &copy; ${new Date().getFullYear()} bulkify. All rights reserved.
  </footer>

</body>
</html>
`;

