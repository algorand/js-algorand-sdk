/* eslint-env mocha */
import assert from 'assert';
import { AlgodClient } from '../src/client/v2/algod/algod.js';
import {
  waitForConfirmation,
  TransactionRejectedError,
  TransactionConfirmationTimeoutError,
} from '../src/main.js';

const txid = 'test-transaction';
type Pending = { confirmedRound?: bigint; poolError: string };

// Only the three async methods consumed by waitForConfirmation are replaced.
function createClient({
  pending = async () => ({ poolError: '' }),
  status = async () => ({ lastRound: 100n }),
  afterBlock = async () => ({}),
}: {
  pending?: () => Promise<Pending>;
  status?: () => Promise<{ lastRound: bigint }>;
  afterBlock?: (round: bigint) => Promise<unknown>;
} = {}): AlgodClient {
  return {
    status: () => ({ do: status }),
    pendingTransactionInformation: () => ({ do: pending }),
    statusAfterBlock: (round: bigint) => ({ do: () => afterBlock(round) }),
  } as unknown as AlgodClient;
}

describe('waitForConfirmation', () => {
  it('returns a confirmed transaction unchanged', async () => {
    const confirmed = { poolError: '', confirmedRound: 101n };
    const client = createClient({ pending: async () => confirmed });
    assert.strictEqual(await waitForConfirmation(client, txid, 3), confirmed);
  });

  it('distinguishes a pool rejection and exposes its details', async () => {
    const poolError = 'overspend';
    const client = createClient({ pending: async () => ({ poolError }) });
    await assert.rejects(
      waitForConfirmation(client, txid, 3),
      (error: unknown) => {
        assert(error instanceof Error);
        assert(error instanceof TransactionRejectedError);
        assert(!(error instanceof TransactionConfirmationTimeoutError));
        assert.strictEqual(error.name, 'TransactionRejectedError');
        assert.strictEqual(error.message, `Transaction Rejected: ${poolError}`);
        assert.strictEqual(error.txid, txid);
        assert.strictEqual(error.poolError, poolError);
        return true;
      }
    );
  });

  it('distinguishes a confirmation timeout without claiming rejection', async () => {
    const rounds: bigint[] = [];
    const client = createClient({
      afterBlock: async (round) => {
        rounds.push(round);
      },
    });
    await assert.rejects(
      waitForConfirmation(client, txid, 2),
      (error: unknown) => {
        assert(error instanceof Error);
        assert(error instanceof TransactionConfirmationTimeoutError);
        assert(!(error instanceof TransactionRejectedError));
        assert.strictEqual(error.name, 'TransactionConfirmationTimeoutError');
        assert.strictEqual(
          error.message,
          'Transaction not confirmed after 2 rounds'
        );
        assert.strictEqual(error.txid, txid);
        assert.strictEqual(error.waitRounds, 2);
        return true;
      }
    );
    assert.deepStrictEqual(rounds, [101n, 102n]);
  });

  it('times out immediately when zero rounds were requested', async () => {
    let polled = false;
    const client = createClient({
      pending: async () => {
        polled = true;
        return { poolError: '' };
      },
    });
    await assert.rejects(waitForConfirmation(client, txid, 0), {
      name: 'TransactionConfirmationTimeoutError',
    });
    assert.strictEqual(polled, false);
  });

  it('propagates an initial status failure unchanged', async () => {
    const networkError = new Error('network unavailable');
    const client = createClient({
      status: async () => {
        throw networkError;
      },
    });
    await assert.rejects(
      waitForConfirmation(client, txid, 3),
      (error: unknown) => error === networkError
    );
  });

  it('propagates a statusAfterBlock failure unchanged', async () => {
    const networkError = new Error('connection reset');
    const client = createClient({
      afterBlock: async () => {
        throw networkError;
      },
    });
    await assert.rejects(
      waitForConfirmation(client, txid, 3),
      (error: unknown) => error === networkError
    );
  });

  it('continues after a transient pending-transaction lookup failure', async () => {
    let calls = 0;
    const confirmed = { poolError: '', confirmedRound: 102n };
    const client = createClient({
      pending: async () => {
        calls += 1;
        if (calls === 1)
          throw Object.assign(new Error('not found'), { status: 404 });
        return confirmed;
      },
    });
    assert.strictEqual(await waitForConfirmation(client, txid, 3), confirmed);
    assert.strictEqual(calls, 2);
  });
});
