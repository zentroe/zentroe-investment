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
  getAllCardPayments,
  updateCardPaymentStatus
} from '../controllers/adminPaymentController';
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

// Card payment management routes
router.get('/card-payments', getAllCardPayments);
router.put('/card-payments/:id/status', updateCardPaymentStatus);

export default router;
