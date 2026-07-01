const UNAVAILABLE = { error: { message: 'Database not available' } };

function chain(prefix = '') {
  return new Proxy(() => {}, {
    get(_, prop) {
      if (prop === 'then') return undefined;
      return chain(`${prefix}.${String(prop)}`);
    },
    apply(_, __, args) {
      return Promise.resolve(UNAVAILABLE);
    },
  });
}

const db = chain();

module.exports = db;
module.exports.getSupabase = () => { throw new Error('Supabase is not configured'); };
