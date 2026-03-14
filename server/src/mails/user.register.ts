export const registrationSuccessEmailBody = (userData: any) => `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          color: #777;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .code {
          font-size: 32px;
          font-weight: 700;
          color: #007bff;
          text-align: center;
          margin: 20px 0;
          letter-spacing: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome!</h1>
        <p>Hello ${userData?.user?.name},</p>
        <p>Thank you for registering. To activate your account, please use the following activation code:</p>
        <div class="code">${userData?.activationCode}</div>
        <p>Please enter this code on the verification screen within the next 3 minutes.</p>
        <p>If you didn't register, please ignore this email.</p>
      </div>
    </body>
  </html>
`;
