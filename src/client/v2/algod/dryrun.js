import { Buffer } from 'buffer';
import encoding from '../../../encoding/encoding';
import { setHeaders } from './compile';

class Dryrun {
  constructor(c, dr) {
    this.c = c;
    this.blob = encoding.encode(dr.get_obj_for_encoding());
  }

  /**
   * Executes dryrun
   * @param headers, optional
   * @returns {Promise<*>}
   */
  async do(headers = {}) {
    const txHeaders = setHeaders(headers);
    const res = await this.c.post(
      '/v2/teal/dryrun',
      Buffer.from(this.blob),
      txHeaders
    );
    return res.body;
  }
}

module.exports = { Dryrun };
