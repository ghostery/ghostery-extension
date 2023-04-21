import './setup.js';
import { assertEquals } from 'https://deno.land/std@0.184.0/testing/asserts.ts';
import { describe, it } from 'https://deno.land/std@0.184.0/testing/bdd.ts';
import { observe } from '../../src/store/options.js';

describe('store/options', () => {
  describe('#observe', () => {
    it('test', async () => {
      let called = false;
      await observe('term', () => {
        called = true;
      });
      assertEquals(called, true);
    });
  });
});
