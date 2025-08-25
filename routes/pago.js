// routes/pago.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Configuración de Izipay
const IZIPAY_API_URL = "https://api.izi-pay.com/v1/payments"; // URL de la API de Izipay
const IZIPAY_API_KEY = "YOUR_API_KEY";
const IZIPAY_MERCHANT_CODE = "5460451";

router.post("/izipay", async (req, res) => {
  const { cardNumber, cardExpiry, cardCVC, amount } = req.body;

  try {
    // Crear la solicitud de pago a Izipay
    const response = await axios.post(
      IZIPAY_API_URL,
      {
        merchantCode: IZIPAY_MERCHANT_CODE,
        amount: amount * 100, // Izipay espera el monto en centavos
        currency: "PEN", // Moneda en soles peruanos
        cardNumber,
        cardExpiry,
        cardCVC,
      },
      {
        headers: {
          Authorization: `Bearer ${IZIPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si el pago fue exitoso
    if (response.data.status === "success") {
      res.json({ success: true, transactionId: response.data.transactionId });
    } else {
      res.status(400).json({ success: false, error: response.data.message });
    }
  } catch (error) {
    console.error("Error al procesar el pago con Izipay:", error);
    res.status(500).json({ success: false, error: "Hubo un error al procesar el pago." });
  }
});

module.exports = router;