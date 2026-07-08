import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 min default; individual keys can override

export default cache;