
export interface Bid {
	itemId: string,
	userId: string,
	amount: number,
	timestamp: Date
}

export interface Item {
	_id: string,
	name: string,
	description: string,
	startAmount: number,
	seller: string,
	currentBid: Bid
}