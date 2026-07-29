// controllers/paymentController.js
const paymentService = require('../services/paymentService');

class PaymentController {
    async handleCreatePayment(req, res) {
        try {
            const { orderId, amount, type, bank, customerInfo } = req.body;
            const tenantId = req.headers['x-tenant-id'];

            if (!tenantId) return res.status(400).json({ error: 'Tenant ID wajib' });
            if (!orderId || !amount) return res.status(400).json({ error: 'Data tidak lengkap' });

            let result;
            if (type === 'QRIS') {
                result = await paymentService.createQrisTransaction(orderId, amount, customerInfo);
            } else if (type === 'VA') {
                result = await paymentService.createVirtualAccountTransaction(orderId, amount, bank);
            } else {
                return res.status(400).json({ error: 'Metode pembayaran tidak valid' });
            }

            res.status(201).json({ ...result, tenantId });
        } catch (err) {
            res.status(500).json({ error: 'Gagal buat transaksi', details: err.message });
        }
    }

    async handleWebhook(req, res) {
        try {
            const signature = req.headers['x-payment-signature'];
            const payload = req.body;

            if (!paymentService.verifyWebhookSignature(payload, signature)) {
                return res.status(403).json({ error: 'Signature tidak valid' });
            }

            // Update status transaksi di Turso DB
            console.log('Webhook diterima:', payload.orderId);
            res.status(200).json({ status: 'success' });
        } catch (err) {
            res.status(500).json({ error: 'Webhook gagal diproses' });
        }
    }
}

module.exports = new PaymentController();