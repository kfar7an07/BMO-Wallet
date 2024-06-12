import { useState, useEffect } from "react";
import { FlatList } from "react-native";
import { router } from "expo-router";
import styled, { useTheme } from "styled-components/native";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store";
import type { AddressState } from "../../../store/walletSlice";
import { setActiveAccount } from "../../../store/walletSlice";
import { ROUTES } from "../../../constants/routes";
import { ThemeType } from "../../../styles/theme";
import RightArrowIcon from "../../../assets/svg/right-arrow.svg";
import PhraseIcon from "../../../assets/svg/phrase.svg";
import EditIcon from "../../../assets/svg/edit.svg";
import { SafeAreaContainer } from "../../../components/Styles/Layout.styles";
import Button from "../../../components/Button/Button";

const ContentContainer = styled.View<{ theme: ThemeType }>`
  flex: 1;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const WalletContainer = styled.TouchableOpacity<{
  theme: ThemeType;
  isLast: boolean;
  isActiveAccount: boolean;
}>`
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme, isActiveAccount }) =>
    isActiveAccount ? "rgba(136, 120, 244, 0.3)" : theme.colors.lightDark};
  padding: ${({ theme }) => theme.spacing.medium};
  border-bottom-left-radius: ${({ theme, isLast }) =>
    isLast ? theme.borderRadius.large : "0px"};
  border-bottom-right-radius: ${({ theme, isLast }) =>
    isLast ? theme.borderRadius.large : "0px"};
  border: 1px solid
    ${({ theme, isActiveAccount }) =>
      isActiveAccount ? "rgba(136, 120, 244, 0.6)" : theme.colors.dark};
`;

const AccountDetails = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const EditIconContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
`;

const WalletPhraseContainer = styled.TouchableOpacity<{ theme: ThemeType }>`
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.primary};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const SectionTitle = styled.Text<{ theme: ThemeType }>`
  color: ${(props) => props.theme.fonts.colors.primary};
  font-family: ${(props) => props.theme.fonts.families.openBold};
  font-size: ${(props) => props.theme.fonts.sizes.large};
  margin-left: ${({ theme }) => theme.spacing.medium};
  text-align: left;
`;

const AccountTitle = styled.Text<{ theme: ThemeType }>`
  color: ${(props) => props.theme.fonts.colors.primary};
  font-family: ${(props) => props.theme.fonts.families.openBold};
  font-size: ${(props) => props.theme.fonts.sizes.large};
  margin-left: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.tiny};
  text-align: left;
`;

const PriceText = styled.Text<{ theme: ThemeType }>`
  color: ${(props) => props.theme.colors.lightGrey};
  font-family: ${(props) => props.theme.fonts.families.openBold};
  font-size: ${(props) => props.theme.fonts.sizes.normal};
  margin-left: ${({ theme }) => theme.spacing.medium};
  text-align: left;
`;

const PhraseTextContent = styled.View`
  display: flex;
  flex-direction: row;
`;

interface WalletPairs {
  id: string;
  accountName: string;
  isActiveAccount: boolean;
  walletDetails: {
    ethereum: AddressState | {};
    solana: AddressState | {};
  };
}

function compileInactiveAddresses(
  ethAcc: AddressState[],
  solAcc: AddressState[],
  activeEthAddress: string,
  activeSolAddress: string
) {
  const mergedWalletPairs: WalletPairs[] = [];
  const highestAccAmount = Math.max(ethAcc.length, solAcc.length);

  for (let i = 0; i < highestAccAmount; i++) {
    const isActiveAccount =
      ethAcc[i].address === activeEthAddress &&
      solAcc[i].address === activeSolAddress;
    mergedWalletPairs.push({
      id: `${i}-${ethAcc[i].address}`,
      accountName: ethAcc[i]?.accountName || solAcc[i].accountName,
      isActiveAccount,
      walletDetails: {
        ethereum: ethAcc[i] ?? {},
        solana: solAcc[i] ?? {},
      },
    });
  }

  return mergedWalletPairs;
}

const AccountsIndex = () => {
  const activeEthAddress = useSelector(
    (state: RootState) => state.wallet.ethereum.activeAddress.address
  );
  const activeSolAddress = useSelector(
    (state: RootState) => state.wallet.solana.activeAddress.address
  );
  const ethAccounts = useSelector(
    (state: RootState) => state.wallet.ethereum.inactiveAddresses
  );
  const solAccounts = useSelector(
    (state: RootState) => state.wallet.solana.inactiveAddresses
  );

  const theme = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState(
    compileInactiveAddresses(
      ethAccounts,
      solAccounts,
      activeEthAddress,
      activeSolAddress
    )
  );

  const walletSetup = async () => {
    setLoading(true);
  };

  const setNextActiveAccounts = (
    ethereum: AddressState,
    solana: AddressState
  ) => {
    const nextActiveAddress = {
      solana,
      ethereum,
    };

    dispatch(setActiveAccount(nextActiveAddress));
  };

  const renderItem = ({ item, index }) => {
    return (
      <WalletContainer
        onPress={() =>
          setNextActiveAccounts(
            item.walletDetails.ethereum,
            item.walletDetails.solana
          )
        }
        isActiveAccount={item.isActiveAccount}
        isLast={index === accounts.length - 1}
      >
        <AccountDetails>
          <AccountTitle>{item.accountName}</AccountTitle>
          <PriceText>$0.00</PriceText>
        </AccountDetails>
        <EditIconContainer>
          <EditIcon width={20} height={20} fill={theme.colors.white} />
        </EditIconContainer>
      </WalletContainer>
    );
  };

  useEffect(() => {
    if (activeEthAddress && activeSolAddress) {
      setAccounts(
        compileInactiveAddresses(
          ethAccounts,
          solAccounts,
          activeEthAddress,
          activeSolAddress
        )
      );
    }
  }, [activeEthAddress, activeSolAddress]);

  return (
    <>
      <SafeAreaContainer>
        <ContentContainer>
          <FlatList
            ListHeaderComponent={
              <WalletPhraseContainer
                onPress={() =>
                  router.push({
                    pathname: ROUTES.seedPhrase,
                    params: { readOnly: "true" },
                  })
                }
              >
                <PhraseTextContent>
                  <PhraseIcon
                    width={25}
                    height={25}
                    fill={theme.colors.white}
                  />
                  <SectionTitle>Secret Recovery Phrase</SectionTitle>
                </PhraseTextContent>
                <RightArrowIcon
                  width={25}
                  height={25}
                  fill={theme.colors.white}
                />
              </WalletPhraseContainer>
            }
            data={accounts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <Button
            loading={loading}
            onPress={walletSetup}
            title="Create Wallet"
            backgroundColor={theme.colors.primary}
          />
        </ContentContainer>
      </SafeAreaContainer>
    </>
  );
};

export default AccountsIndex;
