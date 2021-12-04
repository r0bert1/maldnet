
export interface Bid {
	itemId: string,
	userId: string,
	amount: number,
	timestamp: Date
}

export interface Item {
	id: string,
	name: string,
	description: string,
	startAmount: number,
	seller: string,
	currentBid: Bid
}