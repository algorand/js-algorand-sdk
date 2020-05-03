class RegisterParticipationKeys {
	constructor(c, account) {
		this.c = c;
		this.account = account;
		this.registerParams = {};
	}

	/**
	 * creates and issues a partkey registration for the passed addr
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.post("/v2/register-participation-keys/"+this.account, Buffer.from(this.registerParams), headers);
		return res.body;
	}

	fee(fee) {
		this.registerParams["fee"] = fee;
		return this;
	}

	dilution(dil) {
		this.registerParams["key-dilution"] = dil;
		return this;
	}

	lastValid(last) {
		this.registerParams["round-last-valid"] = last;
		return this;
	}

	noWait(nowait) {
		this.registerParams["no-wait"] = nowait;
		return this;
	}
}

module.exports = { RegisterParticipationKeys };
