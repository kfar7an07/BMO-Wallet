export const truncateWalletAddress = (
  address: string,
  end: number = 5,
  offset: number = 4
): string => {
  return `${address.slice(0, end)}...${address.slice(
    address.length - offset,
    address.length
  )}`;
};
