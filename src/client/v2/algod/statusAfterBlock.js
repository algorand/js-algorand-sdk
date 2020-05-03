class StatusAfterBlock {
	constructor(c, round) {
		this.c = c;
		if (!Number.isInteger(round)) throw Error("round should be an integer");
		this.round = round;
	}

	/**
	 * waits for round roundNumber to occur then returns the StatusResponse for this round.
	 * This call blocks
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}){
		let res = await this.c.get("/v2/status/wait-for-block-after/" + this.round, {}, headers);
		return res.body;
	};
}

module.exports = { StatusAfterBlock };
