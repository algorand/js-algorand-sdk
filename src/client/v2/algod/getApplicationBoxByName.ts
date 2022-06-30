import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class GetApplicationBoxByName extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/applications/${this.index}/box`;
  }

  // name sets the box name in base64 encoded format.
  name(name: Uint8Array) {
    // Encode query in base64 format and append the encoding prefix.
    let encodedName = Buffer.from(name).toString('base64');
    encodedName = `b64:${encodedName}`;
    this.query.name = encodeURI(encodedName);
    return this;
  }
}
