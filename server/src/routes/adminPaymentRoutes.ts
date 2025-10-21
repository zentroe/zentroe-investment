import { Router } from 'express';
import {
  getPaymentConfig,
  updatePaymentConfig,
  getCryptoWallets,
  createCryptoWallet,
  updateCryptoWallet,
  deleteCryptoWallet,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getAllDeposits,
  updateDepositStatus,
  updateDepositDate,
  deleteDeposit,
  startInvestmentFromDeposit,
  getAllCardPayments,
  updateCardPaymentStatus,
  getAllPayments,
  getAllCryptoPayments,
  getAllBankTransferPayments,
  updatePaymentStatus,
  getCryptoPayments,
  updateCryptoPaymentStatus
} from '../controllers/adminPaymentController';
import { adminRequestCardPaymentOtp } from '../controllers/simpleCardPaymentController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = Router();

// All admin payment routes require authentication
router.use(authenticateAdmin);

// Payment configuration routes
router.get('/config', getPaymentConfig);
router.put('/config', updatePaymentConfig);

// Crypto wallet management routes
router.get('/crypto-wallets', getCryptoWallets);
router.post('/crypto-wallets', createCryptoWallet);
router.put('/crypto-wallets/:id', updateCryptoWallet);
router.delete('/crypto-wallets/:id', deleteCryptoWallet);

// Bank account management routes
router.get('/bank-accounts', getBankAccounts);
router.post('/bank-accounts', createBankAccount);
router.put('/bank-accounts/:id', updateBankAccount);
router.delete('/bank-accounts/:id', deleteBankAccount);

// Deposit management routes
router.get('/deposits', getAllDeposits);
router.put('/deposits/:id/status', updateDepositStatus);
router.put('/deposits/:id/date', updateDepositDate);
router.delete('/deposits/:id', deleteDeposit);
router.post('/deposits/:id/start-investment', startInvestmentFromDeposit);

// Card payment management routes
router.get('/card-payments', getAllCardPayments);
router.put('/card-payments/:id/status', updateCardPaymentStatus);

// New payment system routes
router.get('/payments', getAllPayments);
router.get('/crypto', getAllCryptoPayments);
router.get('/bank-transfers', getAllBankTransferPayments);
// Specific routes must come before generic ones
router.put('/crypto/:paymentId/status', updateCryptoPaymentStatus);
router.put('/:id/status', updatePaymentStatus);
router.post('/card-payments/:paymentId/request-otp', adminRequestCardPaymentOtp);

export default router;
