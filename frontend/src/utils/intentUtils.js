export const getIntentStatus = (intents, productId, storeId) => {
  if (!intents || !Array.isArray(intents)) {
    return { hasAny: false, types: [] };
  }
  
  const productIntents = intents.filter(
    intent => 
      intent.productId?._id === productId && 
      intent.storeId?._id === storeId
  );
  
  const types = productIntents.map(intent => intent.intentType);
  
  return {
    hasAny: productIntents.length > 0,
    types,
    hasReserve: types.includes("RESERVE"),
    hasPriceDrop: types.includes("PRICE_DROP"),
    hasStockChange: types.includes("STOCK_CHANGE"),
    intents: productIntents
  };
};