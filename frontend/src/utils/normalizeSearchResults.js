export const normalizeSearchResults = (data) => {
  return data.map((item, index) => ({
    id: `${item.storeName}-${index}`,
    image: item.productImage ? item.productImage[0] : null,
    name: item.storeName,
    phone: item.phone,
    address: item.address,
    distance: item.distance,

    latitude: item.location.coordinates[1],
    longitude: item.location.coordinates[0],

    product: {
      name: item.productName,
      productCategory: item.productCategory,
      price: item.price,
      stock: item.stock,
    },
  }));
};
