export interface RecipientDetails {
	recipientWalletId?: string;
	recipientMpesaNumber?: string;
}

interface WalletUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
}

export interface WalletTransaction {
	_id: string;
	walletId: WalletUser | null;
	transactionType:  string;
	amount: number;
	transactionId: string;
	transactionDate: string;
	status:  string;
	recipientDetails: RecipientDetails;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedWalletTransactions {
	data: WalletTransaction[];
	total: number;
	page: number;
	limit: number;
}




export interface PaymentTransaction {
	_id: string;
	employee: string;
	transactionType: 'paybill' | string;
	amount: number;
	phoneNumber: string;
	accountReference: string;
	status: 'completed' | 'pending' | 'failed' | string;
	merchantRequestId: string;
	checkoutRequestId: string;
	responseCode: string;
	responseDescription: string;
	customerMessage: string;
	callbackStatus: string;
	createdAt: string;
	updatedAt: string;
	transactionId: string;
	callbackPhoneNumber: string;
	confirmedAmount: number;
	mpesaReceiptNumber: string;
	resultCode: string;
	resultDesc: string;
	transactionDate: string;
	receiverPartyPublicName?:string

}

export interface PaginatedWalletTransactions {
	data: WalletTransaction[];
	total: number;
	page: number;
	limit: number;
}

export interface PaginatedPaymentTransactions {
	data: PaymentTransaction[];
	total: number;
	page: number;
	limit: number;
}
