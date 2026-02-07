export const normalizeSearchResults = (data) => {
  return data.map((item, index) => ({
    id: `${item.storeName}-${item.productName}-${index}`,
    productId: item.productId, // ADD PRODUCT ID HERE
    image: item.productImage ? item.productImage[0] : null,
    name: item.storeName,
    phone: item.phone,
    address: item.address,
    distance: item.distance,

    latitude: item.location.coordinates[1],
    longitude: item.location.coordinates[0],

    product: {
      id: item.productId, // ADD PRODUCT ID HERE TOO
      name: item.productName,
      productCategory: item.productCategory,
      price: item.price,
      stock: item.stock,
    },
  }));
};
