// import { HTTPClient } from '../client.js';
// import IntDecoding from '../../types/intDecoding.js';

// /**
//  * Base abstract class for JSON requests.
//  *
//  * Data: The type returned from the `do()` method
//  *
//  * Body: The structure of the response's body
//  */
// export default abstract class HTTPRequest {
//   private c: HTTPClient;
//   private queryParameters: Record<string, any>;

//   /**
//    * @param client - HTTPClient object.
//    */
//   constructor(client: HTTPClient) {
//     this.c = client;
//     this.queryParameters = {};
//   }

//   /**
//    * @returns The path of this request.
//    * @category HTTPRequest
//    */
//   abstract path(): string;

//   /**
//    * Execute the request.
//    * @param headers - Additional headers to send in the request. Optional.
//    * @returns A promise which resolves to the parsed response data.
//    * @category HTTPRequest
//    */
//   async execute(headers: Record<string, any> = {}): Promise<Uint8Array> {
//     const res = await this.c.get({
//       relativePath: this.path(),
//       parseBody: false,
//       jsonOptions: { intDecoding: IntDecoding.BIGINT },
//       query: this.queryParameters,
//       requestHeaders: headers,
//     });
//     return res.body;
//   }
// }
